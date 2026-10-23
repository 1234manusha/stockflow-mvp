
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    organizationName: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", form);
      navigate("/login", {
        state: { message: "Account created! Please log in." }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>StockFlow</h1>
        <p>Create your inventory account.</p>

        {error && <p className="error">{error}</p>}

        <label>Organization name</label>
        <input
          name="organizationName"
          value={form.organizationName}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password (minimum 8 characters)</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p>
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
