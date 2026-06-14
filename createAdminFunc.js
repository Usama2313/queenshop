const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createAdmin = async () => {
    try {
        const adminEmail = "admin@queenshop.com";
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log("Admin user 'admin@queenshop.com' already exists.");
            return { status: "exists", message: "Admin user already exists." };
        }

        const hashedPassword = await bcrypt.hash("adminsecure", 10);
        await User.create({
            name: "The Queen Shop Admin",
            email: adminEmail,
            phone: "+97312345678",
            password: hashedPassword,
            role: "Admin",
        });

        console.log("Admin user seeded successfully: admin@queenshop.com / adminsecure");
        return { status: "created", message: "Admin user created successfully." };
    } catch (err) {
        console.error("Failed to seed admin:", err.message);
        throw err;
    }
};

module.exports = createAdmin;
