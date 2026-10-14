/**
 * Teach Choreography — fan-submitted dance-teaching clips (YouTube).
 *
 *   GET  /api/teach   → public gallery: live clips, unique-upvote counts, and
 *                       whether the current viewer already upvoted each.
 *   POST /api/teach   → submit a clip (login required). Records a +10
 *                       "teach_upload" PointsEvent.
 *
 * Points live on the arcade (a separate app), so this side only RECORDS earned
 * points in the PointsEvent ledger (credited = false). The arcade reads
 * uncredited events and credits balances after whatever review it applies —
 * which also means no upload/upvote instantly mints redeemable points here.
 *
 * Self-healing tables (CREATE TABLE IF NOT EXISTS), same pattern as Follow/Tip.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export const UPVOTE_BONUS_THRESHOLD = 10; // ">10 unique users" unlocks the bonus
export const UPLOAD_POINTS = 10;
export const BONUS_POINTS = 100;

let ready = false;
export async function ensureTeachTables() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeachClip" (
      "id"            TEXT PRIMARY KEY,
      "userId"        TEXT NOT NULL,
      "userName"      TEXT,
      "videoId"       TEXT NOT NULL,
      "title"         TEXT NOT NULL,
      "artist"        TEXT,
      "city"          TEXT,
      "status"        TEXT NOT NULL DEFAULT 'live',
      "bonusAwarded"  BOOLEAN NOT NULL DEFAULT false,
      "createdAt"     TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TeachClip_status_created_idx" ON "TeachClip" ("status","createdAt")`);
  // One submission per (user, video) so the +10 can't be farmed with one clip.
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TeachClip_user_video_key" ON "TeachClip" ("userId","videoId")`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeachClipVote" (
      "id"         TEXT PRIMARY KEY,
      "clipId"     TEXT NOT NULL,
      "userId"     TEXT NOT NULL,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  // One upvote per account per clip → COUNT(*) is the unique-user count.
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TeachClipVote_clip_user_key" ON "TeachClipVote" ("clipId","userId")`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PointsEvent" (
      "id"         TEXT PRIMARY KEY,
      "userId"     TEXT NOT NULL,
      "kind"       TEXT NOT NULL,
      "points"     INTEGER NOT NULL,
      "clipId"     TEXT,
      "credited"   BOOLEAN NOT NULL DEFAULT false,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PointsEvent_credited_idx" ON "PointsEvent" ("credited","createdAt")`);
  ready = true;
}

// Pull the 11-char video id out of any common YouTube URL form.
export function youtubeId(raw: string): string | null {
  const s = (raw || "").trim();
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/) ||
            s.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

type ClipRow = {
  id: string; videoId: string; title: string; artist: string | null; city: string | null;
  userName: string | null; createdAt: Date; upvotes: number; mine: boolean; upvotedByMe: boolean;
};

export async function GET() {
  try {
    await ensureTeachTables();
    const session = await getSession();
    const uid = session?.user.id ?? "";
    const rows = await prisma.$queryRawUnsafe<ClipRow[]>(
      `SELECT c."id", c."videoId", c."title", c."artist", c."city", c."userName", c."createdAt",
              (SELECT COUNT(*)::int FROM "TeachClipVote" v WHERE v."clipId" = c."id") AS "upvotes",
              (c."userId" = $1) AS "mine",
              EXISTS(SELECT 1 FROM "TeachClipVote" v WHERE v."clipId" = c."id" AND v."userId" = $1) AS "upvotedByMe"
       FROM "TeachClip" c
       WHERE c."status" = 'live'
       ORDER BY "upvotes" DESC, c."createdAt" DESC
       LIMIT 120`,
      uid,
    );
    return NextResponse.json({
      loggedIn: !!session,
      threshold: UPVOTE_BONUS_THRESHOLD,
      uploadPoints: UPLOAD_POINTS,
      bonusPoints: BONUS_POINTS,
      clips: rows,
    });
  } catch (e) {
    console.error("teach GET error:", e);
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTeachTables();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Please log in to submit a clip." }, { status: 401 });

    const b = await req.json().catch(() => ({}));
    const videoId = youtubeId(String(b?.url ?? ""));
    if (!videoId) return NextResponse.json({ error: "Paste a valid YouTube link." }, { status: 400 });
    const title = String(b?.title ?? "").trim().slice(0, 160);
    if (title.length < 3) return NextResponse.json({ error: "Give your clip a short title." }, { status: 400 });
    const artist = b?.artist ? String(b.artist).trim().slice(0, 120) : null;
    const city = b?.city ? String(b.city).trim().slice(0, 160) : null;

    const userId = session.user.id;
    const userName = session.user.displayName ?? session.user.email.split("@")[0];

    // One clip per (user, video): a duplicate just no-ops (no extra +10).
    const dupe = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT "id" FROM "TeachClip" WHERE "userId" = $1 AND "videoId" = $2 LIMIT 1`, userId, videoId);
    if (dupe.length) return NextResponse.json({ error: "You already submitted that clip." }, { status: 409 });

    const id = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TeachClip" ("id","userId","userName","videoId","title","artist","city") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      id, userId, userName, videoId, title, artist, city);
    // Earned-points event for the upload (credited later, arcade-side).
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PointsEvent" ("id","userId","kind","points","clipId") VALUES ($1,$2,'teach_upload',${UPLOAD_POINTS},$3)`,
      randomUUID(), userId, id);

    return NextResponse.json({ ok: true, id, uploadPoints: UPLOAD_POINTS });
  } catch (e) {
    console.error("teach POST error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
