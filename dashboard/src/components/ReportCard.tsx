import { useState } from "react";
import StatusBadge from "./StatusBadge";

export interface ReportData {
  id: string;
  iteration: number;
  phase: string;
  team: string;
  status: string;
  summary: string;
  details?: string;
  timestamp?: string;
}

interface ReportCardProps {
  report: ReportData;
}

export default function ReportCard({ report }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "1rem",
        marginBottom: "0.8rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <strong>Iteration {report.iteration}</strong>
          <span style={{ color: "#666", marginLeft: "0.5rem" }}>
            {report.phase} - {report.team}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <StatusBadge status={report.status} />
          <span style={{ fontSize: "1.2rem", color: "#666" }}>
            {expanded ? "\u25B2" : "\u25BC"}
          </span>
        </div>
      </div>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#555" }}>
        {report.summary}
      </p>
      {expanded && report.details && (
        <div
          style={{
            marginTop: "0.8rem",
            padding: "0.8rem",
            background: "#f8f8f8",
            borderRadius: 4,
            fontSize: "0.85rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {report.details}
        </div>
      )}
      {report.timestamp && (
        <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.4rem" }}>
          {report.timestamp}
        </div>
      )}
    </div>
  );
}
