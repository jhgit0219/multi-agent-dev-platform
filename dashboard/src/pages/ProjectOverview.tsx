import { useEffect, useState } from "react";
import { authFetch } from "../api/auth";

interface Project {
  id: string;
  name: string;
  path: string;
  hasConfig: boolean;
  iterations: number;
  config?: {
    project?: { name?: string; description?: string };
    stack?: { frontend?: string; backend?: string; database?: string };
    deployment?: { target?: string };
  };
}

interface Iteration {
  id: string;
  teams: string[];
}

export default function ProjectOverview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/api/projects")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json() as Promise<{ projects: Project[] }>;
      })
      .then((data) => {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelected(data.projects[0].id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  useEffect(() => {
    if (!selected) return;
    authFetch(`/api/projects/${selected}/iterations`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch iterations");
        return res.json() as Promise<{ iterations: Iteration[] }>;
      })
      .then((data) => setIterations(data.iterations))
      .catch(() => setIterations([]));
  }, [selected]);

  const project = projects.find((p) => p.id === selected);

  if (error) {
    return (
      <div>
        <h1>Projects</h1>
        <p style={{ color: "#721c24" }}>Error: {error}</p>
        <p style={{ color: "#666" }}>Make sure the backend server is running on port 3001.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Projects</h1>

      {projects.length === 0 ? (
        <p style={{ color: "#666" }}>No projects found. Run /dev-studio to create one.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelected(p.id)}
                style={{
                  background: selected === p.id ? "#e8eaf6" : "#fff",
                  border: selected === p.id ? "2px solid #0f3460" : "1px solid #ddd",
                  borderRadius: 8,
                  padding: "1rem",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.3rem" }}>
                  {p.name}
                </div>
                <div style={{ color: "#666", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  {p.path}
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem" }}>
                  <span>{p.iterations} iteration{p.iterations !== 1 ? "s" : ""}</span>
                  {p.config?.stack && (
                    <span style={{ color: "#555" }}>
                      {p.config.stack.frontend} / {p.config.stack.backend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {project && (
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "1.5rem" }}>
              <h2 style={{ marginTop: 0 }}>{project.name}</h2>
              {project.config?.project?.description && (
                <p style={{ color: "#555" }}>{project.config.project.description}</p>
              )}

              {project.config?.stack && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ background: "#f8f9fa", padding: "0.8rem", borderRadius: 6 }}>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>Frontend</div>
                    <div style={{ fontWeight: 600 }}>{project.config.stack.frontend || "none"}</div>
                  </div>
                  <div style={{ background: "#f8f9fa", padding: "0.8rem", borderRadius: 6 }}>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>Backend</div>
                    <div style={{ fontWeight: 600 }}>{project.config.stack.backend || "none"}</div>
                  </div>
                  <div style={{ background: "#f8f9fa", padding: "0.8rem", borderRadius: 6 }}>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>Database</div>
                    <div style={{ fontWeight: 600 }}>{project.config.stack.database || "none"}</div>
                  </div>
                </div>
              )}

              <h3>Iterations</h3>
              {iterations.length === 0 ? (
                <p style={{ color: "#666" }}>No iterations yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {iterations.map((iter) => (
                    <div key={iter.id} style={{ background: "#f8f9fa", padding: "0.8rem", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600 }}>Iteration {iter.id}</div>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        {iter.teams.map((t) => (
                          <span key={t} style={{ background: "#e0e0e0", padding: "0.2rem 0.5rem", borderRadius: 4, fontSize: "0.8rem" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
