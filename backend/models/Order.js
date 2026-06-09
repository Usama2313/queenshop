const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "Pending", // Pending, Processing, Shipped, Delivered, Cancelled
        },
        shippingAddress: {
            type: DataTypes.TEXT,
            allowNull: true, // simplified for now
        },
        paymentMethod: {
            type: DataTypes.STRING,
            defaultValue: "COD", // Cash on Delivery default
        },
    },
    {
        tableName: "best_orders",
        timestamps: true,
    }
);

module.exports = Order;
