const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
    "Message",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Can be null for guest complaints
        },
        senderName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        senderEmail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        senderPhone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: "COMPLAINTS", // COMPLAINTS, OFFERS, EVENTS (matching tabs in Screenshot 2)
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        replyContent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isResolved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "best_messages", // Isolated table name to protect BabaHoms
        timestamps: true,
    }
);

module.exports = Message;
