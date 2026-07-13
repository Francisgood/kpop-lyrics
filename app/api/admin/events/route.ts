import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Aggregated fan events (meetups, K-beauty activations, dance meets, anime/comic
// cons, K-pop store openings) discovered by the daily `event-scanner` skill and
// surfaced on /events. Self-contained table, created additively on first use —
// mirrors the GiveawayEntry / CommunityAnnotation pattern. Never touches other tables.
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ScannedEvent" (
      "id"          TEXT PRIMARY KEY,
      "title"       TEXT NOT NULL,
      "category"    TEXT NOT NULL,
      "city"        TEXT,
      "citySlug"    TEXT,
      "country"     TEXT,
      "venue"       TEXT,
      "startsAt"    TIMESTAMP,
      "dateText"    TEXT,
      "description" TEXT,
      "source"      TEXT,
      "sourceUrl"   TEXT NOT NULL,
      "status"      TEXT NOT NULL DEFAULT 'live',
      "createdAt"   TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ScannedEvent_sourceUrl_key" ON "ScannedEvent" ("sourceUrl")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ScannedEvent_citySlug_idx" ON "ScannedEvent" ("citySlug")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ScannedEvent_createdAt_idx" ON "ScannedEvent" ("createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ScannedEvent_status_idx" ON "ScannedEvent" ("status")`);
  tableReady = true;
}

function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

const CATEGORIES = ["kpop", "kbeauty", "dance", "anime", "comicon", "store", "meetup", "other"];
function normCategory(c: unknown): string {
  const s = String(c ?? "").toLowerCase().trim();
  if (CATEGORIES.includes(s)) return s;
  if (/beauty|k-?beauty|skincare|cosmetic/.test(s)) return "kbeauty";
  if (/dance|choreo|cover/.test(s)) return "dance";
  if (/anime|manga/.test(s)) return "anime";
  if (/comic|con\b/.test(s)) return "comicon";
  if (/store|shop|pop-?up|retail/.test(s)) return "store";
  if (/meet-?up|gathering|fan meet/.test(s)) return "meetup";
  if (/k-?pop|idol/.test(s)) return "kpop";
  return "other";
}
function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type EventIn = {
  title?: string; category?: string; city?: string; citySlug?: string; country?: string;
  venue?: string; startsAt?: string; dateText?: string; description?: string; source?: string; sourceUrl?: string;
};

// Ingest a batch of discovered events. Idempotent: dedup + upsert by sourceUrl.
export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTable();
    const body = await req.json().catch(() => ({}));
    const events: EventIn[] = Array.isArray(body?.events) ? body.events : Array.isArray(body) ? body : [];
    if (!events.length) return NextResponse.json({ error: "Provide { events: [...] }" }, { status: 400 });

    let received = 0, upserted = 0;
    for (const e of events) {
      const title = String(e.title ?? "").trim();
      const sourceUrl = String(e.sourceUrl ?? "").trim();
      if (!title || !sourceUrl) continue; // title + sourceUrl (dedup key) are required
      received++;
      const category = normCategory(e.category);
      const city = e.city ? String(e.city).trim() : null;
      const citySlug = e.citySlug ? slugify(String(e.citySlug)) : city ? slugify(city) : null;
      const country = e.country ? String(e.country).trim() : null;
      const venue = e.venue ? String(e.venue).trim() : null;
      const dateText = e.dateText ? String(e.dateText).trim() : null;
      const description = e.description ? String(e.description).trim() : null;
      const source = e.source ? String(e.source).trim() : null;
      let startsAt: Date | null = null;
      if (e.startsAt) { const d = new Date(e.startsAt); if (!isNaN(d.getTime())) startsAt = d; }

      const n = await prisma.$executeRaw`
        INSERT INTO "ScannedEvent"
          ("id","title","category","city","citySlug","country","venue","startsAt","dateText","description","source","sourceUrl","status")
        VALUES
          (${randomUUID()}, ${title}, ${category}, ${city}, ${citySlug}, ${country}, ${venue}, ${startsAt}, ${dateText}, ${description}, ${source}, ${sourceUrl}, 'live')
        ON CONFLICT ("sourceUrl") DO UPDATE SET
          "title" = EXCLUDED."title", "category" = EXCLUDED."category", "city" = EXCLUDED."city",
          "citySlug" = EXCLUDED."citySlug", "country" = EXCLUDED."country", "venue" = EXCLUDED."venue",
          "startsAt" = EXCLUDED."startsAt", "dateText" = EXCLUDED."dateText",
          "description" = EXCLUDED."description", "source" = EXCLUDED."source"`;
      upserted += Number(n);
    }
    const total = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "ScannedEvent" WHERE "status" = 'live'`;
    return NextResponse.json({ ok: true, received, upserted, liveTotal: Number(total[0]?.c ?? 0) });
  } catch (e) {
    console.error("events ingest error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// Secret-gated admin controls: hide/unhide/delete a scanned event by sourceUrl or id.
export async function PATCH(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTable();
    const b = await req.json().catch(() => ({}));
    const status = b.status === "hidden" ? "hidden" : "live";
    if (b.id) await prisma.$executeRaw`UPDATE "ScannedEvent" SET "status" = ${status} WHERE "id" = ${String(b.id)}`;
    else if (b.sourceUrl) await prisma.$executeRaw`UPDATE "ScannedEvent" SET "status" = ${status} WHERE "sourceUrl" = ${String(b.sourceUrl)}`;
    else return NextResponse.json({ error: "Provide id or sourceUrl" }, { status: 400 });
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
