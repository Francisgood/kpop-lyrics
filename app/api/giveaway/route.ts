import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { sendRedditConversion, redditSignals } from "@/lib/reddit-capi";
import { randomUUID, randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const MAX_REFERRALS = 50;
const SITE = "https://www.aegyoarena.com";
const linkFor = (code: string) => `${SITE}/bts-giveaway?ref=${code}`;
// Friday July 17, 2026 at 11:59:59 p.m. Eastern Daylight Time.
// The roster is frozen from the designated database/export after this instant.
const GIVEAWAY_CUTOFF_MS = Date.parse("2026-07-18T03:59:59.999Z");

// Self-contained store: the table is created additively on first use (the app
// runs inside Railway with internal DB access). This never touches other tables.
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GiveawayEntry" (
      "id"              TEXT PRIMARY KEY,
      "firstName"       TEXT NOT NULL,
      "lastName"        TEXT NOT NULL,
      "email"           TEXT NOT NULL,
      "phone"           TEXT NOT NULL,
      "zip"             TEXT NOT NULL,
      "birthDate"       TIMESTAMP NOT NULL,
      "newsletterOptIn" BOOLEAN NOT NULL DEFAULT true,
      "referralCode"    TEXT NOT NULL,
      "referredByCode"  TEXT,
      "referralCount"   INTEGER NOT NULL DEFAULT 0,
      "createdAt"       TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GiveawayEntry_email_key" ON "GiveawayEntry" ("email")`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GiveawayEntry_referralCode_key" ON "GiveawayEntry" ("referralCode")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GiveawayEntry_referredByCode_idx" ON "GiveawayEntry" ("referredByCode")`);
  // International entrants: a country + a postal code in that country's own format.
  await prisma.$executeRawUnsafe(`ALTER TABLE "GiveawayEntry" ADD COLUMN IF NOT EXISTS "country" TEXT`);
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

    // One entry per email — return their existing referral link if they already entered.
    const existing = await prisma.$queryRaw<{ referralCode: string; referralCount: number }[]>`
      SELECT "referralCode", "referralCount" FROM "GiveawayEntry" WHERE "email" = ${email} LIMIT 1`;
    if (existing[0]) {
      return NextResponse.json({
        alreadyEntered: true,
        referralCode: existing[0].referralCode,
        referralLink: linkFor(existing[0].referralCode),
        referralCount: Number(existing[0].referralCount),
      });
    }

    // Generate a unique referral code.
    let code = randomBytes(5).toString("hex");
    for (let i = 0; i < 6; i++) {
      const clash = await prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM "GiveawayEntry" WHERE "referralCode" = ${code} LIMIT 1`;
      if (!clash[0]) break;
      code = randomBytes(5).toString("hex");
    }

    // Attribute a referral only if it's valid: known code, not self, referrer under the 50 cap.
    // (The referred entrant is, by reaching this point, 18+, gave a country + postal code, agreed to the rules, and newsletter-opted-in.)
    let referredByCode: string | null = null;
    if (ref) {
      const r = await prisma.$queryRaw<{ id: string; email: string; referralCount: number }[]>`
        SELECT "id", "email", "referralCount" FROM "GiveawayEntry" WHERE "referralCode" = ${ref} LIMIT 1`;
      if (r[0] && r[0].email !== email && Number(r[0].referralCount) < MAX_REFERRALS) {
        referredByCode = ref;
        await prisma.$executeRaw`UPDATE "GiveawayEntry" SET "referralCount" = "referralCount" + 1 WHERE "id" = ${r[0].id}`;
      }
    }

    await prisma.$executeRaw`
      INSERT INTO "GiveawayEntry"
        ("id","firstName","lastName","email","phone","zip","country","birthDate","newsletterOptIn","referralCode","referredByCode","referralCount")
      VALUES
        (${randomUUID()}, ${firstName}, ${lastName}, ${email}, ${phone}, ${zip}, ${country}, ${birthDate}, true, ${code}, ${referredByCode}, 0)`;

    // The entrant opted into the newsletter on the form — add them to beehiiv and
    // send the welcome email. Best-effort: subscribeToBeehiiv never throws.
    await subscribeToBeehiiv({ email, source: "bts-giveaway" });

    // Reddit Conversions API "Lead" — new entrants only. Return the conversion_id so
    // the browser pixel fires with the same id and Reddit dedups the two events.
    const rdtConversionId = randomUUID();
    await sendRedditConversion({ eventType: "Lead", conversionId: rdtConversionId, email, ...redditSignals(req) });

    return NextResponse.json({ ok: true, referralCode: code, referralLink: linkFor(code), referralCount: 0, rdtConversionId });
  } catch (e) {
    console.error("giveaway entry error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

// Look up an entrant's current referral count (so they can check progress), or total entries.
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const code = new URL(req.url).searchParams.get("code");
    if (!code) {
      const total = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "GiveawayEntry"`;
      return NextResponse.json({ totalEntries: Number(total[0]?.c ?? 0) });
    }
    const r = await prisma.$queryRaw<{ referralCount: number }[]>`
      SELECT "referralCount" FROM "GiveawayEntry" WHERE "referralCode" = ${code} LIMIT 1`;
    if (!r[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ referralCount: Number(r[0].referralCount), max: MAX_REFERRALS, referralLink: linkFor(code) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
