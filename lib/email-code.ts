// Passwordless email verification — the only registration step the live chat
// asks for. A visitor enters an email, gets a 6-digit code, and comes back with
// a real session; no password is ever chosen.
//
// Same self-healing raw-table pattern as PasswordReset in /api/auth/forgot.
// Codes are stored hashed, in their own namespace, so a reset code can never be
// replayed as a login code (and vice versa).
import { createHash, randomInt, randomUUID, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const CODE_TTL_MIN = 15;
const MAX_ATTEMPTS = 5;          // wrong guesses per issued code
const MAX_SENDS_PER_HOUR = 4;    // codes issued per email address
const MAX_SENDS_PER_IP_HOUR = 12; // codes issued per source IP (anti mail-bombing)

/** Marks an account that has no usable password: hashPassword() output is plain hex. */
export const NO_PASSWORD = () => `!passwordless:${randomBytes(24).toString("hex")}`;

export function hashEmailCode(email: string, code: string): string {
  const secret = process.env.AUTH_SECRET ?? "aegyo-salt";
  return createHash("sha256").update(`emailcode:${email}:${code}:${secret}`).digest("hex");
}

let ready = false;
export async function ensureEmailCodeTable(): Promise<void> {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "EmailCode" (
      "id"        TEXT PRIMARY KEY,
      "email"     TEXT NOT NULL,
      "codeHash"  TEXT NOT NULL,
      "attempts"  INTEGER NOT NULL DEFAULT 0,
      "ipHash"    TEXT,
      "used"      BOOLEAN NOT NULL DEFAULT false,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "EmailCode" ADD COLUMN IF NOT EXISTS "ipHash" TEXT`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailCode_email_created_idx" ON "EmailCode" ("email","createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailCode_ip_created_idx"    ON "EmailCode" ("ipHash","createdAt")`);
  ready = true;
}

/** Stable, non-reversible IP bucket for rate limiting. */
export function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET ?? "aegyo-salt";
  return createHash("sha256").update(`ip:${ip}:${secret}`).digest("hex").slice(0, 32);
}

/**
 * Issues a fresh code for `email`, invalidating any earlier one.
 * Returns null when the address or the source IP has already been sent too many
 * codes this hour.
 */
export async function issueCode(email: string, ipHash?: string | null): Promise<string | null> {
  await ensureEmailCodeTable();
  const sends = await prisma.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM "EmailCode"
    WHERE "email" = ${email} AND "createdAt" > now() - interval '1 hour'`;
  if ((sends[0]?.n ?? 0) >= MAX_SENDS_PER_HOUR) return null;

  if (ipHash) {
    const perIp = await prisma.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM "EmailCode"
      WHERE "ipHash" = ${ipHash} AND "createdAt" > now() - interval '1 hour'`;
    if ((perIp[0]?.n ?? 0) >= MAX_SENDS_PER_IP_HOUR) return null;
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.$executeRaw`DELETE FROM "EmailCode" WHERE "email" = ${email} AND "used" = false`;
  await prisma.$executeRaw`
    INSERT INTO "EmailCode" ("id","email","codeHash","ipHash","expiresAt")
    VALUES (${randomUUID()}, ${email}, ${hashEmailCode(email, code)}, ${ipHash ?? null}, ${new Date(Date.now() + CODE_TTL_MIN * 60_000)})`;
  return code;
}

/**
 * Consumes a code. Counts wrong guesses against the live code so a 6-digit
 * space can't be brute-forced, and burns the row on success.
 *
 * Expiry is evaluated in SQL, never in JS: the column is TIMESTAMPTZ and
 * comparing it against a JS Date silently depends on the server's local zone.
 */
export async function consumeCode(email: string, code: string): Promise<boolean> {
  await ensureEmailCodeTable();
  const rows = await prisma.$queryRaw<{ id: string; codeHash: string }[]>`
    SELECT "id","codeHash" FROM "EmailCode"
    WHERE "email" = ${email}
      AND "used" = false
      AND "expiresAt" > now()
      AND "attempts" < ${MAX_ATTEMPTS}
    ORDER BY "createdAt" DESC LIMIT 1`;
  const row = rows[0];
  if (!row) return false;
  if (row.codeHash !== hashEmailCode(email, code)) {
    await prisma.$executeRaw`UPDATE "EmailCode" SET "attempts" = "attempts" + 1 WHERE "id" = ${row.id}`;
    return false;
  }
  await prisma.$executeRaw`UPDATE "EmailCode" SET "used" = true WHERE "id" = ${row.id}`;
  return true;
}

/** A chat-friendly handle from an email address: "sana.fan+kpop@x.com" -> "sana.fan". */
export function handleFromEmail(email: string): string {
  const local = email.split("@")[0].split("+")[0].replace(/[^a-zA-Z0-9._-]/g, "");
  return (local || "fan").slice(0, 20);
}

export const CODE_TTL_MINUTES = CODE_TTL_MIN;
