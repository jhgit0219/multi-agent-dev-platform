import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-card)",
          padding: "2rem",
          borderRadius: 8,
          border: "1px solid var(--border-default)",
          width: 360,
        }}
      >
        <h2 style={{ marginTop: 0, color: "var(--text-primary)" }}>Login</h2>
        {error && (
          <div style={{ color: "var(--status-error)", background: "rgba(239,68,68,0.1)", padding: "0.5rem", borderRadius: 4, marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: 500, color: "var(--text-primary)" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: 4, border: "1px solid var(--border-default)", boxSizing: "border-box", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: 500, color: "var(--text-primary)" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: 4, border: "1px solid var(--border-default)", boxSizing: "border-box", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "var(--accent-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--text-accent)" }}>Register</Link>
        </p>
      </form>
    </div>
  );
}
