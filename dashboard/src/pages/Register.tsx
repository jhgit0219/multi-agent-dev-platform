import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, storeToken } from "../api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem",
    borderRadius: 4,
    border: "1px solid var(--border-default)",
    boxSizing: "border-box",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  };

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
        <h2 style={{ marginTop: 0, color: "var(--text-primary)" }}>Register</h2>
        {error && (
          <div style={{ color: "var(--status-error)", background: "rgba(239,68,68,0.1)", padding: "0.5rem", borderRadius: 4, marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: 500, color: "var(--text-primary)" }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: 500, color: "var(--text-primary)" }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: 500, color: "var(--text-primary)" }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
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
          {loading ? "Registering..." : "Register"}
        </button>
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--text-accent)" }}>Login</Link>
        </p>
      </form>
    </div>
  );
}
