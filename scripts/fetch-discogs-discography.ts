/**
 * fetch-discogs-discography.ts
 * Pulls artist discographies from the Discogs API and upserts Albums + Songs
 * into the Prisma DB. Only fetches "master" releases to avoid duplicate
 * regional editions. Skips albums that already exist by title+artist match.
 *
 * Rate limit: 25 req/min unauthenticated — 2.5 s delay enforced between calls.
 * With a Discogs token (60 req/min) set DISCOGS_TOKEN env var to speed up.
 *
 * Usage:
 *   DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' \
 *     scripts/fetch-discogs-discography.ts
 *
 *   # With a token (faster):
 *   DATABASE_URL="..." DISCOGS_TOKEN="your_token" npx ts-node ...
 *
 * To add more artists: append to DISCOGS_ARTIST_MAP below.
 * Discogs artist IDs can be found by searching https://www.discogs.com/search/?type=artist
 * or via: GET https://api.discogs.com/database/search?q={name}&type=artist
 */

import { PrismaClient } from "@prisma/client";
import * as https from "https";

const prisma = new PrismaClient();

const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN ?? "";
// Unauthenticated: 25 req/min → 2500 ms gap. With token: 60/min → 1100 ms.
const REQ_DELAY_MS = DISCOGS_TOKEN ? 1100 : 2600;
// Only include masters with this many tracks or more (filters out 1-track promos)
const MIN_TRACKS = 2;
// Max masters to process per artist (keeps runtime sane on debut-heavy artists)
const MAX_MASTERS_PER_ARTIST = 40;

// ── Artist slug → Discogs artist ID ──────────────────────────────────────────
// slug must match Artist.slug in the DB exactly.
const DISCOGS_ARTIST_MAP: Record<string, number> = {
  "bts":            5034422,
  "blackpink":      5210284,
  "twice":          4786543,
  "aespa":          8724412,
  "newjeans":       11594273,
  "seventeen":      5071504,
  "ive":            7122521,
  "itzy":           7296238,
  "stray-kids":     6838809,
  "enhypen":        8303009,
  "le-sserafim":    11171795,
  "txt":            7164941,
  "g-i-dle":        6605933,
  "ateez":          7164694,
  "red-velvet":     4390346,
  "nct-127":        5181064,
  "nct-dream":      6284600,
  "mamamoo":        4722103,
  "babymonster":    14457941,
  "zerobaseone":    13233045,
  "riize":          13421259,
  "nmixx":          10946579,
  "illit":          14486810,
  "girls-generation": 1584084,
  "exo":            4038105,
  "shinee":         1882255,
  "katseye":        14911211,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function albumType(trackCount: number, formatHint?: string): string {
  const f = (formatHint ?? "").toLowerCase();
  if (f.includes("single") || trackCount <= 2) return "Single";
  if (f.includes("ep") || trackCount <= 5) return "EP";
  if (f.includes("mini")) return "Mini Album";
  if (trackCount <= 6) return "Mini Album";
  return "Album";
}

function get(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      "User-Agent": "AegyoArena/1.0 +https://aegyoarena.com",
      "Accept": "application/json",
    };
    if (DISCOGS_TOKEN) headers["Authorization"] = `Discogs token=${DISCOGS_TOKEN}`;

    const req = https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e}`)); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

async function fetchWithDelay(url: string): Promise<any> {
  await sleep(REQ_DELAY_MS);
  return get(url);
}

// ── Core logic ────────────────────────────────────────────────────────────────

/** Fetch up to MAX_MASTERS_PER_ARTIST master releases for a Discogs artist. */
async function fetchMasters(discogsId: number): Promise<Array<{
  masterId: number;
  title: string;
  year: number;
  formatHint: string;
}>> {
  const masters: Array<{ masterId: number; title: string; year: number; formatHint: string }> = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && masters.length < MAX_MASTERS_PER_ARTIST) {
    const url = `https://api.discogs.com/artists/${discogsId}/releases?sort=year&sort_order=desc&per_page=50&page=${page}`;
    const data = await fetchWithDelay(url);

    totalPages = data.pagination?.pages ?? 1;

    for (const r of (data.releases ?? [])) {
      if (masters.length >= MAX_MASTERS_PER_ARTIST) break;
      // Only main releases (not guest/featuring appearances) and master records
      if (r.role !== "Main") continue;
      if (r.type !== "master") continue;
      if (!r.year || r.year < 2010) continue; // K-pop context: skip pre-2010

      masters.push({
        masterId: r.id,
        title:    r.title,
        year:     r.year,
        formatHint: r.format ?? "",
      });
    }
    page++;
  }
  return masters;
}

/** Fetch full master details including tracklist and cover art. */
async function fetchMasterDetail(masterId: number): Promise<{
  tracklist: string[];
  coverUrl: string | null;
  year: number;
  formatHint: string;
} | null> {
  try {
    const data = await fetchWithDelay(`https://api.discogs.com/masters/${masterId}`);
    const tracks = (data.tracklist ?? [])
      .filter((t: any) => t.type_ === "track" && t.title)
      .map((t: any) => t.title as string);

    const primaryImage = (data.images ?? []).find((i: any) => i.type === "primary");
    const coverUrl: string | null = primaryImage?.uri ?? null;

    const year: number = data.year ?? 0;
    const formatHint: string = (data.formats ?? []).map((f: any) => f.name).join(", ");

    return { tracklist: tracks, coverUrl, year, formatHint };
  } catch (e) {
    console.warn(`    ⚠️  Could not fetch master ${masterId}: ${e}`);
    return null;
  }
}

/** Upsert one album + its songs. Returns true if newly created. */
async function upsertAlbum(
  artistId: string,
  artistSlug: string,
  title: string,
  year: number,
  tracklist: string[],
  coverUrl: string | null,
  formatHint: string,
): Promise<boolean> {
  // Dedup by artist + normalised title
  const normTitle = title.trim().toUpperCase();
  const existing = await prisma.album.findFirst({
    where: {
      artistId,
      title: { equals: title.trim(), mode: "insensitive" },
    },
  });
  if (existing) return false;

  const baseSlug = slugify(`${artistSlug}-${title}`);
  // Ensure slug uniqueness
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.album.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${year}-${attempt}`;
  }

  const type = albumType(tracklist.length, formatHint);

  const album = await prisma.album.create({
    data: {
      slug,
      title: title.trim(),
      artistId,
      releaseYear: year || null,
      type,
      coverArt: coverUrl,
    },
  });

  // Upsert songs
  for (let i = 0; i < tracklist.length; i++) {
    const songTitle = tracklist[i].trim();
    if (!songTitle) continue;
    const songBaseSlug = slugify(`${slug}-${songTitle}`);
    let songSlug = songBaseSlug;
    let sa = 0;
    while (await prisma.song.findUnique({ where: { slug: songSlug } })) {
      sa++;
      songSlug = `${songBaseSlug}-${sa}`;
    }
    await prisma.song.create({
      data: {
        slug: songSlug,
        title: songTitle,
        albumId: album.id,
        releaseYear: year || null,
      },
    });
    // Also create credit so the song appears under this artist
    await prisma.songCredit.create({
      data: { songId: (await prisma.song.findUnique({ where: { slug: songSlug } }))!.id, artistId, role: "main" },
    }).catch(() => {}); // ignore if duplicate
  }

  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const totalArtists = Object.keys(DISCOGS_ARTIST_MAP).length;
  let grandCreated = 0;
  let grandSkipped = 0;
  let artistIdx = 0;

  for (const [slug, discogsId] of Object.entries(DISCOGS_ARTIST_MAP)) {
    artistIdx++;
    const artist = await prisma.artist.findUnique({ where: { slug } });
    if (!artist) {
      console.warn(`[${artistIdx}/${totalArtists}] ⚠️  Artist not in DB: ${slug}`);
      continue;
    }

    console.log(`\n[${artistIdx}/${totalArtists}] ${artist.stageName} (discogs #${discogsId})`);

    let masters;
    try {
      masters = await fetchMasters(discogsId);
    } catch (e) {
      console.warn(`  ⚠️  Failed to fetch releases: ${e}`);
      continue;
    }

    console.log(`  Found ${masters.length} master releases`);
    let created = 0;
    let skipped = 0;

    for (const m of masters) {
      const detail = await fetchMasterDetail(m.masterId);
      if (!detail || detail.tracklist.length < MIN_TRACKS) {
        skipped++;
        continue;
      }

      const wasCreated = await upsertAlbum(
        artist.id,
        slug,
        m.title,
        detail.year || m.year,
        detail.tracklist,
        detail.coverUrl,
        detail.formatHint || m.formatHint,
      );

      if (wasCreated) {
        created++;
        console.log(`  ✓ Added: ${m.title} (${m.year}, ${detail.tracklist.length} tracks)`);
      } else {
        skipped++;
        process.stdout.write(".");
      }
    }
    if (skipped > 0) console.log(""); // newline after dots

    console.log(`  → ${created} new albums, ${skipped} skipped`);
    grandCreated += created;
    grandSkipped += skipped;
  }

  console.log(`\n✅ Done. ${grandCreated} albums created, ${grandSkipped} skipped across ${totalArtists} artists.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
