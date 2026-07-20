import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Self-contained store for fan tips/scoops, created additively on first use
// (same pattern as RestockAlert / NewsPost). Never touches other tables.
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Tip" (
      "id"        TEXT PRIMARY KEY,
      "tip"       TEXT NOT NULL,
      "artist"    TEXT,
      "email"     TEXT,
      "status"    TEXT NOT NULL DEFAULT 'new',
      "createdAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Tip_status_created_idx" ON "Tip" ("status", "createdAt")`);
  tableReady = true;
}

// Public tip submission. Email is optional (tips can be anonymous); when given
// and opted-in, the address also flows into the Beehiiv newsletter audience so
// no collected email is missed.
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const b = await req.json().catch(() => ({}));
    const tip = String(b.tip ?? "").trim().slice(0, 4000);
    const artist = b.artist ? String(b.artist).trim().slice(0, 120) : null;
    const email = b.email ? String(b.email).trim().toLowerCase().slice(0, 200) : null;
    const subscribe = b.subscribe !== false; // default opt-in

    if (tip.length < 3) {
      return NextResponse.json({ error: "Please add a few more details to your tip." }, { status: 400 });
    }
    if (email && !email.includes("@")) {
      return NextResponse.json({ error: "That email doesn't look right — leave it blank to stay anonymous." }, { status: 400 });
    }

    await prisma.$executeRaw`INSERT INTO "Tip" ("id","tip","artist","email") VALUES (${randomUUID()}, ${tip}, ${artist}, ${email})`;

    // Collect the email into Beehiiv too (best-effort; never blocks the tip),
    // with the newsletter welcome, when they opted in.
    if (email && subscribe) {
      await subscribeToBeehiiv({ email, source: "got-a-tip", sendWelcome: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("tip submission error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

// Count for anyone; the full list only with the admin secret (Bearer token),
// so the site owner can review submissions.
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const total = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "Tip"`;
    const secret = process.env.IMAGE_REFRESH_SECRET;
    if (secret && req.headers.get("authorization") === `Bearer ${secret}`) {
      const tips = await prisma.$queryRaw<
        { id: string; tip: string; artist: string | null; email: string | null; status: string; createdAt: Date }[]
      >`SELECT "id","tip","artist","email","status","createdAt" FROM "Tip" ORDER BY "createdAt" DESC LIMIT 200`;
      return NextResponse.json({ totalTips: Number(total[0]?.c ?? 0), tips });
    }
    return NextResponse.json({ totalTips: Number(total[0]?.c ?? 0) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
