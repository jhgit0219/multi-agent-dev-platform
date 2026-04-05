import StatusBadge from "./StatusBadge";

export interface TimelineEntryData {
  id: string;
  phase: string;
  team: string;
  status: string;
  summary?: string;
  timestamp?: string;
}

interface TimelineEntryProps {
  entry: TimelineEntryData;
}

const entryStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  padding: "1rem 0",
  borderLeft: "3px solid #0f3460",
  paddingLeft: "1rem",
  marginLeft: "0.5rem",
};

export default function TimelineEntry({ entry }: TimelineEntryProps) {
  return (
    <div style={entryStyle}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>
          {entry.phase}
          <span style={{ fontWeight: 400, color: "#666", marginLeft: "0.5rem" }}>
            {entry.team}
          </span>
        </div>
        {entry.summary && (
          <div style={{ fontSize: "0.9rem", color: "#555" }}>{entry.summary}</div>
        )}
        {entry.timestamp && (
          <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.2rem" }}>
            {entry.timestamp}
          </div>
        )}
      </div>
      <StatusBadge status={entry.status} />
    </div>
  );
}
