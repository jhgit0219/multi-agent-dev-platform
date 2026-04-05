import StatusBadge from "./StatusBadge";

export interface TeamPanelData {
  name: string;
  status: string;
  latestSummary?: string;
}

interface TeamPanelProps {
  team: TeamPanelData;
}

export default function TeamPanel({ team }: TeamPanelProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "1rem",
        border: "1px solid #ddd",
        minWidth: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.6rem",
        }}
      >
        <h3 style={{ margin: 0 }}>{team.name}</h3>
        <StatusBadge status={team.status} />
      </div>
      <p style={{ fontSize: "0.9rem", color: "#555", margin: 0 }}>
        {team.latestSummary ?? "No recent activity"}
      </p>
    </div>
  );
}
