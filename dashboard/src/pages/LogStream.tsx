import { useState, useMemo } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import LogEntry from "../components/LogEntry";

const teams = ["All", "Feature", "Dev", "Test", "Security", "DevOps"];

const filterBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.3rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: 4,
  background: active ? "#0f3460" : "#fff",
  color: active ? "#fff" : "#333",
  cursor: "pointer",
  fontSize: "0.85rem",
});

export default function LogStream() {
  const { events, connected, clear } = useWebSocket();
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "All") return events;
    return events.filter((e) => e.team?.toLowerCase() === filter.toLowerCase());
  }, [events, filter]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Log Stream</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#28a745" : "#dc3545",
            }}
          />
          <span style={{ fontSize: "0.85rem", color: "#666" }}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {teams.map((t) => (
          <button key={t} style={filterBtnStyle(filter === t)} onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
        <button
          onClick={clear}
          style={{
            marginLeft: "auto",
            padding: "0.3rem 0.8rem",
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Clear
        </button>
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 8,
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {filtered.length === 0 ? (
          <p style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
            No log entries yet. Waiting for events...
          </p>
        ) : (
          filtered.map((event, i) => (
            <LogEntry
              key={`${event.timestamp}-${i}`}
              timestamp={event.timestamp}
              team={event.team}
              message={event.message ?? JSON.stringify(event)}
            />
          ))
        )}
      </div>
    </div>
  );
}
