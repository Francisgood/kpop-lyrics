import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "News — original vs rewritten (admin)", robots: { index: false, follow: false } };

type Row = {
  id: string; status: string; category: string | null; artistName: string | null;
  sourceName: string | null; sourceUrl: string; imageUrl: string | null; publishedAt: Date | null;
  origHeadline: string | null; origSubheadline: string | null;
  headline: string; subheadline: string | null; body: string | null;
  esHeadline: string | null; esSubheadline: string | null;
};

async function getRows(): Promise<Row[]> {
  try {
    return await prisma.$queryRawUnsafe<Row[]>(
      `SELECT "id","status","category","artistName","sourceName","sourceUrl","imageUrl","publishedAt",
              "origHeadline","origSubheadline","headline","subheadline","body","esHeadline","esSubheadline"
       FROM "NewsPost"
       ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
       LIMIT 200`,
    );
  } catch { return []; }
}

// Admin-only comparison of the ORIGINAL source story vs the REWRITTEN version the
// site publishes. Gated by ?key=<IMAGE_REFRESH_SECRET>. noindex.
export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  const secret = process.env.IMAGE_REFRESH_SECRET;
  const ok = !!secret && key === secret;

  const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" };

  if (!ok) {
    return (
      <main style={wrap}>
        <h1 style={{ fontFamily: "var(--serif)", color: "var(--ink)", fontSize: "1.6rem", marginBottom: 10 }}>News DB — admin</h1>
        <p style={{ color: "var(--ink-dim)", lineHeight: 1.6 }}>
          Append <code style={{ color: "var(--sakura)" }}>?key=YOUR_IMAGE_REFRESH_SECRET</code> to this URL to view the original vs rewritten stories.
        </p>
      </main>
    );
  }

  const rows = await getRows();
  const withOrig = rows.filter((r) => r.origHeadline).length;

  const cell: React.CSSProperties = { flex: "1 1 320px", minWidth: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" };
  const label: React.CSSProperties = { fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 };

  return (
    <main style={wrap}>
      <h1 style={{ fontFamily: "var(--serif)", color: "var(--ink)", fontSize: "1.8rem", margin: "0 0 6px" }}>News DB — original vs rewritten</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: "0.9rem", margin: "0 0 4px" }}>
        {rows.length} posts · {withOrig} captured with the original text · rewritten copy is what the homepage publishes (over the original image, linking to the source).
      </p>
      <p style={{ color: "var(--ink-faint)", fontSize: "0.8rem", margin: "0 0 28px" }}>Table: <code>NewsPost</code> · columns <code>origHeadline/origSubheadline</code> (source) vs <code>headline/subheadline/body</code> (published).</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {rows.map((r) => (
          <div key={r.id} style={{ borderTop: "1px solid var(--border-strong)", paddingTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              {r.category && <span style={{ background: "rgba(255,111,168,0.15)", color: "var(--sakura)", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase" }}>{r.category}</span>}
              {r.artistName && <span style={{ fontSize: "0.78rem", color: "var(--ink)", fontWeight: 700 }}>{r.artistName}</span>}
              {r.status !== "live" && <span style={{ fontSize: "0.7rem", color: "#FF7A7A", fontWeight: 700 }}>[{r.status}]</span>}
              <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: "0.76rem", color: "var(--sky)", fontWeight: 700, textDecoration: "none" }}>
                {r.sourceName ?? "source"} ↗
              </a>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              {r.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.imageUrl} alt="" width={150} height={95} style={{ width: 150, height: 95, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)", flexShrink: 0 }} />
              )}
              <div style={{ ...cell, borderColor: "var(--border-strong)" }}>
                <div style={{ ...label, color: "var(--ink-faint)" }}>Original · {r.sourceName ?? "source"}</div>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.98rem", lineHeight: 1.3, marginBottom: 6 }}>{r.origHeadline ?? "— (published before original capture)"}</div>
                {r.origSubheadline && <div style={{ color: "var(--ink-dim)", fontSize: "0.86rem", lineHeight: 1.5 }}>{r.origSubheadline}</div>}
              </div>
              <div style={{ ...cell, borderColor: "var(--sakura)" }}>
                <div style={{ ...label, color: "var(--sakura)" }}>Rewritten · published</div>
                <div style={{ fontFamily: "var(--serif)", fontWeight: 700, color: "var(--ink)", fontSize: "1.05rem", lineHeight: 1.25, marginBottom: 6 }}>{r.headline}</div>
                {r.subheadline && <div style={{ color: "var(--ink-dim)", fontSize: "0.86rem", lineHeight: 1.5, marginBottom: 8 }}>{r.subheadline}</div>}
                {r.body && <div style={{ color: "var(--ink-faint)", fontSize: "0.82rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{r.body}</div>}
                {(r.esHeadline || r.esSubheadline) && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
                    <div style={{ ...label, color: "var(--sky)" }}>🇪🇸 Español · shown on the ES toggle</div>
                    {r.esHeadline && <div style={{ fontFamily: "var(--serif)", fontWeight: 700, color: "var(--ink)", fontSize: "1rem", lineHeight: 1.25, marginBottom: 4 }}>{r.esHeadline}</div>}
                    {r.esSubheadline && <div style={{ color: "var(--ink-dim)", fontSize: "0.84rem", lineHeight: 1.5 }}>{r.esSubheadline}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
