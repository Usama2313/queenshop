const User = require("./User");
const Product = require("./Product");
const Message = require("./Message");
const ProductView = require("./ProductView");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// User <-> Message (Complaints)
User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

// Product <-> Message
Product.hasMany(Message, { foreignKey: "productId", as: "productMessages" });
Message.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Product <-> ProductView
Product.hasMany(ProductView, { foreignKey: "productId", as: "productViews" });
ProductView.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User <-> ProductView (Optional tracking)
User.hasMany(ProductView, { foreignKey: "userId", as: "userViews" });
ProductView.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Order
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = {
    User,
    Product,
    Message,
    ProductView,
    Order,
    OrderItem
};
