import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── Slang card media (GIF / image / hangul) for the Tinder-style slang deck ──────
//
// Self-contained, self-healing table keyed by the CodedTerm slug (same raw-SQL
// idiom as GiveawayEntry / NewsPost — no Prisma migration, works on prod Postgres
// with no local DB). The /korean-slang deck reads it defensively; if this table
// doesn't exist yet the deck just shows branded gradient cards.
//
// The GIFs are a *drop-in*: the deck ships with animated gradient fallbacks today,
// and `GET ?populate=1` back-fills a real GIF per term the moment a GIPHY_API_KEY
// is present in the environment — no code change, no redeploy.
//
// PII-free, but still secret-gated (writes to prod) — keep IMAGE_REFRESH_SECRET private.

function authed(req: NextRequest): boolean {
  const s = process.env.IMAGE_REFRESH_SECRET;
  return !!s && req.headers.get("authorization") === `Bearer ${s}`;
}

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SlangMedia" (
      "slug"      TEXT PRIMARY KEY,
      "gifUrl"    TEXT,
      "imageUrl"  TEXT,
      "hangul"    TEXT,
      "source"    TEXT,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);
}

type MediaRow = { slug: string; gifUrl: string | null; imageUrl: string | null; hangul: string | null; source: string | null };

// Fetch one PG-13 GIF for a term from Giphy. Returns the media URL or null.
async function giphyFor(term: string, key: string): Promise<string | null> {
  const tryQuery = async (q: string): Promise<string | null> => {
    const u = new URL("https://api.giphy.com/v1/gifs/search");
    u.searchParams.set("api_key", key);
    u.searchParams.set("q", q);
    u.searchParams.set("limit", "1");
    u.searchParams.set("rating", "pg-13"); // keep it safe-for-work / on-brand
    u.searchParams.set("lang", "en");
    u.searchParams.set("bundle", "messaging_non_clips");
    const r = await fetch(u.toString(), { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: Array<{ images?: Record<string, { url?: string }> }> };
    const img = j.data?.[0]?.images;
    if (!img) return null;
    // downsized_medium is a good size/quality tradeoff for a mobile card; fall back down the chain.
    return (
      img.downsized_medium?.url ||
      img.fixed_height?.url ||
      img.downsized?.url ||
      img.original?.url ||
      null
    );
  };
  // Bias toward K-pop reaction GIFs, then fall back to the bare term.
  return (await tryQuery(`${term} kpop`)) || (await tryQuery(term));
}

// GET                 → current media rows (count + list) for verification
// GET ?populate=1     → back-fill GIFs from Giphy for terms that don't have one yet
//        &limit=30    → how many to process this call (default 30; keeps us under timeouts + rate limits)
//        &force=1     → re-fetch even terms that already have a gifUrl
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTable();
  const url = new URL(req.url);

  if (url.searchParams.get("populate") === "1") {
    const key = process.env.GIPHY_API_KEY;
    if (!key) {
      return NextResponse.json({
        ok: false,
        note: "GIPHY_API_KEY is not set. Add it in Railway → Variables, then re-run GET ?populate=1 (repeat until remaining=0). Until then the deck shows branded gradient cards.",
      });
    }

    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "30") || 30, 1), 60);
    const force = url.searchParams.get("force") === "1";

    // Terms still needing a GIF (LEFT JOIN so we only hit Giphy for the gaps).
    const gap = await prisma.$queryRawUnsafe<{ slug: string; term: string }[]>(
      `SELECT c."slug", c."term"
         FROM "CodedTerm" c
         LEFT JOIN "SlangMedia" m ON m."slug" = c."slug"
        WHERE ${force ? "TRUE" : `(m."gifUrl" IS NULL OR m."gifUrl" = '')`}
        ORDER BY c."term" ASC
        LIMIT ${limit}`,
    );

    let populated = 0;
    const failed: string[] = [];
    for (const { slug, term } of gap) {
      let gifUrl: string | null = null;
      try {
        gifUrl = await giphyFor(term, key);
      } catch {
        gifUrl = null;
      }
      if (!gifUrl) { failed.push(term); continue; }
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SlangMedia" ("slug","gifUrl","source","updatedAt")
         VALUES ($1,$2,'giphy',now())
         ON CONFLICT ("slug") DO UPDATE SET "gifUrl" = EXCLUDED."gifUrl", "source" = 'giphy', "updatedAt" = now()`,
        slug, gifUrl,
      );
      populated++;
    }

    const remaining = await prisma.$queryRawUnsafe<{ c: number }[]>(
      `SELECT COUNT(*)::int AS c
         FROM "CodedTerm" c
         LEFT JOIN "SlangMedia" m ON m."slug" = c."slug"
        WHERE (m."gifUrl" IS NULL OR m."gifUrl" = '')`,
    );

    return NextResponse.json({
      ok: true,
      populated,
      failed,
      remaining: remaining[0]?.c ?? 0,
      note: (remaining[0]?.c ?? 0) > 0 ? "Re-run GET ?populate=1 to continue." : "All terms have a GIF. 🎉",
    });
  }

  const rows = await prisma.$queryRawUnsafe<MediaRow[]>(
    `SELECT "slug","gifUrl","imageUrl","hangul","source" FROM "SlangMedia" ORDER BY "slug" ASC`,
  );
  const withGif = rows.filter((r) => r.gifUrl).length;
  return NextResponse.json({ count: rows.length, withGif, rows });
}

// POST { items: [{ slug, gifUrl?, imageUrl?, hangul? }] } → manual upsert (curate by hand).
export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();

  let body: { items?: Array<{ slug?: string; gifUrl?: string; imageUrl?: string; hangul?: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const items = Array.isArray(body.items) ? body.items : [];
  let upserted = 0;
  for (const it of items) {
    if (!it.slug) continue;
    // COALESCE preserves any field the caller omits, so a hangul-only patch doesn't wipe a gifUrl.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SlangMedia" ("slug","gifUrl","imageUrl","hangul","source","updatedAt")
       VALUES ($1,$2,$3,$4,'manual',now())
       ON CONFLICT ("slug") DO UPDATE SET
         "gifUrl"   = COALESCE(EXCLUDED."gifUrl",   "SlangMedia"."gifUrl"),
         "imageUrl" = COALESCE(EXCLUDED."imageUrl", "SlangMedia"."imageUrl"),
         "hangul"   = COALESCE(EXCLUDED."hangul",   "SlangMedia"."hangul"),
         "source"   = 'manual',
         "updatedAt"= now()`,
      it.slug, it.gifUrl ?? null, it.imageUrl ?? null, it.hangul ?? null,
    );
    upserted++;
  }
  return NextResponse.json({ ok: true, upserted });
}
