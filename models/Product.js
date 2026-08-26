const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false, // 'Clothes', 'Watches', 'Shoes', 'Beauty Care'
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: "BD", // Bahraini Dinar as shown in the Burger Queen screenshots
        },
        image: {
            type: DataTypes.TEXT, // Supports URL or base64
            allowNull: true,
        },
        gallery: {
            type: DataTypes.TEXT, // JSON array string
            defaultValue: "[]",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isBestProduct: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // The 'best' product section flag
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isHidden: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "best_products", // Isolated table name to protect BabaHoms
        timestamps: true,
    }
);

module.exports = Product;
