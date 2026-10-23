
const db = require("../config/db");

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT default_low_stock_threshold
       FROM settings
       WHERE organization_id = ?`,
      [req.user.organizationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to fetch settings"
    });
  }
};

exports.updateSettings = async (req, res) => {
  const threshold = req.body.default_low_stock_threshold;

  if (
    !Number.isInteger(threshold) ||
    threshold < 0
  ) {
    return res.status(400).json({
      message: "Threshold must be a non-negative whole number"
    });
  }

  try {
    const [result] = await db.execute(
      `UPDATE settings
       SET default_low_stock_threshold = ?
       WHERE organization_id = ?`,
      [threshold, req.user.organizationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    res.json({
      message: "Settings updated successfully",
      default_low_stock_threshold: threshold
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to update settings"
    });
  }
};
