interface StackConfig {
  frontend?: string;
  backend?: string;
  database?: string;
  deploymentTarget?: string;
}

interface ConfigSummaryProps {
  config: StackConfig;
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.4rem 0",
  borderBottom: "1px solid #eee",
};

export default function ConfigSummary({ config }: ConfigSummaryProps) {
  const entries: [string, string | undefined][] = [
    ["Frontend", config.frontend],
    ["Backend", config.backend],
    ["Database", config.database],
    ["Deployment", config.deploymentTarget],
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "1rem",
        border: "1px solid #ddd",
      }}
    >
      <h3 style={{ margin: "0 0 0.8rem" }}>Stack Configuration</h3>
      {entries.map(([label, value]) => (
        <div key={label} style={rowStyle}>
          <span style={{ fontWeight: 500 }}>{label}</span>
          <span style={{ color: "#555" }}>{value ?? "N/A"}</span>
        </div>
      ))}
    </div>
  );
}
