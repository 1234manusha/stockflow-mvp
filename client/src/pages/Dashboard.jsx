
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard")
      .then((response) => setData(response.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load dashboard");
      });
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (error) {
    return <main className="page"><p className="error">{error}</p>
      <button onClick={logout}>Log out</button></main>;
  }

  if (!data) return <main className="page">Loading dashboard...</main>;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>StockFlow Dashboard</h1>
          <p>Overview of your inventory</p>
        </div>
        <button onClick={logout}>Log out</button>
      </header>

      <nav className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/products">Products</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      <section className="summary-grid">
        <article className="summary-card">
          <p>Total Products</p>
          <h2>{data.totalProducts}</h2>
        </article>

        <article className="summary-card">
          <p>Total Units in Stock</p>
          <h2>{data.totalStock}</h2>
        </article>

        <article className="summary-card">
          <p>Low-Stock Products</p>
          <h2>{data.lowStockItems.length}</h2>
        </article>
      </section>

      <section className="panel">
        <h2>Low-Stock Items</h2>

        {data.lowStockItems.length === 0 ? (
          <p>No low-stock products. Your inventory looks good!</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockItems.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.quantity}</td>
                    <td>{product.effectiveThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/products">Manage products →</Link>
      </section>
    </main>
  );
}
