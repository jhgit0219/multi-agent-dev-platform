import { useEffect, useState, type FormEvent } from "react";
import { getStoredToken } from "../api/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    fetch("/api/users", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json() as Promise<{ users?: User[] }>;
      })
      .then((data) => setUsers(data.users ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = getStoredToken();
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Invite failed");
      }
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    }
  }

  return (
    <div>
      <h1>User Management</h1>

      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Invite User</h3>
        {error && <div style={{ color: "#721c24", background: "#f8d7da", padding: "0.5rem", borderRadius: 4, marginBottom: "0.8rem" }}>{error}</div>}
        {success && <div style={{ color: "#155724", background: "#d4edda", padding: "0.5rem", borderRadius: 4, marginBottom: "0.8rem" }}>{success}</div>}
        <form onSubmit={handleInvite} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.2rem" }}>Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.2rem" }}>Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: "0.4rem 1rem",
              background: "#0f3460",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Send Invite
          </button>
        </form>
      </div>

      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Users</h3>
        {users.length === 0 ? (
          <p style={{ color: "#666" }}>No users found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Name</th>
                <th style={{ padding: "0.5rem" }}>Email</th>
                <th style={{ padding: "0.5rem" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>{user.name}</td>
                  <td style={{ padding: "0.5rem" }}>{user.email}</td>
                  <td style={{ padding: "0.5rem" }}>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
