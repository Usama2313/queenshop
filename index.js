try {
    const express = require("express");
    const cors = require("cors");
    require("dotenv").config();

    const app = express();

    app.use(cors({
        origin: "*",
        credentials: true
    }));

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    // Health Route
    app.get("/", (req, res) => res.json({ message: "BEST Store Premium API is running", status: "ok" }));

    // Database Sync Route (highly useful on Vercel)
    app.get("/api/sync", async (req, res) => {
        try {
            const sequelize = require("./config/database");
            // Ensure associations are loaded before sync
            require("./models/associations");
            
            // Sync only our prefixed tables
            await sequelize.sync({ alter: true });
            res.json({ status: "ok", message: "BEST Store isolated tables initialized successfully!" });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Sync failed: " + err.message
            });
        }
    });

    // Admin Seeding Route
    app.get("/api/create-admin", async (req, res) => {
        try {
            const createAdmin = require("./createAdminFunc");
            const result = await createAdmin();
            res.json({ status: "ok", ...result });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Admin creation failed: " + err.message
            });
        }
    });

    // Healthcheck with Database Check
    app.get("/api/health", async (req, res) => {
        try {
            const sequelize = require("./config/database");
            await sequelize.authenticate();
            res.json({ status: "ok", database: "connected", time: new Date() });
        } catch (err) {
            res.status(500).json({
                status: "error",
                database: "disconnected",
                message: err.message,
                time: new Date()
            });
        }
    });

    // Mount API Routes
    app.use("/api/auth", require("./routes/authRoutes").router);
    app.use("/api/products", require("./routes/productRoutes"));
    app.use("/api/chat", require("./routes/chatRoutes"));
    app.use("/api/orders", require("./routes/orderRoutes"));

    // Lazy load associations
    require("./models/associations");

    const PORT = process.env.PORT || 5000;

    // Start server if running locally (not on Vercel)
    if (!process.env.VERCEL) {
        const sequelize = require("./config/database");
        sequelize.sync().then(() => {
            app.listen(PORT, () => {
                console.log(`BEST Backend server running on port ${PORT}`);
            });
        }).catch(err => {
            console.error("Database connection failed:", err);
        });
    }

    const serverless = require('serverless-http');
module.exports = serverless(app);

} catch (globalError) {
    console.error("CRITICAL STARTUP ERROR:", globalError);
    const express = require("express");
    const app = express();
    app.all("*", (req, res) => {
        res.status(500).json({
            error: "Critical Startup Error",
            message: globalError.message,
            stack: globalError.stack
        });
    });
    module.exports = serverless(app);
}
