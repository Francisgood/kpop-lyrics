/**
 * POST /api/teach/upvote  — upvote a teach-choreography clip (login required).
 *
 * One upvote per account per clip (idempotent), so the count is the number of
 * UNIQUE users. Owners can't upvote their own clip. When a clip passes the
 * threshold of unique upvotes, a one-time +100 "teach_upvote_bonus" PointsEvent
 * is recorded for the clip's owner (credited later, arcade-side).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { ensureTeachTables, UPVOTE_BONUS_THRESHOLD, BONUS_POINTS } from "../route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await ensureTeachTables();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Please log in to upvote." }, { status: 401 });

    const b = await req.json().catch(() => ({}));
    const clipId = String(b?.clipId ?? "").trim();
    if (!clipId) return NextResponse.json({ error: "Missing clipId." }, { status: 400 });

    const rows = await prisma.$queryRawUnsafe<{ userId: string; bonusAwarded: boolean }[]>(
      `SELECT "userId","bonusAwarded" FROM "TeachClip" WHERE "id" = $1 AND "status" = 'live' LIMIT 1`, clipId);
    if (!rows.length) return NextResponse.json({ error: "Clip not found." }, { status: 404 });
    const owner = rows[0].userId;
    const uid = session.user.id;
    if (owner === uid) return NextResponse.json({ error: "You can't upvote your own clip." }, { status: 403 });

    // Idempotent: a repeat upvote is a no-op (unique index on clipId+userId).
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TeachClipVote" ("id","clipId","userId") VALUES ($1,$2,$3) ON CONFLICT ("clipId","userId") DO NOTHING`,
      randomUUID(), clipId, uid);

    const cnt = await prisma.$queryRawUnsafe<{ c: number }[]>(
      `SELECT COUNT(*)::int AS c FROM "TeachClipVote" WHERE "clipId" = $1`, clipId);
    const upvotes = Number(cnt[0]?.c ?? 0);

    // Award the one-time bonus when it crosses the threshold. The conditional
    // UPDATE is the atomic guard so the +100 is recorded exactly once.
    if (upvotes > UPVOTE_BONUS_THRESHOLD && !rows[0].bonusAwarded) {
      const upd = await prisma.$executeRawUnsafe(
        `UPDATE "TeachClip" SET "bonusAwarded" = true WHERE "id" = $1 AND "bonusAwarded" = false`, clipId);
      if (Number(upd) === 1) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "PointsEvent" ("id","userId","kind","points","clipId") VALUES ($1,$2,'teach_upvote_bonus',${BONUS_POINTS},$3)`,
          randomUUID(), owner, clipId);
      }
    }

    return NextResponse.json({ ok: true, upvotes, upvotedByMe: true });
  } catch (e) {
    console.error("teach upvote error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
