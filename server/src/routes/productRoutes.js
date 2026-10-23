
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

router.use(authMiddleware);

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
