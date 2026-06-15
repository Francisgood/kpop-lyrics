import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Self-contained store, created additively on first use (same pattern as the
// giveaway). Never touches other tables.
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "RestockAlert" (
      "id"        TEXT PRIMARY KEY,
      "email"     TEXT NOT NULL,
      "product"   TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "RestockAlert_email_key" ON "RestockAlert" ("email")`);
  tableReady = true;
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const b = await req.json().catch(() => ({}));
    const email = String(b.email ?? "").trim().toLowerCase();
    const product = b.product ? String(b.product).trim().slice(0, 120) : null;

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const existing = await prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM "RestockAlert" WHERE "email" = ${email} LIMIT 1`;
    if (!existing[0]) {
      await prisma.$executeRaw`INSERT INTO "RestockAlert" ("id","email","product") VALUES (${randomUUID()}, ${email}, ${product})`;
    }

    // Add to beehiiv tagged as merch-restock so the restock broadcast can reach
    // them — but DON'T fire the newsletter welcome email (they signed up for a
    // restock alert, not the general newsletter).
    await subscribeToBeehiiv({ email, source: "merch-restock", sendWelcome: false });

    return NextResponse.json({ ok: true, alreadyListed: !!existing[0] });
  } catch (e) {
    console.error("restock alert error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureTable();
    const total = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "RestockAlert"`;
    return NextResponse.json({ totalAlerts: Number(total[0]?.c ?? 0) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
