const { Sequelize } = require("sequelize");
require("dotenv").config();

let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes("sslmode=")) {
    dbUrl = dbUrl.split("?")[0];
}

const sequelize = dbUrl
    ? new Sequelize(dbUrl, {
        dialect: "postgres",
        dialectModule: require("pg"),
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    })
    : new Sequelize(
        process.env.DB_NAME || "neondb",
        process.env.DB_USER || "neondb_owner",
        process.env.DB_PASSWORD || "",
        {
            host: process.env.DB_HOST || "ep-purple-hat-anq529vu-pooler.c-6.us-east-1.aws.neon.tech",
            port: process.env.DB_PORT || 5432,
            dialect: "postgres",
            dialectModule: require("pg"),
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
        }
    );

module.exports = sequelize;
