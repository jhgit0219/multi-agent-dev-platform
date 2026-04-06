import { useEffect, useState } from "react";
import { authFetch } from "../api/auth";
import ReportCard, { type ReportData } from "../components/ReportCard";

export default function ReportsArchive() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/api/reports")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<{ reports?: ReportData[] }>;
      })
      .then((data) => setReports(data.reports ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  return (
    <div>
      <h1>Reports Archive</h1>
      {error && <p style={{ color: "#721c24" }}>Error: {error}</p>}
      {!error && reports.length === 0 && <p style={{ color: "#666" }}>No reports available.</p>}
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
