import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Dynamic album/song/artist image resolver. Unlike the old static-map /api/image-refresh,
// this resolves art for ANY catalog entity at runtime:
//   • album / song cover art  → iTunes Search API (stable mzstatic URLs)
//   • artist photos           → Wikipedia REST summary thumbnail (fallback: a top album cover)
// Secret-gated. Batched + throttled to respect iTunes' ~20 req/min limit. Idempotent;
// run repeatedly (daily) until coverage is complete.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "aegyoarena/1.0 (image-refresh)" };
const RATE_LIMIT = "__RATE_LIMIT__";

// iTunes Search → high-res cover art. Returns a URL, null (not found), or RATE_LIMIT.
async function itunesArt(term: string, entity: "album" | "song"): Promise<string | null> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=1&country=US`;
  try {
    const r = await fetch(url, { headers: UA, cache: "no-store" });
    if (r.status === 403 || r.status === 429) return RATE_LIMIT;
    if (!r.ok) return null;
    const j = await r.json();
    const art: string | undefined = j?.results?.[0]?.artworkUrl100;
    if (!art) return null;
    return art.replace(/\/\d+x\d+bb\.(jpg|png)/, "/600x600bb.$1");
  } catch {
    return null;
  }
}

// Wikipedia REST summary → page image (skips disambiguation pages).
async function wikiArtistImage(name: string): Promise<string | null> {
  for (const t of [name, `${name} (group)`, `${name} (singer)`, `${name} (rapper)`, `${name} (band)`, `${name} (musician)`]) {
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, "_"))}`, { headers: UA, cache: "no-store" });
      if (!r.ok) continue;
      const j = await r.json();
      if (j?.type === "disambiguation") continue;
      const thumb: string | undefined = j?.originalimage?.source || j?.thumbnail?.source;
      if (thumb) return thumb;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [albumsTotal, albumsNoArt, artistsTotal, artistsNoImg, songsTotal, songsNoArt] = await Promise.all([
    prisma.album.count(),
    prisma.album.count({ where: { OR: [{ coverArt: null }, { coverArt: "" }] } }),
    prisma.artist.count(),
    prisma.artist.count({ where: { OR: [{ imageUrl: null }, { imageUrl: "" }] } }),
    prisma.song.count(),
    prisma.song.count({ where: { OR: [{ coverArt: null }, { coverArt: "" }] } }),
  ]);
  return NextResponse.json({
    albums: { total: albumsTotal, missing: albumsNoArt },
    artists: { total: artistsTotal, missing: artistsNoImg },
    songs: { total: songsTotal, missing: songsNoArt },
  });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const kind = String(b?.kind ?? "albums");
  const limit = Math.min(Number(b?.limit ?? 18), 40);
  const force = b?.force === true; // re-fetch non-stable (potentially-broken) URLs too
  const delay = Math.max(800, Number(b?.delayMs ?? 2600));
  // Optional: target specific artist slugs (fills their art regardless of current state).
  const slugs: string[] | null = Array.isArray(b?.slugs) && b.slugs.length ? b.slugs.map((s: unknown) => String(s)) : null;

  let processed = 0, filled = 0, failed = 0, rateLimited = false;

  if (kind === "albums") {
    const where = slugs
      ? { artistSlug: { in: slugs }, OR: [{ coverArt: null }, { coverArt: "" }, { NOT: { coverArt: { contains: "mzstatic.com" } } }] }
      : force
      ? { OR: [{ coverArt: null }, { coverArt: "" }, { NOT: { coverArt: { contains: "mzstatic.com" } } }] }
      : { OR: [{ coverArt: null }, { coverArt: "" }] };
    const albums = await prisma.album.findMany({ where, include: { artist: { select: { stageName: true } } }, orderBy: { releaseYear: "desc" }, take: limit });
    for (const a of albums) {
      processed++;
      const art = await itunesArt(`${a.artist?.stageName ?? ""} ${a.title}`, "album");
      if (art === RATE_LIMIT) { rateLimited = true; break; }
      if (art) { await prisma.album.update({ where: { id: a.id }, data: { coverArt: art } }); filled++; } else failed++;
      await sleep(delay);
    }
  } else if (kind === "songs") {
    // Songs missing their own cover; skip ones that inherit album art on the page.
    const songs = await prisma.song.findMany({
      where: { OR: [{ coverArt: null }, { coverArt: "" }] },
      include: { album: { include: { artist: { select: { stageName: true } } } } },
      orderBy: { viewCount: "desc" }, take: limit * 4,
    });
    for (const s of songs) {
      if (s.album?.coverArt) continue; // inherits album art on the page — leave it
      if (processed >= limit) break;
      processed++;
      const artistName = s.album?.artist?.stageName ?? "";
      const art = await itunesArt(`${artistName} ${s.title}`, "song");
      if (art === RATE_LIMIT) { rateLimited = true; break; }
      if (art) { await prisma.song.update({ where: { id: s.id }, data: { coverArt: art } }); filled++; } else failed++;
      await sleep(delay);
    }
  } else if (kind === "artists") {
    const where = slugs
      ? { slug: { in: slugs } }
      : force
      ? { OR: [{ imageUrl: null }, { imageUrl: "" }, { NOT: { imageUrl: { contains: "wikimedia.org" } } }] }
      : { OR: [{ imageUrl: null }, { imageUrl: "" }] };
    const artists = await prisma.artist.findMany({ where, orderBy: { stageName: "asc" }, take: limit });
    for (const ar of artists) {
      processed++;
      let img = await wikiArtistImage(ar.stageName);
      if (!img) {
        // fallback: the artist's most recent album cover so the page isn't empty
        const alb = await prisma.album.findFirst({ where: { artistSlug: ar.slug, NOT: [{ coverArt: null }, { coverArt: "" }] }, orderBy: { releaseYear: "desc" }, select: { coverArt: true } });
        img = alb?.coverArt ?? null;
      }
      if (img) { await prisma.artist.update({ where: { id: ar.id }, data: { imageUrl: img } }); filled++; } else failed++;
      await sleep(400);
    }
  } else {
    return NextResponse.json({ error: "kind must be albums|songs|artists" }, { status: 400 });
  }

  // remaining (missing) after this batch
  const remaining =
    kind === "albums" ? await prisma.album.count({ where: { OR: [{ coverArt: null }, { coverArt: "" }] } })
    : kind === "songs" ? await prisma.song.count({ where: { OR: [{ coverArt: null }, { coverArt: "" }] } })
    : await prisma.artist.count({ where: { OR: [{ imageUrl: null }, { imageUrl: "" }] } });

  return NextResponse.json({ ok: true, kind, processed, filled, failed, rateLimited, remaining });
}
