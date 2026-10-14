/**
 * POST /api/slang-quiz/complete — claim the reward for a perfect slang quiz.
 *
 * Awards a one-time +10 "slang_quiz_perfect" PointsEvent, login-required and
 * capped at once per UTC day (the deck runs on a daily rhythm, and the cap blocks
 * point-farming). The quiz is generated client-side, so the server can't re-grade
 * it; instead it checks the run is shaped like a genuine perfect round — exactly
 * QUIZ_SIZE distinct, real slang slugs, all reported correct — and records the
 * event as uncredited. The arcade credits balances after its own review, so a
 * forged claim never mints redeemable points here.
 *
 * Body: { total: number, correctSlugs: string[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { ensureSlangQuizTable, PERFECT_POINTS, QUIZ_SIZE } from "@/lib/slang-quiz";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await ensureSlangQuizTable();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Please log in to claim your points." }, { status: 401 });

    const b = await req.json().catch(() => ({}));
    const total = Number(b?.total);
    const correctSlugs: string[] = Array.isArray(b?.correctSlugs) ? b.correctSlugs.map((s: unknown) => String(s)) : [];
    const distinct = [...new Set(correctSlugs)];

    // Must look like a complete perfect run.
    if (!Number.isFinite(total) || total !== QUIZ_SIZE || distinct.length !== QUIZ_SIZE) {
      return NextResponse.json({ error: "Not a complete perfect run." }, { status: 400 });
    }
    // Every slug must be a real slang term.
    const real = await prisma.$queryRawUnsafe<{ slug: string }[]>(
      `SELECT "slug" FROM "CodedTerm" WHERE "slug" = ANY($1)`, distinct);
    if (real.length !== QUIZ_SIZE) {
      return NextResponse.json({ error: "Unknown terms in submission." }, { status: 400 });
    }

    const uid = session.user.id;
    // One award per UTC day — matches the deck's date-seeded "Daily 10".
    const already = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT "id" FROM "PointsEvent"
         WHERE "userId" = $1 AND "kind" = 'slang_quiz_perfect'
           AND "createdAt" >= date_trunc('day', now() AT TIME ZONE 'UTC')
         LIMIT 1`, uid);
    if (already.length) {
      return NextResponse.json({ ok: true, awarded: false, points: 0, reason: "already_today" });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "PointsEvent" ("id","userId","kind","points") VALUES ($1,$2,'slang_quiz_perfect',${PERFECT_POINTS})`,
      randomUUID(), uid);

    return NextResponse.json({ ok: true, awarded: true, points: PERFECT_POINTS });
  } catch (e) {
    console.error("slang-quiz complete error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
