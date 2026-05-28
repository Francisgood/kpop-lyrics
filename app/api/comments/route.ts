import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardPoints } from "@/lib/points";
import { translateToEnglish } from "@/lib/translate";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { entityType, entityId },
    include: { user: { select: { displayName: true, avatarUrl: true, id: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });

  const { entityType, entityId, body } = await req.json().catch(() => ({})) as {
    entityType?: string; entityId?: string; body?: string;
  };

  if (!entityType || !entityId || !body?.trim()) {
    return NextResponse.json({ error: "entityType, entityId, and body required" }, { status: 400 });
  }

  const bodyEn = await translateToEnglish(body.trim());

  const comment = await prisma.comment.create({
    data: { userId: session.userId, entityType, entityId, body: bodyEn },
    include: { user: { select: { displayName: true, avatarUrl: true, id: true } } },
  });
  // Award points (fire-and-forget — don't block the response)
  awardPoints(session.userId, "comment", `Commented on ${entityType}`, comment.id).catch(() => null);
  return NextResponse.json({ comment });
}
