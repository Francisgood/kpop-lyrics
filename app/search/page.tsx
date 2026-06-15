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
        take: 12,
      }),
    ]);
    return { songs, artists, terms: [] as Prisma.CodedTermGetPayload<{ include: { definitions: true } }>[] };
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const { songs, artists, terms } = await fetchResults(query);
  const totalResults = songs.length + artists.length + terms.length;

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
              {songs.map((song) => (
                <Link key={song.id} href={`/songs/${song.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 4, background: "linear-gradient(135deg, #1a1a2e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                      🎵
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
              ))}
            </div>
          </section>
        )}

        {/* Artists */}
        {artists.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">{query ? "Artists" : "K-pop Groups"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {artists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
                  <div className="member-card">
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>{artist.type === "GROUP" ? "🎤" : "⭐"}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#000" }}>{artist.stageName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 4 }}>{artist.label?.name ?? ""}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Terms */}
        {terms.length > 0 && (
          <section>
            <div className="section-header">Korean Slang</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {terms.map((term) => (
                <Link key={term.id} href={`/korean-slang/${term.slug}`} style={{ textDecoration: "none" }}>
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
      </div>
    </main>
  );
}
