import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Homepage news feed. Each row keeps BOTH the ORIGINAL story (origHeadline,
// origSubheadline, image, publisher, url) AND the REWRITTEN version the site
// publishes (headline, subheadline, body — written in the Aegyo Arena voice by
// the `news-publisher` skill). The homepage shows the rewritten copy over the
// original image, linking back to the source. Self-contained table, created +
// migrated additively on first use (mirrors ScannedEvent).
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "NewsPost" (
      "id"              TEXT PRIMARY KEY,
      "slug"            TEXT,
      "headline"        TEXT NOT NULL,
      "subheadline"     TEXT,
      "body"            TEXT,
      "esHeadline"      TEXT,
      "esSubheadline"   TEXT,
      "bodyEs"          TEXT,
      "origHeadline"    TEXT,
      "origSubheadline" TEXT,
      "imageUrl"        TEXT,
      "imageCredit"     TEXT,
      "category"        TEXT,
      "tag"             TEXT,
      "artistSlug"      TEXT,
      "artistName"      TEXT,
      "sourceName"      TEXT,
      "sourceUrl"       TEXT NOT NULL,
      "readMins"        INTEGER NOT NULL DEFAULT 2,
      "publishedAt"     TIMESTAMP,
      "status"          TEXT NOT NULL DEFAULT 'live',
      "createdAt"       TIMESTAMP NOT NULL DEFAULT now()
    )`);
  // Additive migration for tables created before the original/rewritten/es split.
  await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "slug" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "bodyEs" TEXT`);
  // Articles are hosted at /news/<artistSlug>/<slug>, so slugs must be unique.
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "NewsPost_slug_key" ON "NewsPost" ("slug") WHERE "slug" IS NOT NULL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "esHeadline" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "esSubheadline" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "origHeadline" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "origSubheadline" TEXT`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "NewsPost_sourceUrl_key" ON "NewsPost" ("sourceUrl")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "NewsPost_status_pub_idx" ON "NewsPost" ("status", "publishedAt")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "NewsPost_tag_idx" ON "NewsPost" ("tag")`);
  tableReady = true;
}
export { ensureTable as ensureNewsTable };

function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

const CATS = ["news", "gossip", "rumor", "chart", "comeback", "award", "collab", "debut", "controversy"];
function normCat(v: unknown): string {
  const s = String(v ?? "news").toLowerCase().trim();
  if (CATS.includes(s)) return s;
  if (/gossip|dating|scandal/.test(s)) return "gossip";
  if (/rumor|rumour|speculat/.test(s)) return "rumor";
  if (/chart|billboard|melon|hot100/.test(s)) return "chart";
  if (/comeback|release|album|single|mv/.test(s)) return "comeback";
  if (/award|daesang|win/.test(s)) return "award";
  if (/collab|feat/.test(s)) return "collab";
  if (/debut/.test(s)) return "debut";
  if (/controversy|backlash|apolog/.test(s)) return "controversy";
  return "news";
}
function readMins(body: string): number {
  const words = (body || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.min(9, Math.round(words / 200) || 2));
}

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

// Articles live at /news/<artistSlug>/<slug>, so a slug can't collide with a
// DIFFERENT story. Re-publishing the same sourceUrl keeps its slug (stable URLs).
async function uniqueSlug(desired: string, sourceUrl: string): Promise<string> {
  const base = slugify(desired) || "story";
  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.$queryRaw<{ sourceUrl: string }[]>`
      SELECT "sourceUrl" FROM "NewsPost" WHERE "slug" = ${candidate} LIMIT 1`;
    if (!taken.length || taken[0].sourceUrl === sourceUrl) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

type PostIn = {
  slug?: string; headline?: string; subheadline?: string; body?: string; bodyEs?: string;
  esHeadline?: string; esSubheadline?: string;
  origHeadline?: string; origSubheadline?: string;
  imageUrl?: string; imageCredit?: string;
  category?: string; tag?: string; artistSlug?: string; artistName?: string;
  sourceName?: string; sourceUrl?: string; readMins?: number; publishedAt?: string;
};

// Ingest a batch of rewritten posts. Idempotent: dedup + upsert by sourceUrl.
export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTable();
    const b = await req.json().catch(() => ({}));
    const posts: PostIn[] = Array.isArray(b?.posts) ? b.posts : Array.isArray(b) ? b : [];
    if (!posts.length) return NextResponse.json({ error: "Provide { posts: [...] }" }, { status: 400 });

    let received = 0, upserted = 0;
    for (const p of posts) {
      const headline = String(p.headline ?? "").trim();
      const sourceUrl = String(p.sourceUrl ?? "").trim();
      if (!headline || !sourceUrl) continue;
      received++;
      const subheadline = p.subheadline ? String(p.subheadline).trim() : null;
      const body = p.body ? String(p.body).trim() : null;
      const esHeadline = p.esHeadline ? String(p.esHeadline).trim() : null;
      const esSubheadline = p.esSubheadline ? String(p.esSubheadline).trim() : null;
      const bodyEs = p.bodyEs ? String(p.bodyEs).trim() : null;
      // Slug from the publisher, else derived from the rewritten headline.
      const slug = await uniqueSlug(String(p.slug ?? "").trim() || headline, sourceUrl);
      const origHeadline = p.origHeadline ? String(p.origHeadline).trim() : null;
      const origSubheadline = p.origSubheadline ? String(p.origSubheadline).trim() : null;
      const imageUrl = p.imageUrl ? String(p.imageUrl).trim() : null;
      const imageCredit = p.imageCredit ? String(p.imageCredit).trim() : (p.sourceName ? String(p.sourceName).trim() : null);
      // Must be null when omitted, or the COALESCE below can't tell "not provided"
      // from a real value and a partial update would silently reset it to 'news'.
      const category = p.category != null ? normCat(p.category) : null;
      const tag = p.tag ? String(p.tag).trim() : (p.artistSlug ? String(p.artistSlug).trim() : null);
      const artistSlug = p.artistSlug ? String(p.artistSlug).trim() : null;
      const artistName = p.artistName ? String(p.artistName).trim() : null;
      const sourceName = p.sourceName ? String(p.sourceName).trim() : null;
      // 0 = "not provided" sentinel (never a real read time) so the COALESCE/NULLIF
      // below preserves the stored value on a partial update instead of resetting it.
      const rm = Number(p.readMins) > 0
        ? Math.round(Number(p.readMins))
        : (body != null || subheadline != null ? readMins(body ?? subheadline ?? "") : 0);
      // Null when omitted — otherwise a partial update would stamp now() and reorder
      // the feed. Publishers always send publishedAt for genuinely new posts.
      let publishedAt: Date | null = null;
      if (p.publishedAt) { const d = new Date(p.publishedAt); if (!isNaN(d.getTime())) publishedAt = d; }

      const n = await prisma.$executeRaw`
        INSERT INTO "NewsPost"
          ("id","slug","headline","subheadline","body","bodyEs","esHeadline","esSubheadline","origHeadline","origSubheadline","imageUrl","imageCredit","category","tag","artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt","status")
        VALUES
          (${randomUUID()}, ${slug}, ${headline}, ${subheadline}, ${body}, ${bodyEs}, ${esHeadline}, ${esSubheadline}, ${origHeadline}, ${origSubheadline}, ${imageUrl}, ${imageCredit}, ${category}, ${tag}, ${artistSlug}, ${artistName}, ${sourceName}, ${sourceUrl}, ${rm}, ${publishedAt}, 'live')
        ON CONFLICT ("sourceUrl") DO UPDATE SET
          "slug"            = COALESCE("NewsPost"."slug", EXCLUDED."slug"),
          "bodyEs"          = COALESCE(EXCLUDED."bodyEs",          "NewsPost"."bodyEs"),
          "headline" = EXCLUDED."headline",
          "subheadline"     = COALESCE(EXCLUDED."subheadline",     "NewsPost"."subheadline"),
          "body"            = COALESCE(EXCLUDED."body",            "NewsPost"."body"),
          "esHeadline"      = COALESCE(EXCLUDED."esHeadline",      "NewsPost"."esHeadline"),
          "esSubheadline"   = COALESCE(EXCLUDED."esSubheadline",   "NewsPost"."esSubheadline"),
          "origHeadline"    = COALESCE(EXCLUDED."origHeadline",    "NewsPost"."origHeadline"),
          "origSubheadline" = COALESCE(EXCLUDED."origSubheadline", "NewsPost"."origSubheadline"),
          "imageUrl"        = COALESCE(EXCLUDED."imageUrl",        "NewsPost"."imageUrl"),
          "imageCredit"     = COALESCE(EXCLUDED."imageCredit",     "NewsPost"."imageCredit"),
          "category"        = COALESCE(EXCLUDED."category",        "NewsPost"."category"),
          "tag"             = COALESCE(EXCLUDED."tag",             "NewsPost"."tag"),
          "artistSlug"      = COALESCE(EXCLUDED."artistSlug",      "NewsPost"."artistSlug"),
          "artistName"      = COALESCE(EXCLUDED."artistName",      "NewsPost"."artistName"),
          "sourceName"      = COALESCE(EXCLUDED."sourceName",      "NewsPost"."sourceName"),
          "readMins"    = COALESCE(NULLIF(EXCLUDED."readMins", 0), "NewsPost"."readMins"),
          "publishedAt" = COALESCE(EXCLUDED."publishedAt",         "NewsPost"."publishedAt")`;
      upserted += Number(n);
    }
    const total = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "NewsPost" WHERE "status" = 'live'`;
    return NextResponse.json({ ok: true, received, upserted, liveTotal: Number(total[0]?.c ?? 0) });
  } catch (e) {
    console.error("news-posts ingest error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// Secret-gated hide/unhide by sourceUrl or id.
export async function PATCH(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTable();
    const b = await req.json().catch(() => ({}));
    const status = b.status === "hidden" ? "hidden" : "live";
    if (b.id) await prisma.$executeRaw`UPDATE "NewsPost" SET "status" = ${status} WHERE "id" = ${String(b.id)}`;
    else if (b.sourceUrl) await prisma.$executeRaw`UPDATE "NewsPost" SET "status" = ${status} WHERE "sourceUrl" = ${String(b.sourceUrl)}`;
    else return NextResponse.json({ error: "Provide id or sourceUrl" }, { status: 400 });
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
