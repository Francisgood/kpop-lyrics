import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TITLE = "K-pop Fan Events & Meetups Near You — Aegyo Arena";
const DESC =
  "A daily-updated feed of local K-pop fan meetups, K-beauty brand activations, dance meets, anime & comic cons, and K-pop store events around the world.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/events" },
  openGraph: { title: TITLE, description: DESC, url: "https://www.aegyoarena.com/events", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

type Row = {
  id: string; title: string; category: string; city: string | null; citySlug: string | null;
  country: string | null; venue: string | null; startsAt: Date | null; dateText: string | null;
  description: string | null; source: string | null; sourceUrl: string;
};

const CAT: Record<string, { label: string; emoji: string; color: string }> = {
  kpop:    { label: "K-pop",      emoji: "💜", color: "#C77DFF" },
  kbeauty: { label: "K-Beauty",   emoji: "💄", color: "#FF6FA8" },
  dance:   { label: "Dance",      emoji: "🕺", color: "#4AC8F0" },
  anime:   { label: "Anime",      emoji: "🎌", color: "#FF8C42" },
  comicon: { label: "Comic-Con",  emoji: "🦸", color: "#C8F04A" },
  store:   { label: "Store",      emoji: "🛍", color: "#B8A0FF" },
  meetup:  { label: "Meetup",     emoji: "🗓", color: "#4ECDC4" },
  other:   { label: "Event",      emoji: "✨", color: "#FFD700" },
};

async function getEvents(): Promise<Row[]> {
  try {
    // Idempotently ensure the table exists so the page never 500s before the first scan.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ScannedEvent" (
        "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "category" TEXT NOT NULL,
        "city" TEXT, "citySlug" TEXT, "country" TEXT, "venue" TEXT, "startsAt" TIMESTAMP,
        "dateText" TEXT, "description" TEXT, "source" TEXT, "sourceUrl" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'live', "createdAt" TIMESTAMP NOT NULL DEFAULT now())`);
    return await prisma.$queryRawUnsafe<Row[]>(
      `SELECT "id","title","category","city","citySlug","country","venue","startsAt","dateText","description","source","sourceUrl"
       FROM "ScannedEvent"
       WHERE "status" = 'live' AND ("startsAt" IS NULL OR "startsAt" >= now() - interval '1 day')
       ORDER BY ("startsAt" IS NULL), "startsAt" ASC, "createdAt" DESC
       LIMIT 200`
    );
  } catch {
    return [];
  }
}

function fmtDate(r: Row): string {
  if (r.startsAt) {
    try { return new Date(r.startsAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); } catch { /* fall through */ }
  }
  return r.dateText ?? "";
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 44px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>
            Community · Live feed
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.06, margin: "0 0 14px" }}>Fan events near you</h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 620, fontSize: "1.02rem", lineHeight: 1.7 }}>
            Local K-pop meetups, K-beauty pop-ups, dance meets, anime &amp; comic cons, and K-pop store events — refreshed daily.
            Also see recurring <Link href="/cities/meetups" style={{ color: "var(--sakura)", fontWeight: 700 }}>fan meetups by city</Link> and full{" "}
            <Link href="/cities" style={{ color: "var(--sakura)", fontWeight: 700 }}>city guides</Link>.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 72px" }}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--ink-dim)", lineHeight: 1.8 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🗓</div>
            <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1.1rem", marginBottom: 6 }}>No events posted yet</div>
            <div style={{ fontSize: "0.92rem", maxWidth: 460, margin: "0 auto" }}>
              Our scanner sweeps event platforms daily for local fan meetups and activations. Check back soon — or explore{" "}
              <Link href="/cities/meetups" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>recurring meetups by city</Link>.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {events.map((e) => {
              const cat = CAT[e.category] ?? CAT.other;
              const when = fmtDate(e);
              const place = [e.venue, e.city].filter(Boolean).join(" · ");
              return (
                <div key={e.id} className="genius-card" style={{ padding: 18, display: "flex", flexDirection: "column", borderLeft: `3px solid ${cat.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ background: `${cat.color}22`, color: "var(--ink)", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase" }}>
                      {cat.emoji} {cat.label}
                    </span>
                    {e.country && <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--ink-faint)" }}>{e.country}</span>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)", lineHeight: 1.35, marginBottom: 6 }}>{e.title}</div>
                  {(place || when) && (
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-dim)", marginBottom: 8 }}>
                      {place && <span>📍 {place}</span>}{place && when ? " · " : ""}{when && <span>🗓 {when}</span>}
                    </div>
                  )}
                  {e.description && <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)", lineHeight: 1.55, marginBottom: 12, flex: 1 }}>{e.description}</div>}
                  <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: "auto", fontSize: "0.78rem", color: cat.color, fontWeight: 800, textDecoration: "none" }}>
                    Details{e.source ? ` on ${e.source}` : ""} →
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 32, paddingTop: 20, textAlign: "center", color: "var(--ink-faint)", fontSize: "0.78rem", lineHeight: 1.7 }}>
          Events are aggregated automatically from public event listings — always confirm details on the source page.
        </div>
      </div>
    </main>
  );
}
