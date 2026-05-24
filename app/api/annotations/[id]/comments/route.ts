import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET — fetch comments for an annotation
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await prisma.annotationComment.findMany({
    where: { annotationId: id },
    include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  return NextResponse.json({ comments });
}

// POST — add a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { id } = await params;
  const { body } = await req.json().catch(() => ({})) as { body?: string };

  if (!body?.trim()) return NextResponse.json({ error: "body required" }, { status: 400 });

  const annotation = await prisma.lyricAnnotation.findUnique({ where: { id }, select: { id: true } });
  if (!annotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comment = await prisma.annotationComment.create({
    data: { annotationId: id, userId: session.userId, body: body.trim() },
    include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json({ comment });
}
