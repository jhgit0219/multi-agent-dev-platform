interface CodeSnippetProps {
  code: string;
  language?: string;
}

export default function CodeSnippet({ code, language }: CodeSnippetProps) {
  return (
    <div style={{ position: "relative" }}>
      {language && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: "0.2rem 0.5rem",
            fontSize: "0.75rem",
            color: "#999",
            background: "#2d2d2d",
            borderBottomLeftRadius: 4,
          }}
        >
          {language}
        </div>
      )}
      <pre
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          padding: "1rem",
          borderRadius: 6,
          overflow: "auto",
          fontSize: "0.85rem",
          fontFamily: "'Fira Code', 'Consolas', monospace",
          margin: 0,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
