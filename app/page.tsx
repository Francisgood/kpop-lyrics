import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

// Re-generate the homepage every 5 minutes so trending & news stay fresh
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aegyo Arena — K-pop Lyrics, Translations & Fan Wiki",
  description: "Korean lyrics with romanization and English translation. Fan-edited annotations, K-pop slang explainers, and artist deep-dives. Updated daily.",
  openGraph: {
    title: "Aegyo Arena — K-pop Lyrics, Translations & Fan Wiki",
    description: "Every lyric. Every meaning. Korean lyrics, fan annotations, and the ultimate K-pop slang dictionary.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function HomePage() {
  const [trendingSongs, groups, latestNews, soloistRows] = await Promise.all([
    prisma.song.findMany({
      orderBy: { viewCount: "desc" },
      take: 8,
      include: { album: { include: { artist: true } } },
    }),
    prisma.artist.findMany({
      where: { type: "GROUP" },
      take: 6,
      include: { label: true },
      orderBy: { stageName: "asc" },
    }),
    prisma.artistNews.findMany({
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { artist: true },
    }),
    // Featured soloists — SOLOIST type artists plus Doja Cat (COLLAB type) with images
    prisma.artist.findMany({
      where: {
        imageUrl: { not: null },
        OR: [
          { type: "SOLOIST" },
          { slug: "doja-cat" },
        ],
      },
      take: 6,
      orderBy: { stageName: "asc" },
    }),
  ]);

  const soloists = soloistRows.filter(a => a.imageUrl);

  // Top 3 by viewCount get a 🔥 Trending badge
  const trendingIds = new Set(trendingSongs.slice(0, 3).map(s => s.id));

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #000 0%, #1a1a2e 60%, #0f3460 100%)", color: "#fff", padding: "80px 24px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", color: "var(--genius-yellow)", marginBottom: 12, textTransform: "uppercase" }}>
            The Ultimate K-pop Wiki
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px" }}>
            Every lyric.<br />Every meaning.
          </h1>
          <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.7)", maxWidth: 520, marginBottom: 32 }}>
            Korean lyrics with romanization and English translation. Fan-edited annotations, K-pop slang, and artist deep-dives.
          </p>
          <form action="/search" style={{ display: "flex", gap: 8, maxWidth: 480 }}>
            <input name="q" type="search" placeholder="Search for a song or artist..." className="search-input" style={{ flex: 1 }} />
            <button type="submit" className="btn-yellow">SEARCH</button>
          </form>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>

        {/* Today in K-pop — latest news strip */}
        {latestNews.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div className="section-header" style={{ margin: 0 }}>Today in K-pop</div>
              <span style={{ fontSize: "0.68rem", background: "#FFFF64", color: "#000", fontWeight: 800, padding: "3px 8px", borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                LIVE
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {latestNews.map(item => {
                const catColors: Record<string, { bg: string; color: string }> = {
                  milestone: { bg: "#FFFF64", color: "#000" },
                  comeback:  { bg: "#000",    color: "#FFFF64" },
                  award:     { bg: "#ACFA52", color: "#000" },
                  collab:    { bg: "#e0e0ff", color: "#000" },
                  label:     { bg: "#1a1a2e", color: "#fff" },
                  legal:     { bg: "#FF2A38", color: "#fff" },
                  member:    { bg: "#f0f0f0", color: "#000" },
                };
                const cat = catColors[item.category] ?? { bg: "#f0f0f0", color: "#000" };
                return (
                  <Link key={item.id} href={`/artists/${item.artist.slug}`} style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start", position: "relative", overflow: "hidden" }}>
                      {item.artist.imageUrl && (
                        <img src={item.artist.imageUrl} alt="" style={{ position: "absolute", top: 0, right: 0, height: "100%", width: 70, objectFit: "cover", opacity: 0.07 }} />
                      )}
                      {item.artist.imageUrl ? (
                        <img src={item.artist.imageUrl} alt={item.artist.stageName} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #eee" }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🎤</div>
                      )}
                      <div style={{ minWidth: 0, position: "relative" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.75rem", color: "#000" }}>{item.artist.stageName}</span>
                          <span style={{ fontSize: "0.62rem", background: cat.bg, color: cat.color, padding: "2px 6px", borderRadius: 999, fontWeight: 700, textTransform: "uppercase" }}>{item.category}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#000", lineHeight: 1.4, marginBottom: 3 }}>{item.headline}</div>
                        {item.publishedAt && (
                          <div style={{ fontSize: "0.68rem", color: "var(--genius-gray)" }}>
                            {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {item.source ? ` · ${item.source}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Trending Songs */}
        <section style={{ marginBottom: 56 }}>
          <div className="section-header">Trending Songs</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {trendingSongs.map((song) => (
              <Link key={song.id} href={`/songs/${song.slug}`} style={{ textDecoration: "none" }}>
                <div className="genius-card" style={{ padding: "16px", display: "flex", gap: 14, alignItems: "center", position: "relative" }}>
                  {trendingIds.has(song.id) && (
                    <span style={{ position: "absolute", top: 8, right: 10, fontSize: "0.62rem", background: "#FF2A38", color: "#fff", fontWeight: 800, padding: "2px 6px", borderRadius: 999, letterSpacing: "0.06em" }}>
                      🔥 HOT
                    </span>
                  )}
                  {(song.coverArt || song.album?.coverArt) ? (
                    <img
                      src={song.coverArt || song.album?.coverArt || ""}
                      alt={song.title}
                      style={{ width: 56, height: 56, borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 56, height: 56, borderRadius: 4, flexShrink: 0,
                      background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.4rem",
                    }}>🎵</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {song.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--genius-gray)", marginTop: 2 }}>
                      {song.album?.artist?.stageName ?? "Unknown Artist"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 2 }}>
                      {song.viewCount.toLocaleString()} views
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 48 }}>
          {/* Featured Groups + Soloists */}
          <section>
            <div className="section-header">Featured Groups</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: soloists.length > 0 ? 40 : 0 }}>
              {groups.map((group) => (
                <Link key={group.id} href={`/artists/${group.slug}`} style={{ textDecoration: "none" }}>
                  <div className="member-card" style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, overflow: "hidden", position: "relative" }}>
                    {group.imageUrl ? (
                      <img src={group.imageUrl} alt={group.stageName} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} />
                    ) : (
                      <div style={{ fontSize: "2.5rem" }}>🎤</div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000" }}>{group.stageName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)" }}>{group.label?.name ?? ""}</div>
                  </div>
                </Link>
              ))}
            </div>

            {soloists.length > 0 && (
              <>
                <div className="section-header">Featured Soloists</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                  {soloists.map((artist) => (
                    <Link key={artist.id} href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
                      <div className="member-card" style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, overflow: "hidden", position: "relative" }}>
                        <img src={artist.imageUrl!} alt={artist.stageName} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} />
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000" }}>{artist.stageName}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Labels Sidebar */}
          <section>
            <div className="section-header">Labels</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["HYBE Entertainment", "/labels/hybe-entertainment"],
                ["SM Entertainment",  "/labels/sm-entertainment"],
                ["YG Entertainment",  "/labels/yg-entertainment"],
                ["JYP Entertainment", "/labels/jyp-entertainment"],
                ["Starship Entertainment", "/labels/starship-entertainment"],
              ].map(([name, href]) => (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#000" }}>{name}</div>
                    <div style={{ color: "var(--genius-gray)", fontSize: "1.2rem" }}>›</div>
                  </div>
                </Link>
              ))}
              <Link href="/define" className="btn-yellow" style={{ textAlign: "center", marginTop: 8 }}>
                EXPLORE K-POP TERMS
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
