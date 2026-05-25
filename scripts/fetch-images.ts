/**
 * fetch-images.ts
 * Searches Wikipedia + Cover Art Archive for artist/album images,
 * updates Prisma DB with the resolved URLs.
 *
 * Run:  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-images.ts
 * API:  POST /api/image-refresh  (requires IMAGE_REFRESH_SECRET header)
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ── Wikipedia title mapping ───────────────────────────────────────────────────
// Keys must match Artist.slug in the DB.
export const ARTIST_WIKI: Record<string, string> = {
  // ── Major groups ────────────────────────────────────────────────────────────
  "bts":              "BTS",
  "blackpink":        "Blackpink",
  "twice":            "Twice (group)",
  "aespa":            "Aespa",
  "newjeans":         "NewJeans",
  "seventeen":        "Seventeen (South Korean band)",
  "kiiikiii":         "Kiiikiii",
  "ive":              "IVE (group)",
  "itzy":             "Itzy",
  "stray-kids":       "Stray Kids",
  "txt":              "Tomorrow X Together",
  "enhypen":          "Enhypen",
  "le-sserafim":      "Le Sserafim",
  "g-i-dle":          "(G)I-DLE",
  "ateez":            "Ateez",
  "red-velvet":       "Red Velvet (group)",
  "nct-127":          "NCT 127",
  "nct-dream":        "NCT Dream",
  "girls-generation": "Girls' Generation",
  "shinee":           "SHINee",
  "exo":              "Exo (group)",
  "mamamoo":          "Mamamoo",
  "sistar":           "Sistar",
  "2ne1":             "2NE1",
  "bigbang":          "Big Bang (South Korean band)",
  "winner":           "Winner (band)",
  "ikon":             "iKon",
  "monsta-x":         "Monsta X",
  "day6":             "Day6",
  "got7":             "Got7",
  "illit":            "Illit (group)",
  "babymonster":      "Babymonster (group)",
  "zerobaseone":      "Zerobaseone",
  "riize":            "Riize",
  "fx":               "F(x) (group)",
  "miss-a":           "Miss A",
  "apink":            "Apink",
  "nmixx":            "Nmixx",
  // ── Western / international acts ────────────────────────────────────────────
  "lisa":                "Lisa (rapper)",
  "rosalia":             "Rosalía",
  "doja-cat":            "Doja Cat",
  "raye":                "Raye (singer)",
  "future":              "Future (rapper)",
  "megan-thee-stallion": "Megan Thee Stallion",
  "tyla":                "Tyla (singer)",
  // ── COLLAB producers with Wikipedia pages ────────────────────────────────────
  "pharrell":            "Pharrell Williams",
  "diplo":               "Diplo",
  "ryan-tedder":         "Ryan Tedder",
  "nile-rodgers":        "Nile Rodgers",
  "slushii":             "Slushii",
  // ── BTS solos ────────────────────────────────────────────────────────────────
  "rm-bts":        "RM (rapper)",
  "jin-bts":       "Jin (singer)",
  "suga-bts":      "Suga (rapper)",
  "j-hope-bts":    "J-Hope",
  "jimin-bts":     "Jimin",
  "v-bts":         "V (singer)",
  "jungkook-bts":  "Jungkook",
  // ── BLACKPINK solos / members ────────────────────────────────────────────────
  "jisoo-blackpink":  "Jisoo",
  "jennie-blackpink": "Jennie (rapper)",
  "rose-blackpink":   "Rosé (singer)",
  "lisa-blackpink":   "Lisa (rapper)",
  // ── Other key solos ──────────────────────────────────────────────────────────
  "iu":       "IU (singer)",
  // BIGBANG solos
  "g-dragon": "G-Dragon",
  "taeyang":  "Taeyang",
  "top-bigbang": "T.O.P",
  "daesung":  "Daesung",
  "seungri":  "Seungri",
  // ── Key members with solo Wikipedia pages ────────────────────────────────────
  // TWICE
  "nayeon-twice":    "Im Na-yeon",
  "momo-twice":      "Hirai Momo",
  "sana-twice":      "Minatozaki Sana",
  "jihyo-twice":     "Park Ji-hyo",
  "mina-twice":      "Myoui Mina",
  "tzuyu-twice":     "Chou Tzu-yu",
  "dahyun-twice":    "Kim Da-hyun",
  // aespa
  "karina-aespa":  "Karina (South Korean singer)",
  "winter-aespa":  "Winter (singer)",
  "giselle-aespa": "Giselle (singer)",
  // NewJeans
  "minji-newjeans":   "Kim Min-ji (singer)",
  "hanni-newjeans":   "Hanni (singer)",
  "danielle-newjeans":"Danielle (singer)",
  "haerin-newjeans":  "Kang Hae-rin",
  // Red Velvet
  "seulgi-rv": "Seulgi",
  "wendy-rv":  "Wendy (singer)",
  "joy-rv":    "Joy (singer)",
  "yeri-rv":   "Yeri (singer)",
  // IVE
  "wonyoung-ive": "Jang Won-young",
  "yujin-ive":    "An Yu-jin",
  // SEVENTEEN
  "s-coups-svt":    "S.Coups",
  "woozi-svt":      "Woozi",
  "hoshi-svt":      "Hoshi (singer)",
  "mingyu-svt":     "Mingyu (singer)",
  "jeonghan-svt":   "Yoon Jeong-han",
  "joshua-svt":     "Joshua Hong",
  "wonwoo-svt":     "Jeon Won-woo",
  "dokyeom-svt":    "Lee Seok-min",
  "seungkwan-svt":  "Boo Seung-kwan",
  // LE SSERAFIM
  "sakura-lsf":  "Miyawaki Sakura",
  "chaewon-lsf": "Kim Chae-won",
  "yunjin-lsf":  "Huh Yun-jin",
  // MAMAMOO
  "solar-mamamoo":    "Solar (singer)",
  "moonbyul-mamamoo": "Moonbyul",
  "wheein-mamamoo":   "Wheein",
  // (G)I-DLE
  "soyeon-gidle": "Jeon Soyeon",
  "miyeon-gidle": "Miyeon",
  "minnie-gidle": "Minnie (singer)",
};

// Album slug → Wikipedia page title (for album art)
export const ALBUM_WIKI: Record<string, string> = {
  "map-of-the-soul-persona": "Map of the Soul: Persona",
  "love-yourself-answer":    "Love Yourself: Answer",
  "born-pink":               "Born Pink",
  "the-album":               "The Album (Blackpink album)",
  "formula-of-love":         "Formula of Love: O+T=<3",
  "savage-ep":               "Savage (Aespa EP)",
  "omg":                     "OMG (NewJeans EP)",
  "lalisa":                  "Lalisa (EP)",
};

// Album slug → iTunes search term (more reliable for album art)
export const ALBUM_ITUNES: Record<string, string> = {
  // BTS
  "map-of-the-soul-persona": "BTS Map of the Soul Persona",
  "love-yourself-answer":    "BTS Love Yourself Answer",
  // BLACKPINK
  "born-pink":               "BLACKPINK Born Pink",
  "the-album":               "BLACKPINK The Album",
  // TWICE
  "formula-of-love":         "TWICE Formula of Love",
  // aespa
  "savage-ep":               "aespa Savage",
  // NewJeans
  "omg":                     "NewJeans OMG",
  // LISA
  "lalisa":                  "LISA LALISA",
  "alter-ego":               "LISA Alter Ego",
  // IVE
  "ive-eleven":              "IVE ELEVEN",
  "ive-ive":                 "IVE IVE IVE",
  // Stray Kids
  "skz-maxident":            "Stray Kids MAXIDENT",
  "skz-5-star":              "Stray Kids 5-STAR",
  // TXT
  "txt-minisode-2":          "TXT minisode 2 Thursday Child",
  // ENHYPEN
  "enhypen-border-day-one":  "ENHYPEN BORDER DAY ONE",
  // LE SSERAFIM
  "le-sserafim-fearless":    "LE SSERAFIM FEARLESS",
  "le-sserafim-antifragile": "LE SSERAFIM ANTIFRAGILE",
  // (G)I-DLE
  "g-i-dle-i-never-die":    "(G)I-DLE I NEVER DIE",
  "g-i-dle-i-feel":         "(G)I-DLE I feel",
  // ATEEZ
  "ateez-zero-fever-part-1": "ATEEZ ZERO FEVER Part 1",
  // aespa
  "aespa-my-world":          "aespa MY WORLD",
  // NewJeans
  "newjeans-ot":             "NewJeans NewJeans",
  // Red Velvet
  "rv-perfect-velvet":       "Red Velvet Perfect Velvet",
  "rv-queendom":             "Red Velvet Queendom",
  // EXO
  "exo-xoxo":                "EXO XOXO",
  // NCT 127
  "nct-127-regular-irregular": "NCT 127 Regular-Irregular",
  // MAMAMOO
  "mamamoo-reality-in-black": "MAMAMOO Reality in Black",
  // BIGBANG
  "bigbang-made":             "BIGBANG MADE",
  // BTS solos
  "rm-indigo":               "RM Indigo",
  "jungkook-golden":         "Jungkook GOLDEN",
  "jimin-face":              "Jimin FACE",
  "v-layover":               "V Layover",
  "j-hope-jack-in-the-box":  "j-hope Jack in the Box",
  "agust-d-d-day":           "Agust D D-DAY",
  // IU
  "iu-lilac":                "IU LILAC",
  "iu-palette":              "IU Palette",
  // APINK
  "apink-pink-tape":         "Apink Pink Tape",
  // NMIXX
  "nmixx-expergo":           "NMIXX expergo",
  // SEVENTEEN
  "seventeen-face-the-sun":  "SEVENTEEN Face the Sun",
  // ITZY
  "itzy-checkmate":          "ITZY CHECKMATE",
  // Doja Cat
  "doja-cat-hot-pink":       "Doja Cat Hot Pink",
  // Lady Gaga
  "lady-gaga-chromatica":    "Lady Gaga Chromatica",
  // Girls' Generation
  "snsd-the-boys":           "Girls Generation The Boys",
  // SHINee
  "shinee-1-of-1":           "SHINee 1 of 1",
  // BABYMONSTER
  "babymonster-batter-up":   "BABYMONSTER BATTER UP",
  // ILLIT
  "illit-super-real-me":     "ILLIT Super Real Me",
};

// ── iTunes Search API (album art) ─────────────────────────────────────────────
export async function fetchItunesAlbumArt(searchTerm: string): Promise<string | null> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=album&limit=1`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "AegyoAnnotate/1.0" } });
    if (!res.ok) return null;
    const data = await res.json() as { results: Array<{ artworkUrl100?: string }> };
    const art = data.results?.[0]?.artworkUrl100;
    if (!art) return null;
    return art.replace("100x100bb", "600x600bb");
  } catch {
    return null;
  }
}

// ── Wikipedia API ─────────────────────────────────────────────────────────────
export async function fetchWikipediaImage(title: string, size = 600): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?action=query&titles=${encodeURIComponent(title)}` +
    `&prop=pageimages&format=json&pithumbsize=${size}&redirects=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AegyoAnnotate/1.0 (https://github.com/aegyo-annotate)" },
    });
    if (!res.ok) return null;
    const data = await res.json() as Record<string, unknown>;
    const query = data.query as Record<string, unknown>;
    const pages = query?.pages as Record<string, Record<string, unknown>>;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    if (page.missing !== undefined) return null;
    const thumb = page.thumbnail as { source?: string } | undefined;
    return thumb?.source ?? null;
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
export async function fetchAllImages(): Promise<{ updated: number; skipped: number }> {
  let updated = 0;
  let skipped = 0;

  // Artists
  const artists = await prisma.artist.findMany();
  for (const artist of artists) {
    const wikiTitle = ARTIST_WIKI[artist.slug];
    if (!wikiTitle) { skipped++; continue; }

    process.stdout.write(`  artist: ${artist.stageName} … `);
    const imageUrl = await fetchWikipediaImage(wikiTitle);
    if (!imageUrl) { console.log("no image"); skipped++; continue; }

    await prisma.artist.update({ where: { id: artist.id }, data: { imageUrl } });
    console.log("✓");
    updated++;
  }

  // Albums — try iTunes first (best quality), fallback to Wikipedia
  const albums = await prisma.album.findMany();
  for (const album of albums) {
    const itunesTerm = ALBUM_ITUNES[album.slug];
    const wikiTitle  = ALBUM_WIKI[album.slug];
    if (!itunesTerm && !wikiTitle) { skipped++; continue; }

    process.stdout.write(`  album:  ${album.title} … `);
    let imageUrl: string | null = null;
    if (itunesTerm) imageUrl = await fetchItunesAlbumArt(itunesTerm);
    if (!imageUrl && wikiTitle) imageUrl = await fetchWikipediaImage(wikiTitle);
    if (!imageUrl) { console.log("no image"); skipped++; continue; }

    await prisma.album.update({ where: { id: album.id }, data: { coverArt: imageUrl } });
    await prisma.song.updateMany({ where: { albumId: album.id }, data: { coverArt: imageUrl } });
    console.log("✓");
    updated++;
  }

  return { updated, skipped };
}

// CLI entrypoint
if (require.main === module) {
  console.log("🔍 Fetching images from Wikipedia…\n");
  fetchAllImages()
    .then(({ updated, skipped }) => {
      console.log(`\n✅ Done — ${updated} updated, ${skipped} skipped`);
    })
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
