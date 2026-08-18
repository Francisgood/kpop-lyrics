import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { sendRedditConversion, redditSignals } from "@/lib/reddit-capi";
import { randomUUID, randomBytes } from "crypto";

export const dynamic = "force-dynamic";

// Isolated from the BTS giveaway: its own table, its own config. Nothing here
// touches "GiveawayEntry" (the live BTS table), so the BTS flow is untouched.
const MAX_REFERRALS = 50;
const SITE = "https://www.aegyoarena.com";
const linkFor = (code: string) => `${SITE}/le-sserafim-giveaway?ref=${code}`;
// Entries close the night before the Sept 24, 2026 draw: Wed Sept 23, 2026 11:59:59pm ET.
const GIVEAWAY_CUTOFF_MS = Date.parse("2026-09-24T03:59:59.999Z");

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GiveawayEntryLsf" (
      "id"              TEXT PRIMARY KEY,
      "firstName"       TEXT NOT NULL,
      "lastName"        TEXT NOT NULL,
      "email"           TEXT NOT NULL,
      "phone"           TEXT NOT NULL,
      "zip"             TEXT NOT NULL,
      "country"         TEXT,
      "birthDate"       TIMESTAMP NOT NULL,
      "newsletterOptIn" BOOLEAN NOT NULL DEFAULT true,
      "referralCode"    TEXT NOT NULL,
      "referredByCode"  TEXT,
      "referralCount"   INTEGER NOT NULL DEFAULT 0,
      "createdAt"       TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GiveawayEntryLsf_email_key" ON "GiveawayEntryLsf" ("email")`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GiveawayEntryLsf_referralCode_key" ON "GiveawayEntryLsf" ("referralCode")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GiveawayEntryLsf_referredByCode_idx" ON "GiveawayEntryLsf" ("referredByCode")`);
  tableReady = true;
}

function ageOf(d: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

export async function POST(req: NextRequest) {
  try {
    if (Date.now() > GIVEAWAY_CUTOFF_MS) {
      return NextResponse.json({ error: "This giveaway is closed." }, { status: 410 });
    }
    await ensureTable();
    const b = await req.json().catch(() => ({}));
    const firstName = String(b.firstName ?? "").trim();
    const lastName = String(b.lastName ?? "").trim();
    const email = String(b.email ?? "").trim().toLowerCase();
    const phone = String(b.phone ?? "").trim();
    const zip = String(b.zip ?? "").trim();
    const country = String(b.country ?? "").trim();
    const ref = b.ref ? String(b.ref).trim() : null;
    const y = Number(b.birthYear), mo = Number(b.birthMonth), d = Number(b.birthDay);

    if (!firstName || !lastName || !email.includes("@") || !phone || !zip || !country || !y || !mo || !d) {
      return NextResponse.json({ error: "Please complete all fields to enter." }, { status: 400 });
    }
    const birthDate = new Date(Date.UTC(y, mo - 1, d));
    if (ageOf(birthDate) < 18) {
      return NextResponse.json({ error: "This giveaway is only open to entrants who are 18 or older." }, { status: 400 });
    }

    const existing = await prisma.$queryRaw<{ referralCode: string; referralCount: number }[]>`
      SELECT "referralCode", "referralCount" FROM "GiveawayEntryLsf" WHERE "email" = ${email} LIMIT 1`;
    if (existing[0]) {
      return NextResponse.json({
        alreadyEntered: true,
        referralCode: existing[0].referralCode,
        referralLink: linkFor(existing[0].referralCode),
        referralCount: Number(existing[0].referralCount),
      });
    }

    let code = randomBytes(5).toString("hex");
    for (let i = 0; i < 6; i++) {
      const clash = await prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM "GiveawayEntryLsf" WHERE "referralCode" = ${code} LIMIT 1`;
      if (!clash[0]) break;
      code = randomBytes(5).toString("hex");
    }

    let referredByCode: string | null = null;
    if (ref) {
      const r = await prisma.$queryRaw<{ id: string; email: string; referralCount: number }[]>`
        SELECT "id", "email", "referralCount" FROM "GiveawayEntryLsf" WHERE "referralCode" = ${ref} LIMIT 1`;
      if (r[0] && r[0].email !== email && Number(r[0].referralCount) < MAX_REFERRALS) {
        referredByCode = ref;
        await prisma.$executeRaw`UPDATE "GiveawayEntryLsf" SET "referralCount" = "referralCount" + 1 WHERE "id" = ${r[0].id}`;
      }
    }

    await prisma.$executeRaw`
      INSERT INTO "GiveawayEntryLsf"
        ("id","firstName","lastName","email","phone","zip","country","birthDate","newsletterOptIn","referralCode","referredByCode","referralCount")
      VALUES
        (${randomUUID()}, ${firstName}, ${lastName}, ${email}, ${phone}, ${zip}, ${country}, ${birthDate}, true, ${code}, ${referredByCode}, 0)`;

    await subscribeToBeehiiv({ email, source: "le-sserafim-giveaway" });

    const rdtConversionId = randomUUID();
    await sendRedditConversion({ eventType: "Lead", conversionId: rdtConversionId, email, ...redditSignals(req) });

    return NextResponse.json({ ok: true, referralCode: code, referralLink: linkFor(code), referralCount: 0, rdtConversionId });
  } catch (e) {
    console.error("le-sserafim entry error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const code = new URL(req.url).searchParams.get("code");
    if (!code) {
      const total = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "GiveawayEntryLsf"`;
      return NextResponse.json({ totalEntries: Number(total[0]?.c ?? 0) });
    }
    const r = await prisma.$queryRaw<{ referralCount: number }[]>`
      SELECT "referralCount" FROM "GiveawayEntryLsf" WHERE "referralCode" = ${code} LIMIT 1`;
    if (!r[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ referralCount: Number(r[0].referralCount), max: MAX_REFERRALS, referralLink: linkFor(code) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
