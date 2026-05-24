import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET — vote totals + current user's vote
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  const [upvotes, downvotes, userVote] = await Promise.all([
    prisma.annotationVote.count({ where: { annotationId: id, value: 1 } }),
    prisma.annotationVote.count({ where: { annotationId: id, value: -1 } }),
    session
      ? prisma.annotationVote.findUnique({
          where: { annotationId_userId: { annotationId: id, userId: session.userId } },
          select: { value: true },
        })
      : null,
  ]);

  return NextResponse.json({ upvotes, downvotes, userVote: userVote?.value ?? 0 });
}

// POST — submit or toggle vote
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { id } = await params;
  const { value } = await req.json().catch(() => ({})) as { value?: number };

  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: "value must be 1 or -1" }, { status: 400 });
  }

  const annotation = await prisma.lyricAnnotation.findUnique({ where: { id }, select: { id: true } });
  if (!annotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.annotationVote.findUnique({
    where: { annotationId_userId: { annotationId: id, userId: session.userId } },
  });

  if (existing) {
    if (existing.value === value) {
      // Same vote → remove it (toggle off)
      await prisma.annotationVote.delete({
        where: { annotationId_userId: { annotationId: id, userId: session.userId } },
      });
    } else {
      // Flip vote
      await prisma.annotationVote.update({
        where: { annotationId_userId: { annotationId: id, userId: session.userId } },
        data: { value },
      });
    }
  } else {
    await prisma.annotationVote.create({
      data: { annotationId: id, userId: session.userId, value },
    });
  }

  const [upvotes, downvotes, userVote] = await Promise.all([
    prisma.annotationVote.count({ where: { annotationId: id, value: 1 } }),
    prisma.annotationVote.count({ where: { annotationId: id, value: -1 } }),
    prisma.annotationVote.findUnique({
      where: { annotationId_userId: { annotationId: id, userId: session.userId } },
      select: { value: true },
    }),
  ]);

  return NextResponse.json({ upvotes, downvotes, userVote: userVote?.value ?? 0 });
}
