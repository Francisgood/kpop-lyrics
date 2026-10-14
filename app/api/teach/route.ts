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
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { ensureTeachTables, youtubeId, UPLOAD_POINTS, UPVOTE_BONUS_THRESHOLD, BONUS_POINTS } from "@/lib/teach";

export const dynamic = "force-dynamic";

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

    const dupe = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT "id" FROM "TeachClip" WHERE "userId" = $1 AND "videoId" = $2 LIMIT 1`, userId, videoId);
    if (dupe.length) return NextResponse.json({ error: "You already submitted that clip." }, { status: 409 });

    const id = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TeachClip" ("id","userId","userName","videoId","title","artist","city") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      id, userId, userName, videoId, title, artist, city);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PointsEvent" ("id","userId","kind","points","clipId") VALUES ($1,$2,'teach_upload',${UPLOAD_POINTS},$3)`,
      randomUUID(), userId, id);

    return NextResponse.json({ ok: true, id, uploadPoints: UPLOAD_POINTS });
  } catch (e) {
    console.error("teach POST error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
