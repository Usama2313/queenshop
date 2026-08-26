const express = require("express");
const Message = require("../models/Message");
const Product = require("../models/Product");
const User = require("../models/User");
const { auth } = require("./authRoutes");

const router = express.Router();

// Submit a message / complaint / offer / event (guest or authenticated)
router.post("/send", async (req, res) => {
    try {
        const { senderName, senderEmail, senderPhone, category, subject, content, productId } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        let senderId = null;

        // Try getting logged in user id if Authorization header is supplied
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (token) {
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "best_store_luxury_fallback_key");
                const user = await User.findByPk(decoded.id);
                if (user) {
                    senderId = user.id;
                }
            } catch (e) {
                // Ignore token errors for submission, allow guest submission
            }
        }

        // Validate categories matching Screenshot 2
        const validCategories = ["COMPLAINTS", "OFFERS", "EVENTS"];
        const messageCategory = validCategories.includes(category?.toUpperCase())
            ? category.toUpperCase()
            : "COMPLAINTS";

        // Only Admin can create Offers or Events
        if (messageCategory === "OFFERS" || messageCategory === "EVENTS") {
            if (!token) return res.status(401).json({ message: "Unauthorized. Admin access required for this category." });
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "best_store_luxury_fallback_key");
                const user = await User.findByPk(decoded.id);
                if (!user || user.role !== "Admin") {
                    return res.status(403).json({ message: "Forbidden. Only Admins can create Offers or Events." });
                }
            } catch (err) {
                return res.status(401).json({ message: "Invalid token." });
            }
        }

        const message = await Message.create({
            senderId,
            senderName: senderName || "Guest User",
            senderEmail,
            senderPhone,
            category: messageCategory,
            subject,
            content,
            productId: productId || null,
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all complaints/messages for current logged-in user
router.get("/my-messages", auth, async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { senderId: req.user.id },
            include: [{ model: Product, as: "product", attributes: ["id", "title", "price"] }],
            order: [["createdAt", "DESC"]],
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN: GET all store messages/complaints
router.get("/admin/all", auth, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const messages = await Message.findAll({
            include: [
                { model: Product, as: "product", attributes: ["id", "title", "price"] },
                { model: User, as: "sender", attributes: ["id", "name", "email", "phone"] },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN: REPLY / RESOLVE message
router.put("/admin/:id", auth, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const { replyContent, isResolved } = req.body;

        await message.update({
            replyContent: replyContent !== undefined ? replyContent : message.replyContent,
            isResolved: isResolved !== undefined ? !!isResolved : message.isResolved,
        });

        res.json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN: DELETE message
router.delete("/admin/:id", auth, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        await message.destroy();
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
