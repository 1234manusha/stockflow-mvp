
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Settings() {
  const [threshold, setThreshold] = useState(5);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/settings")
      .then((response) => {
        setThreshold(response.data.default_low_stock_threshold ?? 5);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
          "Unable to load settings. Check that the settings API is implemented."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    const value = Number(threshold);

    if (!Number.isInteger(value) || value < 0) {
      setError("Enter a non-negative whole number.");
      return;
    }

    try {
      await api.put("/settings", {
        default_low_stock_threshold: value
      });
      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save settings");
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your inventory preferences</p>
        </div>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/products">Products</Link>
        </nav>
      </header>

      <section className="panel settings-panel">
        <h2>Low-Stock Settings</h2>
        <p>
          Products without their own threshold will use this default value.
        </p>

        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Default Low-Stock Threshold
              <input
                type="number"
                min="0"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
              />
            </label>

            <button type="submit">Save Settings</button>
          </form>
        )}

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
