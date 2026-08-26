const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductView = sequelize.define(
    "ProductView",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "best_product_views", // Isolated table name to protect BabaHoms
        timestamps: true,
    }
);

module.exports = ProductView;
