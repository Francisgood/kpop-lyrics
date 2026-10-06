import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { sendRedditConversion, redditSignals } from "@/lib/reddit-capi";
import { randomUUID, randomBytes } from "crypto";

export const dynamic = "force-dynamic";

// Isolated per campaign, same as the BTS and LE SSERAFIM routes: its own table,
// its own cutoff. Nothing here touches "GiveawayEntry" or "GiveawayEntryLsf".
const MAX_REFERRALS = 50;
const SITE = "https://www.aegyoarena.com";
const linkFor = (code: string) => `${SITE}/mystery-giveaway?ref=${code}`;

// Entries close Fri Jan 15, 2027 at 11:59:59pm ET. January is EST (UTC-5), so
// that is Jan 16 04:59:59 UTC — NOT the UTC-4 offset the autumn campaigns used.
// Keep this in step with the dates shown on /mystery-giveaway and /mystery-terms.
const GIVEAWAY_CUTOFF_MS = Date.parse("2027-01-16T04:59:59.999Z");

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GiveawayEntryMystery2027" (
      "id"              TEXT PRIMARY KEY,
      "firstName"       TEXT NOT NULL,
      "lastName"        TEXT NOT NULL,
      "email"           TEXT NOT NULL,
      "zip"             TEXT NOT NULL,
      "country"         TEXT,
      "newsletterOptIn" BOOLEAN NOT NULL DEFAULT true,
      "referralCode"    TEXT NOT NULL,
      "referredByCode"  TEXT,
      "referralCount"   INTEGER NOT NULL DEFAULT 0,
      "createdAt"       TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GiveawayEntryMystery2027_email_key" ON "GiveawayEntryMystery2027" ("email")`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GiveawayEntryMystery2027_referralCode_key" ON "GiveawayEntryMystery2027" ("referralCode")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GiveawayEntryMystery2027_referredByCode_idx" ON "GiveawayEntryMystery2027" ("referredByCode")`);
  tableReady = true;
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
    const zip = String(b.zip ?? "").trim();
    const country = String(b.country ?? "").trim();
    const ref = b.ref ? String(b.ref).trim() : null;

    if (!firstName || !lastName || !email.includes("@") || !zip || !country) {
      return NextResponse.json({ error: "Please complete all fields to enter." }, { status: 400 });
    }

    const existing = await prisma.$queryRaw<{ referralCode: string; referralCount: number }[]>`
      SELECT "referralCode", "referralCount" FROM "GiveawayEntryMystery2027" WHERE "email" = ${email} LIMIT 1`;
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
      const clash = await prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM "GiveawayEntryMystery2027" WHERE "referralCode" = ${code} LIMIT 1`;
      if (!clash[0]) break;
      code = randomBytes(5).toString("hex");
    }

    let referredByCode: string | null = null;
    if (ref) {
      const r = await prisma.$queryRaw<{ id: string; email: string; referralCount: number }[]>`
        SELECT "id", "email", "referralCount" FROM "GiveawayEntryMystery2027" WHERE "referralCode" = ${ref} LIMIT 1`;
      if (r[0] && r[0].email !== email && Number(r[0].referralCount) < MAX_REFERRALS) {
        referredByCode = ref;
        await prisma.$executeRaw`UPDATE "GiveawayEntryMystery2027" SET "referralCount" = "referralCount" + 1 WHERE "id" = ${r[0].id}`;
      }
    }

    await prisma.$executeRaw`
      INSERT INTO "GiveawayEntryMystery2027"
        ("id","firstName","lastName","email","zip","country","newsletterOptIn","referralCode","referredByCode","referralCount")
      VALUES
        (${randomUUID()}, ${firstName}, ${lastName}, ${email}, ${zip}, ${country}, true, ${code}, ${referredByCode}, 0)`;

    await subscribeToBeehiiv({ email, source: "mystery-giveaway-2027" });

    const rdtConversionId = randomUUID();
    await sendRedditConversion({ eventType: "Lead", conversionId: rdtConversionId, email, ...redditSignals(req) });

    return NextResponse.json({ ok: true, referralCode: code, referralLink: linkFor(code), referralCount: 0, rdtConversionId });
  } catch (e) {
    console.error("mystery-2027 entry error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const code = new URL(req.url).searchParams.get("code");
    if (!code) {
      const total = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "GiveawayEntryMystery2027"`;
      return NextResponse.json({ totalEntries: Number(total[0]?.c ?? 0) });
    }
    const r = await prisma.$queryRaw<{ referralCount: number }[]>`
      SELECT "referralCount" FROM "GiveawayEntryMystery2027" WHERE "referralCode" = ${code} LIMIT 1`;
    if (!r[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ referralCount: Number(r[0].referralCount), max: MAX_REFERRALS, referralLink: linkFor(code) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
