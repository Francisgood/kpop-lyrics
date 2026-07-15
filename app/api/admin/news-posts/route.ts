import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Homepage news feed: original, aggregator-style posts (own-words summary + link
// back to the source). Written by the `news-publisher` skill from RSS sources.
// Self-contained table, created additively on first use (mirrors ScannedEvent).
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "NewsPost" (
      "id"          TEXT PRIMARY KEY,
      "headline"    TEXT NOT NULL,
      "subheadline" TEXT,
      "body"        TEXT,
      "imageUrl"    TEXT,
      "imageCredit" TEXT,
      "category"    TEXT,
      "tag"         TEXT,
      "artistSlug"  TEXT,
      "artistName"  TEXT,
      "sourceName"  TEXT,
      "sourceUrl"   TEXT NOT NULL,
      "readMins"    INTEGER NOT NULL DEFAULT 2,
      "publishedAt" TIMESTAMP,
      "status"      TEXT NOT NULL DEFAULT 'live',
      "createdAt"   TIMESTAMP NOT NULL DEFAULT now()
    )`);
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

type PostIn = {
  headline?: string; subheadline?: string; body?: string; imageUrl?: string; imageCredit?: string;
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
      const imageUrl = p.imageUrl ? String(p.imageUrl).trim() : null;
      const imageCredit = p.imageCredit ? String(p.imageCredit).trim() : (p.sourceName ? String(p.sourceName).trim() : null);
      const category = normCat(p.category);
      const tag = p.tag ? String(p.tag).trim() : (p.artistSlug ? String(p.artistSlug).trim() : null);
      const artistSlug = p.artistSlug ? String(p.artistSlug).trim() : null;
      const artistName = p.artistName ? String(p.artistName).trim() : null;
      const sourceName = p.sourceName ? String(p.sourceName).trim() : null;
      const rm = Number(p.readMins) > 0 ? Math.round(Number(p.readMins)) : readMins(body ?? subheadline ?? "");
      let publishedAt: Date | null = null;
      if (p.publishedAt) { const d = new Date(p.publishedAt); if (!isNaN(d.getTime())) publishedAt = d; }

      const n = await prisma.$executeRaw`
        INSERT INTO "NewsPost"
          ("id","headline","subheadline","body","imageUrl","imageCredit","category","tag","artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt","status")
        VALUES
          (${randomUUID()}, ${headline}, ${subheadline}, ${body}, ${imageUrl}, ${imageCredit}, ${category}, ${tag}, ${artistSlug}, ${artistName}, ${sourceName}, ${sourceUrl}, ${rm}, ${publishedAt ?? new Date()}, 'live')
        ON CONFLICT ("sourceUrl") DO UPDATE SET
          "headline" = EXCLUDED."headline", "subheadline" = EXCLUDED."subheadline", "body" = EXCLUDED."body",
          "imageUrl" = EXCLUDED."imageUrl", "imageCredit" = EXCLUDED."imageCredit", "category" = EXCLUDED."category",
          "tag" = EXCLUDED."tag", "artistSlug" = EXCLUDED."artistSlug", "artistName" = EXCLUDED."artistName",
          "sourceName" = EXCLUDED."sourceName", "readMins" = EXCLUDED."readMins", "publishedAt" = EXCLUDED."publishedAt"`;
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
