import { useEffect, useState } from "react";
import TeamPanel, { type TeamPanelData } from "../components/TeamPanel";

const defaultTeams: TeamPanelData[] = [
  { name: "Feature", status: "pending" },
  { name: "Dev", status: "pending" },
  { name: "Test", status: "pending" },
  { name: "Security", status: "pending" },
  { name: "DevOps", status: "pending" },
];

export default function TeamPanels() {
  const [teams, setTeams] = useState<TeamPanelData[]>(defaultTeams);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/teams")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<{ teams?: TeamPanelData[] }>;
      })
      .then((data) => {
        if (data.teams && data.teams.length > 0) {
          setTeams(data.teams);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  return (
    <div>
      <h1>Teams</h1>
      {error && <p style={{ color: "#856404", fontSize: "0.9rem" }}>Could not load live data. Showing defaults.</p>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {teams.map((team) => (
          <TeamPanel key={team.name} team={team} />
        ))}
      </div>
    </div>
  );
}
