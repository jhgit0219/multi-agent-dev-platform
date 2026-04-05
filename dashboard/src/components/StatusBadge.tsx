interface StatusBadgeProps {
  status: "success" | "failure" | "in_progress" | "pending" | string;
}

const colors: Record<string, { bg: string; text: string }> = {
  success: { bg: "#d4edda", text: "#155724" },
  failure: { bg: "#f8d7da", text: "#721c24" },
  in_progress: { bg: "#fff3cd", text: "#856404" },
  pending: { bg: "#e2e3e5", text: "#383d41" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = colors[status] ?? colors.pending;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.6rem",
        borderRadius: 12,
        fontSize: "0.8rem",
        fontWeight: 600,
        background: color.bg,
        color: color.text,
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
