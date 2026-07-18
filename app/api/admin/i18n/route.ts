import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Generic Spanish-content backfill pipeline for DB-stored copy that the site-wide
// EN/ES toggle renders: slang definitions, artist bios, and scanned events.
// GET hands a translator agent a batch still missing Spanish (?kind=&buckets=&bucket=);
// POST stores the translations. Secret-gated. Columns are ensured additively on
// first use (mirrors the lyrics/news/events pipelines) in case the migration lagged.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

let ready = false;
async function ensureColumns() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`ALTER TABLE "Artist" ADD COLUMN IF NOT EXISTS "bioEs" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "TermDefinition" ADD COLUMN IF NOT EXISTS "bodyEs" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "TermDefinition" ADD COLUMN IF NOT EXISTS "exampleEs" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "titleEs" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "descriptionEs" TEXT`);
  ready = true;
}

// Per-kind config. Column names are hardcoded here (never from user input), so the
// interpolation below is safe.
const KINDS = {
  slang: { table: "TermDefinition", key: "id",        select: `"id","body","example"`,           has: `btrim("body") <> ''`,                   need: `("bodyEs" IS NULL OR btrim("bodyEs") = '')` },
  bio:   { table: "Artist",         key: "slug",      select: `"slug","stageName","bio"`,          has: `"bio" IS NOT NULL AND btrim("bio") <> ''`, need: `("bioEs" IS NULL OR btrim("bioEs") = '')` },
  event: { table: "ScannedEvent",   key: "sourceUrl", select: `"sourceUrl","title","description","city"`, has: `"description" IS NOT NULL AND btrim("description") <> ''`, need: `("descriptionEs" IS NULL OR btrim("descriptionEs") = '')` },
} as const;
type Kind = keyof typeof KINDS;
const kindOf = (v: string | null): Kind => (v && v in KINDS ? (v as Kind) : "slang");

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureColumns();
  const sp = new URL(req.url).searchParams;
  const kind = kindOf(sp.get("kind"));
  const k = KINDS[kind];

  if (sp.get("stats")) {
    const rows = await prisma.$queryRawUnsafe<{ total: number; remaining: number }[]>(
      `SELECT COUNT(*) FILTER (WHERE ${k.has})::int AS total,
              COUNT(*) FILTER (WHERE ${k.has} AND ${k.need})::int AS remaining
       FROM "${k.table}"`);
    return NextResponse.json({ kind, ...(rows[0] ?? {}) });
  }

  const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 20)));
  const buckets = Math.max(1, Math.min(64, Math.floor(Number(sp.get("buckets") ?? 1)) || 1));
  const bucket = Math.max(0, Math.min(buckets - 1, Math.floor(Number(sp.get("bucket") ?? 0)) || 0));
  const where: string[] = [k.has, k.need];
  if (buckets > 1) where.push(`(abs(hashtext(${k.key})) % ${buckets}) = ${bucket}`);
  const items = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT ${k.select} FROM "${k.table}" WHERE ${where.join(" AND ")} LIMIT ${limit}`);
  return NextResponse.json({ kind, count: items.length, items, bucket, buckets });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureColumns();
  const sp = new URL(req.url).searchParams;
  const kind = kindOf(sp.get("kind"));
  const b = await req.json().catch(() => ({}));
  const items: Record<string, string>[] = Array.isArray(b?.items) ? b.items : [];
  if (!items.length) return NextResponse.json({ error: "Provide { items: [...] }" }, { status: 400 });

  let updated = 0;
  for (const it of items) {
    if (kind === "slang") {
      const id = String(it.id ?? "").trim();
      const bodyEs = String(it.bodyEs ?? "").trim();
      if (!id || !bodyEs) continue;
      const exampleEs = it.exampleEs ? String(it.exampleEs).trim() : null;
      updated += Number(await prisma.$executeRaw`UPDATE "TermDefinition" SET "bodyEs" = ${bodyEs}, "exampleEs" = COALESCE(${exampleEs}, "exampleEs") WHERE "id" = ${id}`);
    } else if (kind === "bio") {
      const slug = String(it.slug ?? "").trim();
      const bioEs = String(it.bioEs ?? "").trim();
      if (!slug || !bioEs) continue;
      updated += Number(await prisma.$executeRaw`UPDATE "Artist" SET "bioEs" = ${bioEs} WHERE "slug" = ${slug}`);
    } else {
      const sourceUrl = String(it.sourceUrl ?? "").trim();
      const descriptionEs = String(it.descriptionEs ?? "").trim();
      if (!sourceUrl || !descriptionEs) continue;
      const titleEs = it.titleEs ? String(it.titleEs).trim() : null;
      updated += Number(await prisma.$executeRaw`UPDATE "ScannedEvent" SET "descriptionEs" = ${descriptionEs}, "titleEs" = COALESCE(${titleEs}, "titleEs") WHERE "sourceUrl" = ${sourceUrl}`);
    }
  }
  const k = KINDS[kind];
  const rows = await prisma.$queryRawUnsafe<{ remaining: number }[]>(
    `SELECT COUNT(*) FILTER (WHERE ${k.has} AND ${k.need})::int AS remaining FROM "${k.table}"`);
  return NextResponse.json({ ok: true, kind, received: items.length, updated, remaining: rows[0]?.remaining ?? null });
}
