import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/timeline", label: "Timeline" },
  { to: "/teams", label: "Teams" },
  { to: "/logs", label: "Logs" },
  { to: "/reports", label: "Reports" },
  { to: "/users", label: "Users" },
];

const sidebarStyle: React.CSSProperties = {
  width: 220,
  minHeight: "100vh",
  background: "#1a1a2e",
  color: "#eee",
  padding: "1rem 0",
  display: "flex",
  flexDirection: "column",
};

const linkStyle: React.CSSProperties = {
  display: "block",
  padding: "0.6rem 1.2rem",
  color: "#ccc",
  textDecoration: "none",
  fontSize: "0.95rem",
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  color: "#fff",
  background: "#16213e",
  borderLeft: "3px solid #0f3460",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: "1.5rem",
  background: "#f4f4f8",
  minHeight: "100vh",
  overflowY: "auto",
};

export default function Layout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: "flex" }}>
      <nav style={sidebarStyle}>
        <div style={{ padding: "0 1.2rem 1rem", fontWeight: 700, fontSize: "1.1rem" }}>
          Dev Platform
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            {item.label}
          </NavLink>
        ))}
        <div style={{ marginTop: "auto", padding: "1rem 1.2rem", fontSize: "0.85rem" }}>
          {user ? (
            <>
              <div style={{ marginBottom: "0.4rem" }}>{user.email}</div>
              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "1px solid #666",
                  color: "#ccc",
                  padding: "0.3rem 0.8rem",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" style={linkStyle}>
              Login
            </NavLink>
          )}
        </div>
      </nav>
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}
