import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Common English words that don't make good standalone search terms
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "by", "in", "of", "a", "an", "is", "are",
  "was", "were", "lyrics", "produced", "songs", "music", "from", "about",
  "has", "have", "that", "this", "but", "not", "all", "feat", "featuring",
]);

// Common K-pop romanization variants / misspellings → canonical form
// Lets users find terms even with different romanization conventions.
const SLANG_SYNONYMS: Record<string, string> = {
  "saesang":    "sasaeng",
  "sasaing":    "sasaeng",
  "oppar":      "oppa",
  "aigoo":      "aigo",
  "aigo":       "aigo",
  "hwaiting":   "fighting",
  "maknea":     "maknae",
  "dongsaeng":  "dongsaeng",
  "unni":       "unnie",
  "noona":      "noona",
  "hyung":      "hyung",
  "oppa":       "oppa",
};

// Extract meaningful individual terms from a query (for long-tail fallback)
function meaningfulWords(query: string): string[] {
  return query
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));
}

// Resolve synonym (if any) for the query
function resolveQuery(q: string): string {
  return SLANG_SYNONYMS[q.toLowerCase().trim()] ?? q;
}

async function fetchResults(query: string) {
  // ── Default (no query) ────────────────────────────────────────────────
  if (!query) {
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
    return {
      songs, artists,
      terms:  [] as Prisma.CodedTermGetPayload<{ include: { definitions: true } }>[],
      albums: [] as Prisma.AlbumGetPayload<{ include: { artist: true } }>[],
      city:   null as Prisma.CityGetPayload<{ include: { artists: { include: { artist: { include: { label: true } } } }; songs: { include: { song: { include: { album: { include: { artist: true } } } } } } } }> | null,
      isEmpty: false,
      fallbackWord: null as string | null,
    };
  }

  // ── Active query ──────────────────────────────────────────────────────
  // Resolve common romanization synonyms (e.g. "saesang" → "sasaeng")
  const raw = query.trim();
  const q   = resolveQuery(raw);
  const isLongTail = q.split(/\s+/).length >= 3;
  const words      = meaningfulWords(q);
  // Sorted longest → shortest for fallback selection
  const wordsByLen = [...words].sort((a, b) => b.length - a.length);

  // Credit search: exact full query + each meaningful word (for long-tail)
  const creditArtistConditions = [
    { stageName: { contains: q,   mode: "insensitive" as const } },
    { realName:  { contains: q,   mode: "insensitive" as const } },
    ...(isLongTail
      ? words.flatMap(w => [
          { stageName: { contains: w, mode: "insensitive" as const } },
          { realName:  { contains: w, mode: "insensitive" as const } },
        ])
      : []),
  ];

  const [
    exactSongs, containsSongs,
    exactArtists, containsArtists,
    termsByText, termsBySlug,
    exactAlbums, containsAlbums,
    creditSongs, lyricSongs,
    cities,
  ] = await Promise.all([
    // Songs — exact title first (fixes "Butter" vs "Butterfly" false-positive)
    prisma.song.findMany({
      where: { title: { equals: q, mode: "insensitive" } },
      include: { album: { include: { artist: true } } },
      take: 5, orderBy: { viewCount: "desc" },
    }),
    // Songs — contains title
    prisma.song.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      include: { album: { include: { artist: true } } },
      take: 10, orderBy: { viewCount: "desc" },
    }),
    // Artists — exact stage name
    prisma.artist.findMany({
      where: { stageName: { equals: q, mode: "insensitive" } },
      include: { label: true },
      take: 4,
    }),
    // Artists — contains stage name OR real name
    prisma.artist.findMany({
      where: {
        OR: [
          { stageName: { contains: q, mode: "insensitive" } },
          { realName:  { contains: q, mode: "insensitive" } },
        ],
      },
      include: { label: true },
      take: 8,
    }),
    // Terms — by text
    prisma.codedTerm.findMany({
      where: { term: { contains: q, mode: "insensitive" } },
      include: { definitions: { take: 1, orderBy: { votesUp: "desc" } } },
      take: 6,
    }),
    // Terms — by slug (catches variant spellings: "saesang" → slug "sasaeng")
    prisma.codedTerm.findMany({
      where: { slug: { contains: q.toLowerCase().replace(/\s+/g, "-") } },
      include: { definitions: { take: 1, orderBy: { votesUp: "desc" } } },
      take: 3,
    }),
    // Albums — exact title
    prisma.album.findMany({
      where: { title: { equals: q, mode: "insensitive" } },
      include: { artist: true },
      take: 3, orderBy: { releaseYear: "desc" },
    }),
    // Albums — contains title
    prisma.album.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      include: { artist: true },
      take: 6, orderBy: { releaseYear: "desc" },
    }),
    // Credits — songs where a credited artist matches the query
    // (finds "produced by Teddy" → songs where Teddy is in SongCredit)
    prisma.song.findMany({
      where: { credits: { some: { artist: { OR: creditArtistConditions } } } },
      include: { album: { include: { artist: true } } },
      take: 6, orderBy: { viewCount: "desc" },
    }),
    // Lyrics — long-tail queries only (avoids noise for short queries)
    isLongTail && words.length > 0
      ? prisma.song.findMany({
          where: {
            OR: [
              { lyricsEn:        { contains: q,             mode: Prisma.QueryMode.insensitive } },
              { lyricsRomanized: { contains: q,             mode: Prisma.QueryMode.insensitive } },
              { lyricsEn:        { contains: wordsByLen[0] ?? q, mode: Prisma.QueryMode.insensitive } },
              { lyricsRomanized: { contains: wordsByLen[0] ?? q, mode: Prisma.QueryMode.insensitive } },
            ],
          },
          include: { album: { include: { artist: true } } },
          take: 5, orderBy: { viewCount: "desc" },
        })
      : Promise.resolve([] as Prisma.SongGetPayload<{ include: { album: { include: { artist: true } } } }>[]),
    // City / localized search
    prisma.city.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: {
        artists: {
          include: { artist: { include: { label: true } } },
          take: 8,
        },
        songs: {
          include: { song: { include: { album: { include: { artist: true } } } } },
          orderBy: { rank: "asc" },
          take: 6,
        },
      },
      take: 1,
    }),
  ]);

  // ── Deduplicate songs (exact → contains → credits → lyrics) ──────────
  type SongWithAlbum = Prisma.SongGetPayload<{ include: { album: { include: { artist: true } } } }>;
  const seenSong = new Set<string>();
  const songs: SongWithAlbum[] = [];
  const allSongs = [...exactSongs, ...containsSongs, ...creditSongs, ...(lyricSongs as SongWithAlbum[])];
  for (const s of allSongs) {
    if (!seenSong.has(s.id)) { seenSong.add(s.id); songs.push(s); }
  }

  // ── Deduplicate artists (exact → contains) ────────────────────────────
  const seenArtist = new Set<string>();
  const artists: typeof exactArtists = [];
  for (const a of [...exactArtists, ...containsArtists]) {
    if (!seenArtist.has(a.id)) { seenArtist.add(a.id); artists.push(a); }
  }

  // ── Deduplicate terms (text → slug) ───────────────────────────────────
  const seenTerm = new Set<string>();
  const terms: typeof termsByText = [];
  for (const t of [...termsByText, ...termsBySlug]) {
    if (!seenTerm.has(t.id)) { seenTerm.add(t.id); terms.push(t); }
  }

  // ── Deduplicate albums (exact → contains) ────────────────────────────
  const seenAlbum = new Set<string>();
  const albums: typeof exactAlbums = [];
  for (const al of [...exactAlbums, ...containsAlbums]) {
    if (!seenAlbum.has(al.id)) { seenAlbum.add(al.id); albums.push(al); }
  }

  const city = cities[0] ?? null;

  // ── Long-tail fallback ────────────────────────────────────────────────
  // If results are very sparse and the query has multiple words, retry using
  // the single longest meaningful word (e.g. "SEVENTEEN vocal unit" → "SEVENTEEN")
  let fallbackWord: string | null = null;
  const totalSoFar = songs.length + artists.length + terms.length + albums.length + (city ? 1 : 0);
  if (isLongTail && totalSoFar < 3 && wordsByLen.length > 0) {
    fallbackWord = wordsByLen[0];
    const [fSongs, fArtists, fAlbums] = await Promise.all([
      prisma.song.findMany({
        where: { title: { contains: fallbackWord, mode: "insensitive" } },
        include: { album: { include: { artist: true } } },
        take: 5, orderBy: { viewCount: "desc" },
      }),
      prisma.artist.findMany({
        where: {
          OR: [
            { stageName: { contains: fallbackWord, mode: "insensitive" } },
            { realName:  { contains: fallbackWord, mode: "insensitive" } },
          ],
        },
        include: { label: true },
        take: 4,
      }),
      prisma.album.findMany({
        where: { title: { contains: fallbackWord, mode: "insensitive" } },
        include: { artist: true },
        take: 4, orderBy: { releaseYear: "desc" },
      }),
    ]);
    for (const s of fSongs)  { if (!seenSong.has(s.id))   { seenSong.add(s.id);   songs.push(s);   } }
    for (const a of fArtists){ if (!seenArtist.has(a.id)) { seenArtist.add(a.id); artists.push(a); } }
    for (const al of fAlbums){ if (!seenAlbum.has(al.id)) { seenAlbum.add(al.id); albums.push(al); } }
  }

  const finalSongs   = songs.slice(0, 10);
  const finalArtists = artists.slice(0, 8);
  const finalAlbums  = albums.slice(0, 6);
  const finalTerms   = terms.slice(0, 6);

  // ── Log empty searches ────────────────────────────────────────────────
  const isEmpty = finalSongs.length + finalArtists.length + finalTerms.length + finalAlbums.length + (city ? 1 : 0) === 0;
  if (isEmpty) {
    // Non-blocking — log the original user query (before synonym resolution)
    prisma.searchMiss.create({ data: { query: raw } }).catch(() => {});
  }

  return {
    songs:   finalSongs,
    artists: finalArtists,
    terms:   finalTerms,
    albums:  finalAlbums,
    city,
    isEmpty,
    // resolvedQuery is the synonym-resolved version; show "saesang → sasaeng" hint if different
    resolvedQuery: q !== raw ? q : null,
    fallbackWord:  totalSoFar < 3 ? fallbackWord : null,
  };
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

  const { songs, artists, terms, albums, city, isEmpty, fallbackWord, resolvedQuery } = await fetchResults(query);
  const totalResults = songs.length + artists.length + terms.length + albums.length + (city ? 1 : 0);

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
              {resolvedQuery && (
                <span style={{ marginLeft: 10, color: "var(--genius-yellow)", fontSize: "0.78rem" }}>
                  → showing results for &ldquo;{resolvedQuery}&rdquo;
                </span>
              )}
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
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                    <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", margin: "0 auto 10px", background: "var(--surface)" }}>
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.stageName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", background: "#1a1a2e" }}>
                          {artist.type === "GROUP" ? "🎤" : "⭐"}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--ink)" }}>{artist.stageName}</div>
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
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--ink)", marginBottom: 6 }}>{term.term}</div>
                    {term.definitions[0] && (
                      <div style={{ fontSize: "0.83rem", color: "var(--ink-dim)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {term.definitions[0].body}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">Albums</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {albums.map((album) => (
                <Link key={album.id} href={`/albums/${album.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#1a1a2e" }}>
                      {album.coverArt ? (
                        <img src={album.coverArt} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>💿</div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {album.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 2 }}>
                        {album.artist.stageName}
                        {album.releaseYear ? ` · ${album.releaseYear}` : ""}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* City / Localized results */}
        {city && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="section-header" style={{ margin: 0 }}>
                {city.flag && <span style={{ marginRight: 6 }}>{city.flag}</span>}
                K-pop in {city.name}
              </div>
              <Link href={`/cities/${city.slug}`} style={{ fontSize: "0.72rem", color: "var(--genius-yellow)", fontWeight: 700, textDecoration: "none", letterSpacing: "0.05em" }}>
                VIEW ALL →
              </Link>
            </div>
            {city.artists.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                  Artists popular here
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {city.artists.map((ac) => (
                    <Link key={ac.id} href={`/artists/${ac.artist.slug}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--genius-border)", borderRadius: 6, padding: "8px 12px" }}>
                        {ac.artist.imageUrl && (
                          <img src={ac.artist.imageUrl} alt={ac.artist.stageName} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                        )}
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>{ac.artist.stageName}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {city.songs.length > 0 && (
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                  Trending songs
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {city.songs.map((sc, i) => (
                    <Link key={sc.id} href={`/songs/${sc.song.slug}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--genius-border)", borderRadius: 6 }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--genius-gray)", width: 18, textAlign: "right" }}>#{i + 1}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--ink)" }}>{sc.song.title}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>{sc.song.album?.artist?.stageName}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Long-tail fallback notice */}
        {fallbackWord && totalResults > 0 && (
          <div style={{ padding: "10px 16px", background: "#fffbea", border: "1px solid #ffe566", borderRadius: 6, fontSize: "0.82rem", color: "var(--ink-dim)", marginBottom: 32 }}>
            Showing results related to <strong>{fallbackWord}</strong> — no exact match for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Empty state */}
        {query && isEmpty && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--genius-gray)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>No results for &ldquo;{query}&rdquo;</div>
            <div style={{ marginTop: 8 }}>Try searching for an artist name, song title, album, or K-pop term</div>
            <div style={{ marginTop: 16, fontFamily: "monospace", fontSize: "0.72rem", color: "var(--ink-dim)", letterSpacing: "0.05em" }}>
              ERROR_SEARCH_NO_RESULTS
            </div>
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
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)" }}>{label.name}</div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {label.acts.slice(0, 4).map((act) => (
                        <span key={act} style={{ background: "var(--surface)", color: "var(--ink-dim)", fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>
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
