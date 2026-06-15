import Link from "next/link";

export default function ArtistNotFound() {
  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: "5rem", fontWeight: 900, color: "#eee", lineHeight: 1, marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>Artist Not Found</h1>
        <p style={{ color: "var(--ink-dim)", fontSize: "0.95rem", marginBottom: 24, lineHeight: 1.6 }}>
          This artist page doesn't exist. They may not be in our database yet.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/artists" style={{ background: "var(--sakura)", color: "#000", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 20px", borderRadius: 4, textDecoration: "none" }}>
            Browse Artists
          </Link>
          <Link href="/" style={{ background: "#000", color: "#fff", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 20px", borderRadius: 4, textDecoration: "none" }}>
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
