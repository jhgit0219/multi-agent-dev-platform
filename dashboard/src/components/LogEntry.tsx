interface LogEntryProps {
  timestamp: string;
  team?: string;
  message: string;
}

export default function LogEntry({ timestamp, team, message }: LogEntryProps) {
  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: "0.85rem",
        padding: "0.3rem 0.5rem",
        borderBottom: "1px solid #eee",
        display: "flex",
        gap: "0.8rem",
      }}
    >
      <span style={{ color: "#999", whiteSpace: "nowrap" }}>{timestamp}</span>
      {team && (
        <span
          style={{
            color: "#0f3460",
            fontWeight: 600,
            minWidth: 80,
          }}
        >
          [{team}]
        </span>
      )}
      <span style={{ color: "#333" }}>{message}</span>
    </div>
  );
}
