import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPointTotal, getRank, PRIZE_TIERS } from "@/lib/points";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.userId;

  const [total, events] = await Promise.all([
    getUserPointTotal(userId),
    prisma.pointEvent.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      take:    20,
    }),
  ]);

  const rank = getRank(total);

  const tiers = PRIZE_TIERS.map((t) => ({
    ...t,
    unlocked:   t.points !== null && total >= t.points,
    progress:   t.points !== null ? Math.min(100, Math.round((total / t.points) * 100)) : null,
  }));

  return NextResponse.json({ total, rank, tiers, events });
}
