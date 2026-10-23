
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  quantity: 0,
  cost_price: "",
  selling_price: "",
  low_stock_threshold: ""
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultThreshold, setDefaultThreshold] = useState(5);

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products");
    }
  }

 
useEffect(() => {
  loadProducts();

  api.get("/settings")
    .then((response) => {
      setDefaultThreshold(
        Number(response.data.default_low_stock_threshold)
      );
    })
    .catch((err) => {
      console.error("Unable to load stock settings:", err);
    });
}, []);


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        cost_price: form.cost_price === "" ? null : Number(form.cost_price),
        selling_price: form.selling_price === "" ? null : Number(form.selling_price),
        low_stock_threshold:
          form.low_stock_threshold === ""
            ? null
            : Number(form.low_stock_threshold)
      };

      if (editingId !== null) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      quantity: product.quantity,
      cost_price: product.cost_price ?? "",
      selling_price: product.selling_price ?? "",
      low_stock_threshold: product.low_stock_threshold ?? ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      if (editingId === id) resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product");
    }
  }

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.sku}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory</p>
        </div>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>{editingId !== null ? "Edit Product" : "Add Product"}</h2>

        <form onSubmit={handleSubmit} className="product-form">
          <label>
            Product Name *
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            SKU *
            <input name="sku" value={form.sku} onChange={handleChange} required />
          </label>

          <label>
            Quantity *
            <input
              type="number"
              min="0"
              step="1"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Cost Price
            <input
              type="number"
              min="0"
              step="0.01"
              name="cost_price"
              value={form.cost_price}
              onChange={handleChange}
            />
          </label>

          <label>
            Selling Price
            <input
              type="number"
              min="0"
              step="0.01"
              name="selling_price"
              value={form.selling_price}
              onChange={handleChange}
            />
          </label>

          <label>
            Low-Stock Threshold
            <input
              type="number"
              min="0"
              step="1"
              name="low_stock_threshold"
              value={form.low_stock_threshold}
              onChange={handleChange}
              placeholder="Use default"
            />
          </label>

          <label className="full-width">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="form-actions full-width">
            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId !== null
                  ? "Save Changes"
                  : "Add Product"}
            </button>

            {editingId !== null && (
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Product List ({products.length})</h2>

        <input
          className="search-input"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Selling Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const threshold =
                  product.low_stock_threshold == null
                    ? defaultThreshold
                    : Number(product.low_stock_threshold);

                const lowStock = Number(product.quantity) <= threshold;

                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.quantity}</td>
                    <td>
                      {product.selling_price == null
                        ? "—"
                        : `₹${Number(product.selling_price).toFixed(2)}`}
                    </td>
                    <td>
                      <span className={lowStock ? "status-low" : "status-ok"}>
                        {lowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => startEdit(product)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
