
const db = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const [summary] = await db.execute(
      `SELECT
         COUNT(*) AS totalProducts,
         COALESCE(SUM(quantity), 0) AS totalStock
       FROM products
       WHERE organization_id = ?`,
      [organizationId]
    );

    const [settings] = await db.execute(
      `SELECT default_low_stock_threshold
       FROM settings
       WHERE organization_id = ?`,
      [organizationId]
    );

    const defaultThreshold =
      settings.length > 0
        ? settings[0].default_low_stock_threshold
        : 5;

    const [lowStockItems] = await db.execute(
      `SELECT id, name, sku, quantity,
         COALESCE(low_stock_threshold, ?) AS effectiveThreshold
       FROM products
       WHERE organization_id = ?
         AND quantity <= COALESCE(low_stock_threshold, ?)
       ORDER BY quantity ASC`,
      [defaultThreshold, organizationId, defaultThreshold]
    );

    res.json({
      totalProducts: summary[0].totalProducts,
      totalStock: summary[0].totalStock,
      lowStockItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to load dashboard"
    });
  }
};
