
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  try {
    const response = await api.post("/auth/login", {
      email,
      password
    });

    const token = response.data?.token;

    if (typeof token !== "string" || !token.trim()) {
      setError("Login response did not contain a valid token.");
      return;
    }

    localStorage.setItem("token", token);
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  }
}

  
  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>StockFlow</h1>
        <p>Sign in to manage your inventory.</p>

        {error && <p className="error">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Log in</button>

        <p>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
