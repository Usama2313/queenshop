const express = require("express");
const { Op } = require("sequelize");
const Product = require("../models/Product");
const ProductView = require("../models/ProductView");
const { auth } = require("./authRoutes");

const router = express.Router();

// GET all products with dynamic search, category filter, best items, price filter
router.get("/", async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, isBest, isFeatured, limit = 40, page = 1 } = req.query;

        const where = { isHidden: { [Op.not]: true } };

        if (category) {
            where.category = category;
        }

        if (isBest === "true") {
            where.isBestProduct = true;
        }

        if (isFeatured === "true") {
            where.isFeatured = true;
        }

        if (minPrice || maxPrice) {
            where.price = {
                [Op.between]: [parseFloat(minPrice) || 0, parseFloat(maxPrice) || 9999999],
            };
        }

        if (search) {
            const isPostgres = Product.sequelize.getDialect() === "postgres";
            const likeOp = isPostgres ? Op.iLike : Op.like;

            where[Op.or] = [
                { title: { [likeOp]: `%${search}%` } },
                { description: { [likeOp]: `%${search}%` } },
                { brand: { [likeOp]: `%${search}%` } },
            ];
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const offset = (pageNumber - 1) * limitNumber;

        const totalCount = await Product.count({ where });
        const products = await Product.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: limitNumber,
            offset,
        });

        res.json({
            data: products,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalProducts: totalCount,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single product by id with unique 24h view tracking (like BabaHoms)
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product || product.isHidden) {
            return res.status(404).json({ message: "Product not found" });
        }

        // View tracking logic (24h unique views)
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        let userId = null;

        // Try parsing user token from Auth header if present, but do not block guests
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (token) {
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "best_store_luxury_fallback_key");
                userId = decoded.id;
            } catch (e) {
                // invalid token, treat as guest
            }
        }

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const viewWhere = {
            productId: product.id,
            createdAt: { [Op.gt]: twentyFourHoursAgo },
        };

        if (userId) {
            viewWhere.userId = userId;
        } else {
            viewWhere.ipAddress = ip;
            viewWhere.userId = null;
        }

        const existingView = await ProductView.findOne({ where: viewWhere });

        if (!existingView) {
            await product.increment("views");
            await ProductView.create({
                productId: product.id,
                userId,
                ipAddress: ip,
            });
            await product.reload(); // get fresh view count
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN: CREATE product
router.post("/", auth, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const { title, category, price, currency, image, gallery, description, isBestProduct, isFeatured, brand, stock } = req.body;

        if (!title || !category || !price) {
            return res.status(400).json({ message: "Title, category, and price are required." });
        }

        const product = await Product.create({
            title,
            category,
            price: parseFloat(price),
            currency: currency || "BD",
            image,
            gallery: gallery || "[]",
            description,
            isBestProduct: !!isBestProduct,
            isFeatured: !!isFeatured,
            brand,
            stock: stock !== undefined ? parseInt(stock) : 50,
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN: UPDATE product
router.put("/:id", auth, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const { title, category, price, currency, image, gallery, description, isBestProduct, isFeatured, brand, stock, isHidden } = req.body;

        await product.update({
            title: title !== undefined ? title : product.title,
            category: category !== undefined ? category : product.category,
            price: price !== undefined ? parseFloat(price) : product.price,
            currency: currency !== undefined ? currency : product.currency,
            image: image !== undefined ? image : product.image,
            gallery: gallery !== undefined ? gallery : product.gallery,
            description: description !== undefined ? description : product.description,
            isBestProduct: isBestProduct !== undefined ? !!isBestProduct : product.isBestProduct,
            isFeatured: isFeatured !== undefined ? !!isFeatured : product.isFeatured,
            brand: brand !== undefined ? brand : product.brand,
            stock: stock !== undefined ? parseInt(stock) : product.stock,
            isHidden: isHidden !== undefined ? !!isHidden : product.isHidden,
        });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN: DELETE product
router.delete("/:id", auth, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await product.destroy();
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
