import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId   = searchParams.get("entityId");

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const session = await getSession();

  const [agg, userRow] = await Promise.all([
    prisma.kimchiRating.aggregate({
      where: { entityType, entityId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    session
      ? prisma.kimchiRating.findUnique({
          where: { entityType_entityId_userId: { entityType, entityId, userId: session.user.id } },
          select: { rating: true },
        })
      : null,
  ]);

  return NextResponse.json({
    avg:        Number((agg._avg.rating ?? 0).toFixed(2)),
    count:      agg._count.rating,
    userRating: userRow?.rating ?? null,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { entityType, entityId, rating } = body;

  if (!entityType || !entityId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.kimchiRating.upsert({
    where: { entityType_entityId_userId: { entityType, entityId, userId: session.user.id } },
    create: { entityType, entityId, userId: session.user.id, rating },
    update: { rating },
  });

  const agg = await prisma.kimchiRating.aggregate({
    where: { entityType, entityId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return NextResponse.json({
    avg:        Number((agg._avg.rating ?? 0).toFixed(2)),
    count:      agg._count.rating,
    userRating: rating,
  });
}
