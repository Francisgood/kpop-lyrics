import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { hostedEventBySlug } from "@/lib/hosted-events";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Attendee registrations for the events we host ourselves (lib/hosted-events).
// Self-contained store, created additively on first use — same pattern as
// GiveawayEntry / ScannedEvent. Never touches other tables.
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "EventRegistration" (
      "id"         TEXT PRIMARY KEY,
      "eventSlug"  TEXT NOT NULL,
      "name"       TEXT NOT NULL,
      "email"      TEXT NOT NULL,
      "optIn"      BOOLEAN NOT NULL DEFAULT false,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EventRegistration_slug_email_key" ON "EventRegistration" ("eventSlug", "email")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EventRegistration_eventSlug_idx" ON "EventRegistration" ("eventSlug")`);
  tableReady = true;
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}));
    const slug = String(b.slug ?? "").trim();
    const name = String(b.name ?? "").trim();
    const email = String(b.email ?? "").trim().toLowerCase();
    // Marketing consent is opt-IN: anything other than an explicit true is a no.
    const optIn = b.optIn === true;

    const event = hostedEventBySlug(slug);
    if (!event) return NextResponse.json({ error: "Unknown event." }, { status: 404 });
    if (!name || !email.includes("@")) {
      return NextResponse.json({ error: "Please add your name and a valid email." }, { status: 400 });
    }
    if (Date.now() > new Date(event.endsAt).getTime()) {
      return NextResponse.json({ error: "Registration for this event has closed." }, { status: 410 });
    }

    await ensureTable();

    // One registration per email per event. A repeat submit is treated as an
    // update so someone can change their mind about the mailing list.
    const existing = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "EventRegistration" WHERE "eventSlug" = ${slug} AND "email" = ${email} LIMIT 1`;
    if (existing[0]) {
      await prisma.$executeRaw`UPDATE "EventRegistration" SET "name" = ${name}, "optIn" = ${optIn} WHERE "id" = ${existing[0].id}`;
    } else {
      await prisma.$executeRaw`
        INSERT INTO "EventRegistration" ("id","eventSlug","name","email","optIn")
        VALUES (${randomUUID()}, ${slug}, ${name}, ${email}, ${optIn})`;
    }

    // Only subscribe when they actually ticked the box. Best-effort; never throws.
    if (optIn) await subscribeToBeehiiv({ email, source: `event:${slug}` });

    const total = await prisma.$queryRaw<{ c: number }[]>`
      SELECT COUNT(*)::int AS c FROM "EventRegistration" WHERE "eventSlug" = ${slug}`;
    return NextResponse.json({ ok: true, alreadyRegistered: !!existing[0], count: Number(total[0]?.c ?? 0) });
  } catch (e) {
    console.error("event registration error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/** How many people have registered — powers the "N going" line on the event page. */
export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get("slug") ?? "";
    if (!hostedEventBySlug(slug)) return NextResponse.json({ error: "Unknown event." }, { status: 404 });
    await ensureTable();
    const total = await prisma.$queryRaw<{ c: number }[]>`
      SELECT COUNT(*)::int AS c FROM "EventRegistration" WHERE "eventSlug" = ${slug}`;
    return NextResponse.json({ count: Number(total[0]?.c ?? 0) });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
