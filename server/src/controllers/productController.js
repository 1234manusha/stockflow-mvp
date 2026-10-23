
const db = require("../config/db");

// GET: List products belonging to the logged-in organization

    
exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.execute(
      `SELECT * FROM products
       WHERE organization_id = ?
       ORDER BY id DESC`,
      [req.user.organizationId]
    );

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: products
    });
  } catch (error) {
    console.error("Fetch products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products right now. Please try again.",
      code: "PRODUCT_FETCH_FAILED"
    });
  }
};



// POST: Create a product
exports.createProduct = async (req, res) => {
  const {
    name,
    sku,
    description,
    quantity,
    cost_price,
    selling_price,
    low_stock_threshold
  } = req.body;

  if (!name || !name.trim() || !sku || !sku.trim()) {
    return res.status(400).json({
      message: "Product name and SKU are required"
    });
  }

  const qty = quantity === undefined ? 0 : Number(quantity);

  if (!Number.isInteger(qty) || qty < 0) {
    return res.status(400).json({
      message: "Quantity must be a non-negative integer"
    });
  }

  for (const price of [cost_price, selling_price]) {
    if (price != null &&
        (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({
        message: "Prices must be non-negative numbers"
      });
    }
  }

  if (
    low_stock_threshold != null &&
    (!Number.isInteger(Number(low_stock_threshold)) ||
      Number(low_stock_threshold) < 0)
  ) {
    return res.status(400).json({
      message: "Low-stock threshold must be a non-negative integer"
    });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO products
       (organization_id, name, sku, description, quantity,
        cost_price, selling_price, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.organizationId,
        name.trim(),
        sku.trim(),
        description || null,
        qty,
        cost_price === "" || cost_price == null ? null : Number(cost_price),
        selling_price === "" || selling_price == null ? null : Number(selling_price),
        low_stock_threshold == null || low_stock_threshold === ""
          ? null
          : Number(low_stock_threshold)
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId
    });
  } 
    catch(error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This SKU already exists. Please use a different SKU.",
        code: "DUPLICATE_SKU"
      });
    }

    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the product due to a server error. Please try again.",
      code: "PRODUCT_CREATE_FAILED"
    });
  }
};

// PUT: Update a product
exports.updateProduct = async (req, res) => {
  const {
    name,
    sku,
    description,
    quantity,
    cost_price,
    selling_price,
    low_stock_threshold
  } = req.body;

  const productId = Number(req.params.id);

if (!Number.isInteger(productId) || productId <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid product ID. Please provide a valid positive integer.",
    code: "INVALID_PRODUCT_ID"
  });
}

  const qty = Number(quantity);

  if (
    !name?.trim() ||
    !sku?.trim() ||
    quantity === undefined ||
    !Number.isInteger(qty) ||
    qty < 0
  ) {
    return res.status(400).json({
      message: "Valid name, SKU and non-negative integer quantity are required"
    });
  }

  for (const price of [cost_price, selling_price]) {
    if (price != null &&
        (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({
        message: "Prices must be non-negative numbers"
      });
    }
  }

  if (
    low_stock_threshold != null &&
    low_stock_threshold !== "" &&
    (!Number.isInteger(Number(low_stock_threshold)) ||
      Number(low_stock_threshold) < 0)
  ) {
    return res.status(400).json({
      message: "Low-stock threshold must be a non-negative integer"
    });
  }

  try {
    const [result] = await db.execute(
      `UPDATE products
       SET name = ?, sku = ?, description = ?, quantity = ?,
           cost_price = ?, selling_price = ?, low_stock_threshold = ?,
           updated_at = NOW()
       WHERE id = ? AND organization_id = ?`,
      [
        name.trim(),
        sku.trim(),
        description || null,
        qty,
        cost_price === "" || cost_price == null ? null : Number(cost_price),
        selling_price === "" || selling_price == null ? null : Number(selling_price),
        low_stock_threshold == null || low_stock_threshold === ""
          ? null
          : Number(low_stock_threshold),
        productId,
        req.user.organizationId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This SKU already exists in your organization"
      });
    }

    console.error(error);
    res.status(500).json({ message: "Unable to update product" });
  }
};

// DELETE: Delete a product

exports.deleteProduct = async (req, res) => {
  const productId = Number(req.params.id);

  // Validate product ID
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID. Please provide a valid positive integer.",
      code: "INVALID_PRODUCT_ID"
    });
  }

  try {
    const [result] = await db.execute(
      `DELETE FROM products
       WHERE id = ? AND organization_id = ?`,
      [productId, req.user.organizationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your organization.",
        code: "PRODUCT_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully."
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the product due to a server error. Please try again.",
      code: "PRODUCT_DELETE_FAILED"
    });
  }
};
