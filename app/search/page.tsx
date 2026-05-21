import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function fetchResults(query: string) {
  if (query) {
    const [songs, artists, terms] = await Promise.all([
      prisma.song.findMany({
        where: { title: { contains: query } },
        include: { album: { include: { artist: true } } },
        take: 10,
        orderBy: { viewCount: "desc" },
      }),
      prisma.artist.findMany({
        where: { stageName: { contains: query } },
        include: { label: true },
        take: 8,
      }),
      prisma.codedTerm.findMany({
        where: { term: { contains: query } },
        include: { definitions: { take: 1, orderBy: { votesUp: "desc" } } },
        take: 6,
      }),
    ]);
    return { songs, artists, terms };
  } else {
    const [songs, artists] = await Promise.all([
      prisma.song.findMany({
        include: { album: { include: { artist: true } } },
        orderBy: { viewCount: "desc" },
        take: 12,
      }),
      prisma.artist.findMany({
        where: { type: "GROUP" },
        include: { label: true },
        orderBy: { stageName: "asc" },
        take: 24,
      }),
    ]);
    return { songs, artists, terms: [] as Prisma.CodedTermGetPayload<{ include: { definitions: true } }>[] };
  }
}

// Record labels: Big 4 + boutique labels
const LABELS = [
  { slug: "hybe-entertainment",   name: "HYBE",       color: "#ff6b35", acts: ["BTS","LE SSERAFIM","NewJeans","TXT","ENHYPEN","ILLIT"] },
  { slug: "sm-entertainment",     name: "SM",         color: "#e4002b", acts: ["EXO","aespa","NCT","Red Velvet","SHINee","SNSD"] },
  { slug: "yg-entertainment",     name: "YG",         color: "#ffd700", acts: ["BLACKPINK","BIGBANG","WINNER","iKON","BABYMONSTER","2NE1"] },
  { slug: "jyp-entertainment",    name: "JYP",        color: "#00b4d8", acts: ["TWICE","Stray Kids","ITZY","GOT7","DAY6","NMIXX"] },
  { slug: "starship-entertainment", name: "Starship", color: "#9b5de5", acts: ["IVE","Monsta X","SISTAR","Kiiikiii","CRAVITY","ASTRO"] },
  { slug: "rbw-entertainment",    name: "RBW",        color: "#06d6a0", acts: ["MAMAMOO","ONEWE","Purple Kiss","EVNNE"] },
  { slug: "kq-entertainment",     name: "KQ",         color: "#e63946", acts: ["ATEEZ","Xikers","EXO-CBX"] },
  { slug: "cube-entertainment",   name: "CUBE",       color: "#7b2d8b", acts: ["(G)I-DLE","INSEong","BTOB","HyunA","CLC"] },
  { slug: "fnc-entertainment",    name: "FNC",        color: "#2ec4b6", acts: ["N.Flying","AOA","CNBlue","SF9","P1Harmony"] },
  { slug: "ist-entertainment",    name: "IST",        color: "#ff9f1c", acts: ["APINK","VICTON","BTOB Blue","fromis_9"] },
  { slug: "edam-entertainment",   name: "EDAM",       color: "#a8dadc", acts: ["IU","Kim Feel"] },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const { songs, artists, terms } = await fetchResults(query);
  const totalResults = songs.length + artists.length + terms.length;

  // For default view: SM groups showcase + all group artists
  const smGroups = !query
    ? await prisma.artist.findMany({
        where: { type: "GROUP", label: { slug: "sm-entertainment" } },
        include: { label: true },
        orderBy: { stageName: "asc" },
      })
    : [];

  return (
    <main>
      {/* Search Header */}
      <section style={{ background: "#000", color: "#fff", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 20px" }}>
            {query ? `Results for "${query}"` : "Explore K-pop"}
          </h1>
          <form action="/search" style={{ display: "flex", gap: 8, maxWidth: 520 }}>
            <input name="q" type="search" defaultValue={query} placeholder="Search songs, artists, terms..." className="search-input" style={{ flex: 1 }} />
            <button type="submit" className="btn-yellow">SEARCH</button>
          </form>
          {query && (
            <div style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* Songs */}
        {songs.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">{query ? "Songs" : "Popular Songs"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {songs.map((song) => {
                const cover = song.coverArt ?? song.album?.coverArt ?? song.album?.artist?.imageUrl;
                return (
                  <Link key={song.id} href={`/songs/${song.slug}`} style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 4, overflow: "hidden", flexShrink: 0, background: "#1a1a2e" }}>
                        {cover ? (
                          <img src={cover} alt={song.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🎵</div>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 2 }}>
                          {song.album?.artist?.stageName}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Artists / K-pop Groups */}
        {artists.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">{query ? "Artists" : "K-pop Groups"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {artists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
                  <div className="member-card" style={{ padding: 16, textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", margin: "0 auto 10px", background: "#f0f0f0" }}>
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.stageName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", background: "#1a1a2e" }}>
                          {artist.type === "GROUP" ? "🎤" : "⭐"}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#000" }}>{artist.stageName}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 3 }}>{artist.label?.name ?? ""}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SM Entertainment Showcase (default view only) */}
        {!query && smGroups.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div className="section-header" style={{ margin: 0 }}>SM Entertainment</div>
              <span style={{ background: "#e4002b", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 10px", borderRadius: 999, letterSpacing: "0.08em" }}>
                SM FAMILY
              </span>
            </div>
            <div style={{ background: "linear-gradient(135deg, #1a0010 0%, #0f0020 100%)", borderRadius: 8, padding: "24px 20px", border: "1px solid rgba(228,0,43,0.3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                {smGroups.map((artist) => (
                  <Link key={artist.id} href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ textAlign: "center", padding: "12px 8px" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", margin: "0 auto 8px", border: "2px solid rgba(228,0,43,0.5)", background: "#111" }}>
                        {artist.imageUrl ? (
                          <img src={artist.imageUrl} alt={artist.stageName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", background: "#1a1a2e" }}>🎤</div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#fff" }}>{artist.stageName}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Terms */}
        {terms.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">K-pop Terms</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {terms.map((term) => (
                <Link key={term.id} href={`/define/${term.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#000", marginBottom: 6 }}>{term.term}</div>
                    {term.definitions[0] && (
                      <div style={{ fontSize: "0.83rem", color: "#555", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {term.definitions[0].body}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {query && totalResults === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--genius-gray)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>No results for &ldquo;{query}&rdquo;</div>
            <div style={{ marginTop: 8 }}>Try searching for an artist name, song title, or K-pop term</div>
          </div>
        )}

        {/* Record Labels — always shown on default view */}
        {!query && (
          <section style={{ marginTop: 16 }}>
            <div className="section-header">Record Labels</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {LABELS.map((label) => (
                <Link key={label.slug} href={`/labels/${label.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 18, borderTop: `3px solid ${label.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: label.color, flexShrink: 0 }} />
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#000" }}>{label.name}</div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {label.acts.slice(0, 4).map((act) => (
                        <span key={act} style={{ background: "#f4f4f4", color: "#444", fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>
                          {act}
                        </span>
                      ))}
                      {label.acts.length > 4 && (
                        <span style={{ color: "var(--genius-gray)", fontSize: "0.68rem", padding: "2px 4px" }}>+{label.acts.length - 4} more</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
