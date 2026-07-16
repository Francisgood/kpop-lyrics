import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "K-pop Signals — Aegyo Arena",
  description: "Live K-pop chart data, streaming milestones, Instagram rankings, and breaking artist news.",
};

// ── Static vault data (scraped 2026-05-20) ────────────────────────────────────

// `move` also drives the arrow colour logic below, so it stays canonical (English);
// `moveEs` is display-only and omitted where the string is language-neutral.
const CHART_WEEK15: { rank: number; artist: string; song: string; move: string; moveEs?: string; slug?: string }[] = [
  { rank: 1,  artist: "YENA",        song: "Catch Catch",          move: "↑" },
  { rank: 3,  artist: "YUNA",        song: "Ice Cream",            move: "↑" },
  { rank: 5,  artist: "BTS",         song: "Hooligan",             move: "↑↑ from #16", moveEs: "↑↑ desde #16", slug: "bts" },
  { rank: 6,  artist: "Stray Kids",  song: "STAY",                 move: "Debut",       slug: "stray-kids" },
  { rank: 7,  artist: "ILLIT",       song: "NOT CUTE ANYMORE",     move: "→",           slug: "illit" },
  { rank: 12, artist: "IRENE",       song: "Biggest Fan",          move: "Debut" },
  { rank: 22, artist: "LE SSERAFIM × j-hope", song: "SPAGHETTI", move: "↑↑ from #36", moveEs: "↑↑ desde #36", slug: "le-sserafim" },
  { rank: 33, artist: "BTS",         song: "SWIM",                 move: "↓↓ from #1", moveEs: "↓↓ desde #1", slug: "bts" },
  { rank: 35, artist: "TWICE",       song: "THIS IS FOR",          move: "Re-entry",    moveEs: "Reingreso",   slug: "twice" },
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

// Naver VIBE daily Top 100 — songs that jumped 5+ spots (checked 2026-07-13, source vibe.naver.com/chart/total)
const VIBE_MOVERS: { rank: number; move: number; artist: string; song: string; slug?: string }[] = [
  { rank: 21, move: 8, artist: "RESCENE",  song: "Pretty Girl" },
  { rank: 72, move: 6, artist: "(G)I-DLE", song: "나는 아픈 건 딱 질색이니까 (Fate)", slug: "g-i-dle" },
  { rank: 86, move: 5, artist: "DAY6",     song: "예뻤어 (You Were Beautiful)", slug: "day6" },
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
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            <T
              en="Sourced from Research Vault · Updated 2026-05-20"
              es="Extraído del archivo de investigación · Actualizado 2026-05-20"
            />
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>
            <T en="K-pop Signals" es="Señales del K-pop" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
            <T
              en="Live chart data, streaming milestones, social media rankings, and breaking artist news — aggregated from Soompi, Billboard, Gaon, Spotify, and more."
              es="Datos de charts en vivo, hitos de streaming, rankings de redes sociales y noticias de última hora — recopilado de Soompi, Billboard, Gaon, Spotify y más."
            />
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
                <div className="section-header" style={{ margin: 0 }}>
                  <T en="K-pop Chart — Week 15, 2026" es="Chart de K-pop — Semana 15, 2026" />
                </div>
                <span style={{ fontSize: "0.65rem", background: "var(--genius-yellow)", color: "var(--on-accent)", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>
                  <T en="APRIL 12" es="12 DE ABRIL" />
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--genius-gray)", marginBottom: 16 }}>
                <T en="Source: onlyhit.us" es="Fuente: onlyhit.us" />
              </p>
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
                      <T en={entry.move} es={entry.moveEs} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                <T
                  en="Notable: BTS has two songs charting simultaneously — 'Hooligan' climbing, 'SWIM' falling. LE SSERAFIM × j-hope collab gaining fast."
                  es="Para destacar: BTS tiene dos canciones en el chart al mismo tiempo — 'Hooligan' subiendo y 'SWIM' cayendo. La colab de LE SSERAFIM × j-hope agarra vuelo rápido."
                />
              </div>
            </section>

            {/* VIBE Top 100 — biggest climbers */}
            <section style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                <div className="section-header" style={{ margin: 0 }}>
                  <T en="VIBE Top 100 — Biggest Climbers" es="VIBE Top 100 — Los Que Más Suben" />
                </div>
                <span style={{ fontSize: "0.65rem", background: "var(--genius-yellow)", color: "var(--on-accent)", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>
                  <T en="JUL 13" es="13 DE JUL" />
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--genius-gray)", marginBottom: 16 }}>
                <T
                  en="Songs up 5+ spots on Naver VIBE’s daily Top 100 ·"
                  es="Canciones que subieron 5+ puestos en el Top 100 diario de Naver VIBE ·"
                />{" "}
                <a href="https://vibe.naver.com/chart/total" target="_blank" rel="noopener noreferrer" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
                  <T en="Source: VIBE →" es="Fuente: VIBE →" />
                </a>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {VIBE_MOVERS.map((entry) => (
                  <div key={entry.song} className="genius-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.88rem", color: "var(--on-accent)" }}>
                      {entry.rank}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {entry.slug ? (
                        <Link href={`/artists/${entry.slug}`} style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)", textDecoration: "none" }}>{entry.artist}</Link>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)" }}>{entry.artist}</span>
                      )}
                      <span style={{ marginLeft: 8, fontSize: "0.82rem", color: "var(--genius-gray)", fontStyle: "italic" }}>&ldquo;{entry.song}&rdquo;</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#16a34a", whiteSpace: "nowrap" }}>▲ {entry.move}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Chart News Items */}
            {chartNews.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <div className="section-header"><T en="Chart News" es="Noticias de Charts" /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {chartNews.map((item) => <NewsCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* Streaming Milestones */}
            {milestones.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <div className="section-header"><T en="Streaming Milestones" es="Hitos de Streaming" /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {milestones.map((item) => <NewsCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* Comebacks & Releases */}
            {comebacks.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <div className="section-header"><T en="Comebacks & Releases" es="Comebacks y Lanzamientos" /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {comebacks.map((item) => <NewsCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* Everything else */}
            {otherNews.length > 0 && (
              <section>
                <div className="section-header"><T en="More News" es="Más Noticias" /></div>
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
              <p style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginBottom: 12 }}>
                <T en="K-pop artists by followers, Q1 2026" es="Artistas de K-pop por seguidores, Q1 2026" />
              </p>
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
                <T en="Source: Koreaboo, blog.delivered.co.kr" es="Fuente: Koreaboo, blog.delivered.co.kr" />
              </div>
            </div>

            {/* Spotify Monthly Listeners */}
            <div style={{ marginBottom: 32 }}>
              <div className="section-header">
                <T en="Spotify Monthly Listeners" es="Oyentes Mensuales en Spotify" />
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginBottom: 12 }}>
                <T en="Top K-pop acts, ~Dec 2025" es="Top de artistas K-pop, ~dic. 2025" />
              </p>
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
                <T en="Source: kpopbeen.com, Outlookindia/Respawn" es="Fuente: kpopbeen.com, Outlookindia/Respawn" />
              </div>
            </div>

            {/* Scraped images */}
            <div>
              <div className="section-header"><T en="From the Vault" es="Del Archivo" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { src: "/scraped/images/instagram-followers-2026.jpg", label: "Instagram Top 10 (2026)", labelEs: "Top 10 de Instagram (2026)" },
                  { src: "/scraped/images/most-streamed-kpop-spotify-2025.jpg", label: "Most-Streamed K-pop (Spotify 2025)", labelEs: "K-pop más escuchado (Spotify 2025)" },
                  { src: "/scraped/images/bts-jungkook-jimin-spotify-2026.jpg", label: "Jungkook & Jimin Spotify Stats", labelEs: "Estadísticas de Jungkook y Jimin en Spotify" },
                  { src: "/scraped/images/groups-vs-soloists-breakdown.jpg", label: "Groups vs Soloists Breakdown", labelEs: "Grupos vs. Solistas en detalle" },
                ].map(({ src, label, labelEs }) => (
                  <div key={src} style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--genius-border)" }}>
                    <img src={src} alt={label} style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 160 }} />
                    <div style={{ padding: "6px 10px", fontSize: "0.68rem", color: "var(--ink-dim)", background: "rgba(255,255,255,0.06)", fontWeight: 600 }}>
                      <T en={label} es={labelEs} />
                    </div>
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
  // Both locale strings are formatted server-side; <T> picks one client-side.
  const fmtDate = (locale: string) =>
    item.publishedAt
      ? new Date(item.publishedAt).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
      : "";
  const sourceSuffix = item.source ? ` · ${item.source}` : "";
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
              <T en={fmtDate("en-US") + sourceSuffix} es={fmtDate("es-MX") + sourceSuffix} />
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
