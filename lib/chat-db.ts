// Server-only DB layer for the site-wide live chat.
//
// Self-healing raw tables, the same pattern as polls-db / NewsPost: CREATE TABLE
// IF NOT EXISTS at runtime, so no Prisma migration is needed and the tables
// appear on the first request after deploy.
//
// Transport is short-polling, not websockets/SSE: Railway can run more than one
// replica, and an in-process pub/sub would silently drop messages for visitors
// pinned to a different instance. A monotonic "seq" cursor makes the tail read
// cheap; reactions and hides for the visible window ride along on the same poll,
// because those change on messages the client already holds.
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { screen, AUTO_HIDE_REPORTS, type ReportReason } from "@/lib/chat-moderation";

export const CHAT_ROOM = "global";
export const MAX_LEN = 240;
export const HISTORY = 50;              // messages sent on a cold load
const PRESENCE_WINDOW_SEC = 60;         // a visitor counts as "here" this long after their last poll
const RETENTION_DAYS = 7;
const HIDE_ECHO_MIN = 30;               // how long a hide is echoed back to open clients

// The six reactions the UI offers. Server-side allowlist, so nobody can push
// arbitrary text through the emoji field.
export const REACTIONS = ["💜", "🔥", "😭", "😂", "✨", "💖"] as const;
export type Reaction = (typeof REACTIONS)[number];

// Accounts created before the live chat shipped came through /signup, which has
// never sent a verification email — so their emailVerified flag is false for a
// reason that has nothing to do with the address being real. They are treated as
// verified rather than dead-ended out of a chat they can already comment in.
// The cutoff is fixed, so this can never reach an account created afterwards.
const LEGACY_SIGNUP_CUTOFF = "2026-09-10T00:00:00Z";

export type ChatMessage = {
  seq: number;
  id: string;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type ReactionTally = { messageId: string; emoji: string; count: number; mine: boolean };

let ready = false;

export async function ensureChatTables(): Promise<void> {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ChatMessage" (
      "seq"        BIGSERIAL PRIMARY KEY,
      "id"         TEXT NOT NULL,
      "room"       TEXT NOT NULL DEFAULT 'global',
      "userId"     TEXT NOT NULL,
      "authorName" TEXT NOT NULL,
      "body"       TEXT NOT NULL,
      "hidden"     BOOLEAN NOT NULL DEFAULT false,
      "hiddenAt"   TIMESTAMPTZ,
      "hiddenBy"   TEXT,
      "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "hiddenAt" TIMESTAMPTZ`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "hiddenBy" TEXT`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ChatMessage_id_key"     ON "ChatMessage" ("id")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChatMessage_room_seq_idx"  ON "ChatMessage" ("room","seq")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChatMessage_user_time_idx" ON "ChatMessage" ("userId","createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChatMessage_hidden_idx"    ON "ChatMessage" ("room","hiddenAt")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ChatPresence" (
      "ref"    TEXT PRIMARY KEY,
      "room"   TEXT NOT NULL DEFAULT 'global',
      "seenAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChatPresence_seen_idx" ON "ChatPresence" ("room","seenAt")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ChatReaction" (
      "id"        TEXT PRIMARY KEY,
      "messageId" TEXT NOT NULL,
      "userId"    TEXT NOT NULL,
      "emoji"     TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ChatReaction_one_per_user" ON "ChatReaction" ("messageId","userId","emoji")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChatReaction_msg_idx" ON "ChatReaction" ("messageId")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ChatReport" (
      "id"         TEXT PRIMARY KEY,
      "messageId"  TEXT NOT NULL,
      "reporterId" TEXT NOT NULL,
      "reason"     TEXT NOT NULL,
      "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ChatReport_one_per_user" ON "ChatReport" ("messageId","reporterId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChatReport_msg_idx" ON "ChatReport" ("messageId")`);

  await verifyLegacySignups();
  ready = true;
}

/**
 * One-time, idempotent backfill of pre-chat /signup accounts. Runs once per
 * process from ensureChatTables; a no-op after the first pass, and permanently
 * bounded by LEGACY_SIGNUP_CUTOFF.
 */
async function verifyLegacySignups(): Promise<void> {
  const n = await prisma.$executeRaw`
    UPDATE "User" SET "emailVerified" = true
    WHERE "emailVerified" = false AND "createdAt" < ${new Date(LEGACY_SIGNUP_CUTOFF)}`;
  if (n > 0) console.log(`[chat] marked ${n} pre-chat signup account(s) as verified`);
}

// -- Reads -------------------------------------------------------------------

/** Tail of the room. Pass the last seq the client holds to get only what is new. */
export async function listMessages(since?: number | null): Promise<ChatMessage[]> {
  await ensureChatTables();
  if (since && since > 0) {
    return prisma.$queryRaw<ChatMessage[]>`
      SELECT "seq"::int AS "seq", "id", "userId", "authorName", "body", "createdAt"
      FROM "ChatMessage"
      WHERE "room" = ${CHAT_ROOM} AND "hidden" = false AND "seq" > ${since}
      ORDER BY "seq" ASC LIMIT 100`;
  }
  // Cold load: newest N, flipped back into reading order.
  const rows = await prisma.$queryRaw<ChatMessage[]>`
    SELECT "seq"::int AS "seq", "id", "userId", "authorName", "body", "createdAt"
    FROM "ChatMessage"
    WHERE "room" = ${CHAT_ROOM} AND "hidden" = false
    ORDER BY "seq" DESC LIMIT ${HISTORY}`;
  return rows.reverse();
}

/**
 * Reaction tallies for the visible window, recomputed on each poll.
 *
 * A reaction lands on a message the client already holds, so it cannot ride the
 * seq cursor. One grouped query over the last HISTORY messages is the simple
 * correct answer and stays a single indexed scan.
 */
export async function listReactions(viewerId: string | null): Promise<ReactionTally[]> {
  await ensureChatTables();
  return prisma.$queryRaw<ReactionTally[]>`
    SELECT r."messageId", r."emoji", COUNT(*)::int AS "count",
           BOOL_OR(r."userId" = ${viewerId ?? ""}) AS "mine"
    FROM "ChatReaction" r
    WHERE r."messageId" IN (
      SELECT "id" FROM "ChatMessage"
      WHERE "room" = ${CHAT_ROOM} AND "hidden" = false
      ORDER BY "seq" DESC LIMIT ${HISTORY}
    )
    GROUP BY r."messageId", r."emoji"`;
}

/**
 * Messages hidden recently, so a client that already rendered one drops it.
 * Without this a hide would only take effect on a fresh page load.
 */
export async function listRecentlyHidden(): Promise<string[]> {
  await ensureChatTables();
  const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT "id" FROM "ChatMessage"
     WHERE "room" = $1 AND "hidden" = true AND "hiddenAt" > now() - ($2 || ' minutes')::interval`,
    CHAT_ROOM,
    String(HIDE_ECHO_MIN),
  );
  return rows.map((r) => r.id);
}

/** Distinct visitors (anonymous readers included) who polled in the last minute. */
export async function countPresent(): Promise<number> {
  await ensureChatTables();
  const rows = await prisma.$queryRawUnsafe<{ n: number }[]>(
    `SELECT COUNT(*)::int AS n FROM "ChatPresence"
     WHERE "room" = $1 AND "seenAt" > now() - ($2 || ' seconds')::interval`,
    CHAT_ROOM,
    String(PRESENCE_WINDOW_SEC),
  );
  return rows[0]?.n ?? 0;
}

/** Records this visitor as present. `ref` is a per-device id or a user id. */
export async function touchPresence(ref: string): Promise<void> {
  await ensureChatTables();
  if (!ref) return;
  await prisma.$executeRaw`
    INSERT INTO "ChatPresence" ("ref","room","seenAt") VALUES (${ref.slice(0, 64)}, ${CHAT_ROOM}, now())
    ON CONFLICT ("ref") DO UPDATE SET "seenAt" = now(), "room" = ${CHAT_ROOM}`;
}

// -- Writes ------------------------------------------------------------------

export type PostResult =
  | { ok: true; message: ChatMessage }
  | { ok: false; error: string; status: number; reason?: string };

export async function postMessage(args: {
  userId: string;
  authorName: string;
  body: string;
}): Promise<PostResult> {
  await ensureChatTables();
  const body = normalizeBody(args.body);
  if (!body) return { ok: false, error: "empty", status: 400 };
  if (body.length > MAX_LEN) return { ok: false, error: "too_long", status: 400 };

  const verdict = screen(body);
  if (!verdict.ok) {
    return { ok: false, error: "blocked", status: 422, reason: verdict.reason };
  }

  // Flood control: 5 messages per 20s, and no repeating yourself within a minute.
  const recent = await prisma.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM "ChatMessage"
    WHERE "userId" = ${args.userId} AND "createdAt" > now() - interval '20 seconds'`;
  if ((recent[0]?.n ?? 0) >= 5) return { ok: false, error: "rate_limited", status: 429 };

  const dupe = await prisma.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM "ChatMessage"
    WHERE "userId" = ${args.userId} AND "body" = ${body} AND "createdAt" > now() - interval '60 seconds'`;
  if ((dupe[0]?.n ?? 0) > 0) return { ok: false, error: "duplicate", status: 429 };

  const inserted = await prisma.$queryRaw<ChatMessage[]>`
    INSERT INTO "ChatMessage" ("id","room","userId","authorName","body")
    VALUES (${randomUUID()}, ${CHAT_ROOM}, ${args.userId}, ${args.authorName.slice(0, 40)}, ${body})
    RETURNING "seq"::int AS "seq", "id", "userId", "authorName", "body", "createdAt"`;

  if (Math.random() < 0.02) await prune();
  return { ok: true, message: inserted[0] };
}

/** Toggles one reaction. Returns the new state so the UI can settle instantly. */
export async function toggleReaction(args: {
  messageId: string;
  userId: string;
  emoji: string;
}): Promise<{ ok: true; on: boolean } | { ok: false; error: string; status: number }> {
  await ensureChatTables();
  if (!(REACTIONS as readonly string[]).includes(args.emoji)) {
    return { ok: false, error: "bad_emoji", status: 400 };
  }
  const exists = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "ChatReaction"
    WHERE "messageId" = ${args.messageId} AND "userId" = ${args.userId} AND "emoji" = ${args.emoji} LIMIT 1`;
  if (exists[0]) {
    await prisma.$executeRaw`DELETE FROM "ChatReaction" WHERE "id" = ${exists[0].id}`;
    return { ok: true, on: false };
  }
  // Cap how many different reactions one person can pile onto one message.
  const mine = await prisma.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM "ChatReaction"
    WHERE "messageId" = ${args.messageId} AND "userId" = ${args.userId}`;
  if ((mine[0]?.n ?? 0) >= 3) return { ok: false, error: "too_many", status: 429 };

  await prisma.$executeRaw`
    INSERT INTO "ChatReaction" ("id","messageId","userId","emoji")
    VALUES (${randomUUID()}, ${args.messageId}, ${args.userId}, ${args.emoji})
    ON CONFLICT DO NOTHING`;
  return { ok: true, on: true };
}

/**
 * Files a reader report. At AUTO_HIDE_REPORTS distinct reporters the message
 * hides itself and waits for a moderator, so a pile-on stops spreading without
 * anyone needing to be awake.
 */
export async function reportMessage(args: {
  messageId: string;
  reporterId: string;
  reason: ReportReason;
}): Promise<{ ok: true; hidden: boolean; count: number }> {
  await ensureChatTables();
  await prisma.$executeRaw`
    INSERT INTO "ChatReport" ("id","messageId","reporterId","reason")
    VALUES (${randomUUID()}, ${args.messageId}, ${args.reporterId}, ${args.reason})
    ON CONFLICT ("messageId","reporterId") DO UPDATE SET "reason" = ${args.reason}`;

  const rows = await prisma.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM "ChatReport" WHERE "messageId" = ${args.messageId}`;
  const count = rows[0]?.n ?? 0;

  if (count >= AUTO_HIDE_REPORTS) {
    await hideMessage(args.messageId, "auto:reports");
    return { ok: true, hidden: true, count };
  }
  return { ok: true, hidden: false, count };
}

/** Soft-delete, so the seq cursors every open client is polling with stay valid. */
export async function hideMessage(id: string, by: string): Promise<void> {
  await ensureChatTables();
  await prisma.$executeRaw`
    UPDATE "ChatMessage"
    SET "hidden" = true, "hiddenAt" = now(), "hiddenBy" = ${by.slice(0, 60)}
    WHERE "id" = ${id} AND "hidden" = false`;
}

/** Undo, for a moderator clearing a report pile-on that was wrong. */
export async function unhideMessage(id: string): Promise<void> {
  await ensureChatTables();
  await prisma.$executeRaw`
    UPDATE "ChatMessage" SET "hidden" = false, "hiddenAt" = NULL, "hiddenBy" = NULL WHERE "id" = ${id}`;
  await prisma.$executeRaw`DELETE FROM "ChatReport" WHERE "messageId" = ${id}`;
}

export type QueueRow = {
  id: string;
  authorName: string;
  userId: string;
  body: string;
  hidden: boolean;
  hiddenBy: string | null;
  reports: number;
  reasons: string;
  createdAt: string;
};

/** Moderator queue: everything reported or hidden, worst first. */
export async function moderationQueue(limit = 50): Promise<QueueRow[]> {
  await ensureChatTables();
  return prisma.$queryRaw<QueueRow[]>`
    SELECT m."id", m."authorName", m."userId", m."body", m."hidden", m."hiddenBy",
           COUNT(r."id")::int AS "reports",
           COALESCE(STRING_AGG(DISTINCT r."reason", ', '), '') AS "reasons",
           m."createdAt"
    FROM "ChatMessage" m
    LEFT JOIN "ChatReport" r ON r."messageId" = m."id"
    WHERE m."room" = ${CHAT_ROOM} AND (m."hidden" = true OR r."id" IS NOT NULL)
    GROUP BY m."id", m."authorName", m."userId", m."body", m."hidden", m."hiddenBy", m."createdAt"
    ORDER BY COUNT(r."id") DESC, m."createdAt" DESC
    LIMIT ${limit}`;
}

async function prune(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `DELETE FROM "ChatMessage" WHERE "createdAt" < now() - ($1 || ' days')::interval`,
    String(RETENTION_DAYS),
  );
  await prisma.$executeRawUnsafe(`DELETE FROM "ChatPresence" WHERE "seenAt" < now() - interval '1 hour'`);
  await prisma.$executeRawUnsafe(`DELETE FROM "ChatReaction" WHERE "messageId" NOT IN (SELECT "id" FROM "ChatMessage")`);
  await prisma.$executeRawUnsafe(`DELETE FROM "ChatReport"   WHERE "messageId" NOT IN (SELECT "id" FROM "ChatMessage")`);
}

// -- Content hygiene ---------------------------------------------------------

// Strip C0/C1 control characters (newlines included: chat is single-line).
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

function normalizeBody(raw: string): string {
  return String(raw ?? "")
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
}
