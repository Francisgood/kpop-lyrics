import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardPoints } from "@/lib/points";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { songId, lineIndex, word, note } = await req.json().catch(() => ({})) as {
    songId?: string;
    lineIndex?: number;
    word?: string;
    note?: string;
  };

  if (!songId || lineIndex === undefined || !word?.trim() || !note?.trim()) {
    return NextResponse.json({ error: "songId, lineIndex, word, and note are required" }, { status: 400 });
  }

  const song = await prisma.song.findUnique({ where: { id: songId }, select: { id: true } });
  if (!song) return NextResponse.json({ error: "Song not found" }, { status: 404 });

  const annotation = await prisma.lyricAnnotation.create({
    data: {
      songId,
      lineIndex,
      word: word.trim(),
      note: note.trim(),
      userId: session.userId,
    },
  });
  awardPoints(session.userId, "annotation", `Annotated "${word.trim()}"`, annotation.id).catch(() => null);
  return NextResponse.json({ annotation });
}
