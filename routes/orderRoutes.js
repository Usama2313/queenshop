const express = require("express");
const router = express.Router();
const { Order, OrderItem, Product, User } = require("../models/associations");
const jwt = require("jsonwebtoken");

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "best_store_luxury_fallback_key");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

// Place a new order
router.post("/place", verifyToken, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No items provided" });
        }

        const newOrder = await Order.create({
            userId: req.user.id,
            totalAmount,
            shippingAddress: shippingAddress || "Default Address",
            paymentMethod: paymentMethod || "COD",
            status: "Pending"
        });

        // Create order items
        const orderItemsData = items.map(item => ({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price
        }));

        await OrderItem.bulkCreate(orderItemsData);

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ error: "Failed to place order" });
    }
});

// Get user's orders
router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [{
                model: OrderItem,
                as: "items",
                include: [{
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "price", "imageMain"]
                }]
            }],
            order: [["createdAt", "DESC"]]
        });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// Admin: Get all orders
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email"]
                },
                {
                    model: OrderItem,
                    as: "items",
                    include: [{
                        model: Product,
                        as: "product",
                        attributes: ["id", "name"]
                    }]
                }
            ],
            order: [["createdAt", "DESC"]]
        });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching all orders:", err);
        res.status(500).json({ error: "Failed to fetch all orders" });
    }
});

// Admin: Update order status
router.put("/:id/status", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        order.status = status;
        await order.save();

        res.json({ message: "Order status updated", order });
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

module.exports = router;
