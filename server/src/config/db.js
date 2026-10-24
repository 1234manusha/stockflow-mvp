


const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync("/etc/secrets/ca.pem", "utf8"),
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000
});

module.exports = pool;
