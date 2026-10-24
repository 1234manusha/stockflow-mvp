const express = require("express");

const express = require("express");
const cors = require("cors");

const app = express();

const {
  notFoundHandler,
  errorHandler
} = require("./middleware/errorMiddleware");

app.use(cors());
app.use(express.json());

// Homepage
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StockFlow API is running"
  });
});

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StockFlow API is healthy"
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
