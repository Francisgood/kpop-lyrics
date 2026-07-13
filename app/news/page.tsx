import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "K-pop Signals — Aegyo Arena",
  description: "Live K-pop chart data, streaming milestones, Instagram rankings, and breaking artist news.",
};

// ── Static vault data (scraped 2026-05-20) ────────────────────────────────────

const CHART_WEEK15: { rank: number; artist: string; song: string; move: string; slug?: string }[] = [
  { rank: 1,  artist: "YENA",        song: "Catch Catch",          move: "↑" },
  { rank: 3,  artist: "YUNA",        song: "Ice Cream",            move: "↑" },
  { rank: 5,  artist: "BTS",         song: "Hooligan",             move: "↑↑ from #16", slug: "bts" },
  { rank: 6,  artist: "Stray Kids",  song: "STAY",                 move: "Debut",       slug: "stray-kids" },
  { rank: 7,  artist: "ILLIT",       song: "NOT CUTE ANYMORE",     move: "→",           slug: "illit" },
  { rank: 12, artist: "IRENE",       song: "Biggest Fan",          move: "Debut" },
  { rank: 22, artist: "LE SSERAFIM × j-hope", song: "SPAGHETTI", move: "↑↑ from #36", slug: "le-sserafim" },
  { rank: 33, artist: "BTS",         song: "SWIM",                 move: "↓↓ from #1", slug: "bts" },
  { rank: 35, artist: "TWICE",       song: "THIS IS FOR",          move: "Re-entry",    slug: "twice" },
];

const INSTAGRAM_TOP10: { rank: number; artist: string; handle: string; followers: string; slug?: string }[] = [
  { rank: 1,  artist: "Lisa (BLACKPINK)",     handle: "@lalalalisa_m",   followers: "107M",      slug: "lisa" },
  { rank: 2,  artist: "Jennie (BLACKPINK)",   handle: "@jennierubyjane", followers: "89.7M",     slug: "blackpink" },
  { rank: 3,  artist: "Rosé (BLACKPINK)",     handle: "@roses_are_rosie",followers: "84.5M",     slug: "blackpink" },
  { rank: 4,  artist: "Jisoo (BLACKPINK)",    handle: "@sooyaaa__",      followers: "80.5M",     slug: "blackpink" },
  { rank: 5,  artist: "V (BTS)",              handle: "@thv",            followers: "70.5M",     slug: "bts" },
  { rank: 6,  artist: "Jimin (BTS)",          handle: "@j.m",            followers: "56M",       slug: "bts" },
  { rank: 7,  artist: "J-Hope (BTS)",         handle: "@uarmyhope",      followers: "53.5M",     slug: "bts" },
  { rank: 8,  artist: "Jin (BTS)",            handle: "@jin",            followers: "52.6M",     slug: "bts" },
  { rank: 9,  artist: "Suga (BTS)",           handle: "@agustd",         followers: "51.8M",     slug: "bts" },
  { rank: 10, artist: "Cha Eun-woo (ASTRO)",  handle: "@eunwo.o_c",      followers: "47.3–48M" },
];

const SPOTIFY_MONTHLY: { artist: string; listeners: string; slug?: string }[] = [
  { artist: "HUNTR/X",   listeners: "48.1M" },
  { artist: "JENNIE",    listeners: "41.7M",  slug: "blackpink" },
  { artist: "KATSEYE",   listeners: "33.5M" },
  { artist: "ROSÉ",      listeners: "30.6M",  slug: "blackpink" },
  { artist: "BLACKPINK", listeners: "25.7M",  slug: "blackpink" },
  { artist: "BTS",       listeners: "23.7M",  slug: "bts" },
  { artist: "TWICE",     listeners: "22.2M",  slug: "twice" },
  { artist: "Stray Kids",listeners: "14.1M",  slug: "stray-kids" },
  { artist: "ENHYPEN",   listeners: "9.3M",   slug: "enhypen" },
];

const CATEGORY_COLORS: Record<string, string> = {
  chart:     "#FFFF64",
  milestone: "#ACFA52",
  comeback:  "#fb923c",
  collab:    "#e879f9",
  legal:     "#f87171",
  label:     "#60a5fa",
  member:    "#94a3b8",
  award:     "#fbbf24",
};

function catColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#e5e7eb";
}

export default async function NewsPage() {
  const allNews = await prisma.artistNews.findMany({
    include: { artist: true },
    orderBy: { publishedAt: "desc" },
  });

  // Group by category for the signals section
  const chartNews    = allNews.filter((n) => n.category === "chart");
  const milestones   = allNews.filter((n) => n.category === "milestone");
  const comebacks    = allNews.filter((n) => n.category === "comeback");
  const otherNews    = allNews.filter((n) => !["chart", "milestone", "comeback"].includes(n.category));

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #000 0%, #0a0a1e 100%)", color: "#fff", padding: "60px 24px 40px", borderBottom: "1px solid #1e1e3a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Sourced from Research Vault · Updated 2026-05-20
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>
            K-pop Signals
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
            Live chart data, streaming milestones, social media rankings, and breaking artist news — aggregated from Soompi, Billboard, Gaon, Spotify, and more.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>

          {/* ── Main column ── */}
          <div>

            {/* Weekly Chart */}
            <section style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                <div className="section-header" style={{ margin: 0 }}>K-pop Chart — Week 15, 2026</div>
                <span style={{ fontSize: "0.65rem", background: "var(--genius-yellow)", color: "var(--on-accent)", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>APRIL 12</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--genius-gray)", marginBottom: 16 }}>Source: onlyhit.us</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CHART_WEEK15.map((entry) => (
                  <div key={`${entry.rank}-${entry.song}`} className="genius-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: entry.rank <= 5 ? "var(--genius-yellow)" : "#f0f0f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, fontSize: "0.88rem",
                    }}>
                      {entry.rank}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {entry.slug ? (
                        <Link href={`/artists/${entry.slug}`} style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)", textDecoration: "none" }}>
                          {entry.artist}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)" }}>{entry.artist}</span>
                      )}
                      <span style={{ marginLeft: 8, fontSize: "0.82rem", color: "var(--genius-gray)", fontStyle: "italic" }}>
                        "{entry.song}"
                      </span>
                    </div>
                    <div style={{
                      fontSize: "0.72rem", fontWeight: 700,
                      color: entry.move.startsWith("↑") ? "#16a34a" : entry.move.startsWith("↓") ? "#dc2626" : entry.move === "Debut" ? "#7c3aed" : "#78716c",
                      whiteSpace: "nowrap",
                    }}>
                      {entry.move}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                Notable: BTS has two songs charting simultaneously — 'Hooligan' climbing, 'SWIM' falling.
                LE SSERAFIM × j-hope collab gaining fast.
              </div>
            </section>

            {/* Chart News Items */}
            {chartNews.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <div className="section-header">Chart News</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {chartNews.map((item) => <NewsCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* Streaming Milestones */}
            {milestones.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <div className="section-header">Streaming Milestones</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {milestones.map((item) => <NewsCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* Comebacks & Releases */}
            {comebacks.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <div className="section-header">Comebacks &amp; Releases</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {comebacks.map((item) => <NewsCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* Everything else */}
            {otherNews.length > 0 && (
              <section>
                <div className="section-header">More News</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {otherNews.map((item) => <NewsCard key={item.id} item={item} />)}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside style={{ position: "sticky", top: 76 }}>

            {/* Instagram Top 10 */}
            <div style={{ marginBottom: 32 }}>
              <div className="section-header">Instagram Top 10</div>
              <p style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginBottom: 12 }}>K-pop artists by followers, Q1 2026</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {INSTAGRAM_TOP10.map((entry) => (
                  <div key={entry.rank} className="genius-card" style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: entry.rank <= 3 ? "var(--genius-yellow)" : "#f0f0f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "0.65rem",
                    }}>
                      {entry.rank}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {entry.slug ? (
                        <Link href={`/artists/${entry.slug}`} style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--ink)", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.artist}
                        </Link>
                      ) : (
                        <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.artist}</div>
                      )}
                      <div style={{ fontSize: "0.65rem", color: "var(--genius-gray)" }}>{entry.handle}</div>
                    </div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#e879f9", whiteSpace: "nowrap" }}>{entry.followers}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: "0.68rem", color: "var(--genius-gray)" }}>
                Source: Koreaboo, blog.delivered.co.kr
              </div>
            </div>

            {/* Spotify Monthly Listeners */}
            <div style={{ marginBottom: 32 }}>
              <div className="section-header">Spotify Monthly Listeners</div>
              <p style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginBottom: 12 }}>Top K-pop acts, ~Dec 2025</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {SPOTIFY_MONTHLY.map((entry, i) => (
                  <div key={entry.artist} className="genius-card" style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: i < 3 ? "#ACFA52" : "#f0f0f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "0.65rem",
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {entry.slug ? (
                        <Link href={`/artists/${entry.slug}`} style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--ink)", textDecoration: "none" }}>
                          {entry.artist}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--ink)" }}>{entry.artist}</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#ACFA52", background: "#000", padding: "1px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>
                      {entry.listeners}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: "0.68rem", color: "var(--genius-gray)" }}>
                Source: kpopbeen.com, Outlookindia/Respawn
              </div>
            </div>

            {/* Scraped images */}
            <div>
              <div className="section-header">From the Vault</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { src: "/scraped/images/instagram-followers-2026.jpg", label: "Instagram Top 10 (2026)" },
                  { src: "/scraped/images/most-streamed-kpop-spotify-2025.jpg", label: "Most-Streamed K-pop (Spotify 2025)" },
                  { src: "/scraped/images/bts-jungkook-jimin-spotify-2026.jpg", label: "Jungkook & Jimin Spotify Stats" },
                  { src: "/scraped/images/groups-vs-soloists-breakdown.jpg", label: "Groups vs Soloists Breakdown" },
                ].map(({ src, label }) => (
                  <div key={src} style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--genius-border)" }}>
                    <img src={src} alt={label} style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 160 }} />
                    <div style={{ padding: "6px 10px", fontSize: "0.68rem", color: "var(--ink-dim)", background: "rgba(255,255,255,0.06)", fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}

// ── NewsCard sub-component (server-side, no client hooks needed) ──────────────
function NewsCard({ item }: {
  item: {
    id: string; headline: string; body: string; category: string;
    source: string | null; publishedAt: Date | null;
    artist: { stageName: string; slug: string; imageUrl: string | null };
  };
}) {
  const color = catColor(item.category);
  return (
    <Link href={`/artists/${item.artist.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="genius-card" style={{ padding: 18, borderLeft: `3px solid ${color}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          {item.artist.imageUrl ? (
            <img src={item.artist.imageUrl} alt={item.artist.stageName} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid #eee" }} />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>🎤</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--ink)" }}>{item.artist.stageName}</div>
            <div style={{ fontSize: "0.67rem", color: "var(--genius-gray)" }}>
              {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
              {item.source ? ` · ${item.source}` : ""}
            </div>
          </div>
          <span style={{ fontSize: "0.62rem", background: color, color: "var(--on-accent)", padding: "2px 7px", borderRadius: 999, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            {item.category}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.4, marginBottom: 6 }}>{item.headline}</div>
        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}>
          {item.body.slice(0, 180)}{item.body.length > 180 ? "…" : ""}
        </div>
      </div>
    </Link>
  );
}
