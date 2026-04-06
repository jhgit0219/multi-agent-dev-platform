import { useEffect, useState } from "react";
import { authFetch } from "../api/auth";
import TimelineEntry, { type TimelineEntryData } from "../components/TimelineEntry";

export default function IterationTimeline() {
  const [entries, setEntries] = useState<TimelineEntryData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/api/reports/iterations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<{ entries?: TimelineEntryData[] }>;
      })
      .then((data) => setEntries(data.entries ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  return (
    <div>
      <h1>Iteration Timeline</h1>
      {error && <p style={{ color: "#721c24" }}>Error: {error}</p>}
      {!error && entries.length === 0 && <p style={{ color: "#666" }}>No iterations yet.</p>}
      <div>
        {entries.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
