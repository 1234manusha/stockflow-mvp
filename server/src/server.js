require("dotenv").config();

const app = require("./app");
const db = require("./config/db");

async function startServer() {
  try {
    await db.query("SELECT 1");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`StockFlow server running on port ${PORT}`);
      console.log("MySQL connection successful");
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();