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
  "bts":                 "BTS",
  "blackpink":           "Blackpink",
  "twice":               "Twice (group)",
  "aespa":               "Aespa",
  "newjeans":            "NewJeans",
  "seventeen":           "Seventeen (band)",
  "kiiikiii":            "Kiiikiii",
  "lisa":                "Lisa (rapper)",
  "rosalia":             "Rosalía",
  "doja-cat":            "Doja Cat",
  "raye":                "Raye (singer)",
  "future":              "Future (rapper)",
  "megan-thee-stallion": "Megan Thee Stallion",
  "tyla":                "Tyla (singer)",
  // BTS members
  "rm-bts":              "RM (rapper)",
  "jin-bts":             "Jin (singer)",
  "suga-bts":            "Suga (rapper)",
  "jhope-bts":           "J-Hope",
  "jimin-bts":           "Jimin",
  "v-bts":               "V (singer)",
  "jungkook-bts":        "Jungkook",
  // BLACKPINK members
  "jisoo-blackpink":     "Jisoo",
  "jennie-blackpink":    "Jennie (rapper)",
  "rose-blackpink":      "Rosé (singer)",
  "lisa-blackpink":      "Lisa (rapper)",
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
  "map-of-the-soul-persona": "BTS Map of the Soul Persona",
  "love-yourself-answer":    "BTS Love Yourself Answer",
  "born-pink":               "BLACKPINK Born Pink",
  "the-album":               "BLACKPINK The Album",
  "formula-of-love":         "TWICE Formula of Love",
  "savage-ep":               "aespa Savage",
  "omg":                     "NewJeans OMG",
  "lalisa":                  "LISA LALISA",
  "alter-ego":               "LISA Alter Ego",
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
