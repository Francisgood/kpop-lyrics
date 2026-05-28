/**
 * Search QA — mirrors the improved fetchResults logic from app/search/page.tsx
 * Tests: exact-match priority, album search, credit search, lyrics search,
 *        long-tail word fallback, slug-based term lookup, city search.
 */
import { prisma } from "../lib/prisma";

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "by", "in", "of", "a", "an", "is", "are",
  "was", "were", "lyrics", "produced", "songs", "music", "from", "about",
  "has", "have", "that", "this", "but", "not", "all", "feat", "featuring",
]);

function meaningfulWords(query: string): string[] {
  return query
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));
}

async function search(query: string) {
  const q = query.trim();
  const isLongTail = q.split(/\s+/).length >= 3;
  const words      = meaningfulWords(q);
  const wordsByLen = [...words].sort((a, b) => b.length - a.length);

  const creditConds = [
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
    creditSongs, lyricSongs, cities,
  ] = await Promise.all([
    prisma.song.findMany({
      where: { title: { equals: q, mode: "insensitive" } },
      include: { album: { include: { artist: true } } },
      take: 5, orderBy: { viewCount: "desc" },
    }),
    prisma.song.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      include: { album: { include: { artist: true } } },
      take: 10, orderBy: { viewCount: "desc" },
    }),
    prisma.artist.findMany({
      where: { stageName: { equals: q, mode: "insensitive" } },
      include: { label: true }, take: 4,
    }),
    prisma.artist.findMany({
      where: { OR: [
        { stageName: { contains: q, mode: "insensitive" } },
        { realName:  { contains: q, mode: "insensitive" } },
      ] },
      include: { label: true }, take: 8,
    }),
    prisma.codedTerm.findMany({
      where: { term: { contains: q, mode: "insensitive" } },
      include: { definitions: { take: 1, orderBy: { votesUp: "desc" } } },
      take: 6,
    }),
    prisma.codedTerm.findMany({
      where: { slug: { contains: q.toLowerCase().replace(/\s+/g, "-") } },
      include: { definitions: { take: 1, orderBy: { votesUp: "desc" } } },
      take: 3,
    }),
    prisma.album.findMany({
      where: { title: { equals: q, mode: "insensitive" } },
      include: { artist: true }, take: 3, orderBy: { releaseYear: "desc" },
    }),
    prisma.album.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      include: { artist: true }, take: 6, orderBy: { releaseYear: "desc" },
    }),
    prisma.song.findMany({
      where: { credits: { some: { artist: { OR: creditConds } } } },
      include: { album: { include: { artist: true } } },
      take: 6, orderBy: { viewCount: "desc" },
    }),
    isLongTail && words.length > 0
      ? prisma.song.findMany({
          where: { OR: [
            { lyricsEn:        { contains: q,                  mode: "insensitive" } },
            { lyricsRomanized: { contains: q,                  mode: "insensitive" } },
            { lyricsEn:        { contains: wordsByLen[0] ?? q, mode: "insensitive" } },
            { lyricsRomanized: { contains: wordsByLen[0] ?? q, mode: "insensitive" } },
          ] },
          include: { album: { include: { artist: true } } },
          take: 5, orderBy: { viewCount: "desc" },
        })
      : Promise.resolve([] as any[]),
    prisma.city.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: {
        artists: { include: { artist: true }, take: 4 },
        songs:   { include: { song: true },   take: 3, orderBy: { rank: "asc" } },
      },
      take: 1,
    }),
  ]);

  // Dedup
  const seenSong = new Set<string>();
  const songs: any[] = [];
  for (const s of [...exactSongs, ...containsSongs, ...creditSongs, ...lyricSongs]) {
    if (!seenSong.has(s.id)) { seenSong.add(s.id); songs.push(s); }
  }
  const seenArtist = new Set<string>();
  const artists: any[] = [];
  for (const a of [...exactArtists, ...containsArtists]) {
    if (!seenArtist.has(a.id)) { seenArtist.add(a.id); artists.push(a); }
  }
  const seenTerm = new Set<string>();
  const terms: any[] = [];
  for (const t of [...termsByText, ...termsBySlug]) {
    if (!seenTerm.has(t.id)) { seenTerm.add(t.id); terms.push(t); }
  }
  const seenAlbum = new Set<string>();
  const albums: any[] = [];
  for (const al of [...exactAlbums, ...containsAlbums]) {
    if (!seenAlbum.has(al.id)) { seenAlbum.add(al.id); albums.push(al); }
  }
  const city = cities[0] ?? null;

  // Long-tail fallback
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
        where: { OR: [
          { stageName: { contains: fallbackWord, mode: "insensitive" } },
          { realName:  { contains: fallbackWord, mode: "insensitive" } },
        ] },
        include: { label: true }, take: 4,
      }),
      prisma.album.findMany({
        where: { title: { contains: fallbackWord, mode: "insensitive" } },
        include: { artist: true }, take: 4, orderBy: { releaseYear: "desc" },
      }),
    ]);
    for (const s of fSongs)  if (!seenSong.has(s.id))   { seenSong.add(s.id);   songs.push(s);   }
    for (const a of fArtists)if (!seenArtist.has(a.id)) { seenArtist.add(a.id); artists.push(a); }
    for (const al of fAlbums)if (!seenAlbum.has(al.id)) { seenAlbum.add(al.id); albums.push(al); }
  }

  return {
    songs:   songs.slice(0, 10),
    artists: artists.slice(0, 8),
    terms:   terms.slice(0, 6),
    albums:  albums.slice(0, 6),
    city,
    fallbackWord: totalSoFar < 3 ? fallbackWord : null,
    isEmpty: songs.length + artists.length + terms.length + albums.length + (city ? 1 : 0) === 0,
  };
}

async function main() {
  const queries: [string, string][] = [
    ["BLACKPINK",                       "artist"],
    ["BTS",                             "artist"],
    ["Dynamite",                        "song"],
    ["LALISA",                          "song"],
    ["Map of the Soul",                 "album"],
    ["TWICE",                           "artist"],
    ["aespa",                           "artist"],
    ["Stray Kids",                      "artist"],
    ["MAMAMOO",                         "artist"],
    ["Butter",                          "song — exact-match priority test"],
    ["New York",                        "localized"],
    ["Melbourne",                       "localized"],
    ["Seoul",                           "localized"],
    ["SEVENTEEN vocal unit",            "long-tail + fallback"],
    ["BTS DNA lyrics universe",         "long-tail + fallback"],
    ["produced by Teddy BLACKPINK",     "long-tail credits"],
    ["bias wrecker",                    "slang"],
    ["saesang",                         "slang — slug fallback test"],
    ["aegyo",                           "slang"],
  ];

  const emptyList: string[] = [];
  const fallbackList: string[] = [];

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  SEARCH QA REPORT — improved fetchResults logic");
  console.log("═══════════════════════════════════════════════════════════\n");

  for (const [q, cat] of queries) {
    const r = await search(q);
    const total = r.songs.length + r.artists.length + r.terms.length + r.albums.length + (r.city ? 1 : 0);
    const status = r.isEmpty ? "❌ EMPTY" : `✅ ${total} hits`;
    const fbTag = r.fallbackWord ? ` [fallback:"${r.fallbackWord}"]` : "";
    console.log(`[${status}] "${q}"  (${cat})${fbTag}`);
    if (r.songs.length)   console.log(`  songs:   ${r.songs.slice(0,3).map((s:any) => `"${s.title}" — ${s.album?.artist?.stageName ?? "?"}`).join(", ")}`);
    if (r.artists.length) console.log(`  artists: ${r.artists.slice(0,3).map((a:any) => a.stageName).join(", ")}`);
    if (r.albums.length)  console.log(`  albums:  ${r.albums.slice(0,3).map((al:any) => `"${al.title}" (${al.artist.stageName})`).join(", ")}`);
    if (r.terms.length)   console.log(`  terms:   ${r.terms.slice(0,3).map((t:any) => t.term).join(", ")}`);
    if (r.city)           console.log(`  city:    ${r.city.name} — ${r.city.artists.slice(0,3).map((ac:any) => ac.artist.stageName).join(", ") || "(no artists linked)"}`);
    if (r.isEmpty) emptyList.push(q);
    if (r.fallbackWord) fallbackList.push(`"${q}" → fell back to "${r.fallbackWord}"`);
  }

  console.log("\n── SUMMARY ─────────────────────────────────────────────");
  console.log(`  Tested: ${queries.length}  |  ERROR_SEARCH_NO_RESULTS: ${emptyList.length}`);
  if (emptyList.length)   console.log(`  Empty:    ${emptyList.map(q => `"${q}"`).join(", ")}`);
  if (fallbackList.length) console.log(`  Fallback: ${fallbackList.join("; ")}`);
  console.log();
}

main().catch(console.error).finally(() => prisma.$disconnect());
