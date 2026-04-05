import { useEffect, useState } from "react";
import ConfigSummary from "../components/ConfigSummary";
import StatusBadge from "../components/StatusBadge";

interface IterationSummary {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
}

interface ProjectData {
  projectName?: string;
  config?: {
    frontend?: string;
    backend?: string;
    database?: string;
    deploymentTarget?: string;
  };
  iterations?: IterationSummary;
  status?: string;
}

export default function ProjectOverview() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/iterations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<ProjectData>;
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Error loading data"));
  }, []);

  if (error) {
    return (
      <div>
        <h1>Project Overview</h1>
        <p style={{ color: "#721c24" }}>Error: {error}</p>
        <p style={{ color: "#666" }}>Make sure the backend server is running on port 3001.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1>Project Overview</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{data.projectName ?? "Project Overview"}</h1>
      {data.status && (
        <div style={{ marginBottom: "1rem" }}>
          <StatusBadge status={data.status} />
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: 8, padding: "1rem", border: "1px solid #ddd" }}>
          <h3 style={{ margin: "0 0 0.5rem" }}>Iterations</h3>
          {data.iterations ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{data.iterations.total}</div>
                <div style={{ color: "#666", fontSize: "0.85rem" }}>Total</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#155724" }}>{data.iterations.completed}</div>
                <div style={{ color: "#666", fontSize: "0.85rem" }}>Completed</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#856404" }}>{data.iterations.inProgress}</div>
                <div style={{ color: "#666", fontSize: "0.85rem" }}>In Progress</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#721c24" }}>{data.iterations.failed}</div>
                <div style={{ color: "#666", fontSize: "0.85rem" }}>Failed</div>
              </div>
            </div>
          ) : (
            <p style={{ color: "#666" }}>No iteration data available</p>
          )}
        </div>
        {data.config && <ConfigSummary config={data.config} />}
      </div>
    </div>
  );
}
