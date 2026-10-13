import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Back-in-stock waitlist for the BABY-T-S drop. Per-product (unlike the older
// /api/restock-alert, which is one global merch list keyed on email alone), and
// it takes a phone number OR an email — the PDP modal lets the shopper pick.
//
// Self-contained store, created additively on first use. Never touches other tables.
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PlushieNotify" (
      "id"        TEXT PRIMARY KEY,
      "product"   TEXT NOT NULL,
      "email"     TEXT,
      "phone"     TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);
  // One row per product per contact, so a double submit is a no-op rather than a
  // duplicate alert. Partial indexes keep the NULL side of each pair out of the way.
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "PlushieNotify_product_email_key"
       ON "PlushieNotify" ("product","email") WHERE "email" IS NOT NULL`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "PlushieNotify_product_phone_key"
       ON "PlushieNotify" ("product","phone") WHERE "phone" IS NOT NULL`,
  );
  tableReady = true;
}

/** Keep a leading +, drop everything else that isn't a digit. */
function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return (plus ? "+" : "") + digits;
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}));
    const product = String(b.product ?? "").trim().slice(0, 120);
    const rawEmail = String(b.email ?? "").trim().toLowerCase();
    const rawPhone = String(b.phone ?? "").trim();

    if (!product) {
      return NextResponse.json({ error: "Missing product." }, { status: 400 });
    }
    if (!rawEmail && !rawPhone) {
      return NextResponse.json({ error: "Enter an email address or a phone number." }, { status: 400 });
    }

    let email: string | null = null;
    if (rawEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
      email = rawEmail.slice(0, 200);
    }

    let phone: string | null = null;
    if (rawPhone) {
      phone = normalizePhone(rawPhone);
      if (!phone) {
        return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
      }
    }

    await ensureTable();

    const existing = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "PlushieNotify"
       WHERE "product" = ${product}
         AND (${email}::text IS NOT NULL AND "email" = ${email}
           OR ${phone}::text IS NOT NULL AND "phone" = ${phone})
       LIMIT 1`;

    if (!existing[0]) {
      await prisma.$executeRaw`
        INSERT INTO "PlushieNotify" ("id","product","email","phone")
        VALUES (${randomUUID()}, ${product}, ${email}, ${phone})`;
    }

    // Email signups also go to beehiiv so the restock broadcast can reach them —
    // but no welcome email: they asked for a stock alert, not the newsletter.
    if (email) {
      await subscribeToBeehiiv({ email, source: `plushie-notify:${product}`, sendWelcome: false });
    }

    return NextResponse.json({ ok: true, alreadyListed: !!existing[0] });
  } catch (e) {
    console.error("notify-me error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const product = req.nextUrl.searchParams.get("product");
    const rows = product
      ? await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "PlushieNotify" WHERE "product" = ${product}`
      : await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "PlushieNotify"`;
    return NextResponse.json({ waiting: Number(rows[0]?.c ?? 0) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
