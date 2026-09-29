/**
 * POST /api/session — records a per-visitor session UUID.
 *
 * Called once per browser session by the CookieConsent component, but ONLY when
 * the visitor has allowed the Analytics category. Body: { sid, path?, ref? }.
 * The `sid` is a client-generated UUID (also stored in the `aa_sid` cookie).
 * Self-healing table, created additively on first use (mirrors Follow/Vote).
 *
 * GET /api/session — authed (Bearer IMAGE_REFRESH_SECRET) session-count summary.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

let ready = false;
async function ensureTable() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SessionVisit" (
      "id"         TEXT PRIMARY KEY,
      "firstSeen"  TIMESTAMP NOT NULL DEFAULT now(),
      "lastSeen"   TIMESTAMP NOT NULL DEFAULT now(),
      "hits"       INTEGER   NOT NULL DEFAULT 1,
      "path"       TEXT,
      "referrer"   TEXT,
      "userAgent"  TEXT
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SessionVisit_lastSeen_idx" ON "SessionVisit" ("lastSeen")`);
  ready = true;
}

// Accepts a UUID (v4-ish) only, so the table can't be spammed with arbitrary ids.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : null);

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const b = await req.json().catch(() => ({}));
    const sid = String(b?.sid ?? "").trim();
    if (!UUID_RE.test(sid)) return NextResponse.json({ error: "invalid sid" }, { status: 400 });

    const path = clip(b?.path, 512);
    const referrer = clip(b?.ref, 512);
    const userAgent = clip(req.headers.get("user-agent"), 512);

    // Upsert: new session inserts; a returning session bumps lastSeen + hits.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SessionVisit" ("id","path","referrer","userAgent")
       VALUES ($1,$2,$3,$4)
       ON CONFLICT ("id") DO UPDATE SET "lastSeen" = now(), "hits" = "SessionVisit"."hits" + 1, "path" = EXCLUDED."path"`,
      sid, path, referrer, userAgent,
    );
    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never break a page load.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureTable();
    const rows = await prisma.$queryRawUnsafe<{ total: number; today: number; hits: number }[]>(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE "firstSeen" >= now() - interval '1 day')::int AS today,
              COALESCE(SUM("hits"),0)::int AS hits
       FROM "SessionVisit"`,
    );
    return NextResponse.json({ ok: true, ...(rows[0] ?? { total: 0, today: 0, hits: 0 }) });
  } catch (e) {
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
}
