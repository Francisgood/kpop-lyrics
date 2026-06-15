/** Renders a plain-text legal document (from a Google Doc export) as a styled page. */
export default function LegalDoc({ content }: { content: string }) {
  const lines = content.split("\n");
  let titleShown = false;

  return (
    <main>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 88px" }}>
        {lines.map((raw, i) => {
          const line = raw.trim();
          if (!line) return <div key={i} style={{ height: 12 }} />;

          if (!titleShown) {
            titleShown = true;
            return (
              <h1 key={i} style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 2.6rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 24px", lineHeight: 1.15 }}>
                {line}
              </h1>
            );
          }
          // Numbered section heading: "1. Sponsor"
          if (/^\d+\.\s/.test(line)) {
            return <h2 key={i} style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", color: "var(--sakura)", margin: "34px 0 10px" }}>{line}</h2>;
          }
          // Lettered sub-heading: "a. Information You Provide"
          if (/^[a-z]\.\s/.test(line)) {
            return <h3 key={i} style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--ink)", margin: "20px 0 6px" }}>{line}</h3>;
          }
          // Bullet
          if (/^[*●•▪]\s/.test(line)) {
            return (
              <div key={i} style={{ display: "flex", gap: 10, color: "var(--ink-dim)", fontSize: "0.96rem", lineHeight: 1.7, margin: "4px 0 4px 10px" }}>
                <span style={{ color: "var(--sakura)", flexShrink: 0 }}>•</span>
                <span>{line.replace(/^[*●•▪]\s/, "")}</span>
              </div>
            );
          }
          // All-caps emphasis line (e.g. "OFFICIAL RULES", "NO PURCHASE NECESSARY…")
          if (line.length > 4 && line === line.toUpperCase() && /[A-Z]/.test(line)) {
            return <p key={i} style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.96rem", lineHeight: 1.7, margin: "0 0 12px" }}>{line}</p>;
          }
          return <p key={i} style={{ color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.8, margin: "0 0 12px" }}>{line}</p>;
        })}
      </div>
    </main>
  );
}
