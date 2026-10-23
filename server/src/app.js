const express = require("express");
const cors = require("cors");

const app = express();

const {
  notFoundHandler,
  errorHandler
} = require("./middleware/errorMiddleware");

app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
const productRoutes = require("./routes/productRoutes");

app.use("/api/products", productRoutes);
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/dashboard", dashboardRoutes);
const settingsRoutes = require("./routes/settingsRoutes");

app.use("/api/settings", settingsRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StockFlow API is healthy"
  });
});
app.use(notFoundHandler);
app.use(errorHandler);

app.get("/api/health", (req, res) => {
  res.json({ message: "StockFlow API is running" });
});

module.exports = app;