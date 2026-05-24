import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canDirectEdit } from "@/lib/permissions";

const ALLOWED_FIELDS = ["lyricsKo", "lyricsEn", "lyricsRomanized"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { songId, lineIndex, field, value, reason } = await req.json().catch(() => ({})) as {
    songId?: string;
    lineIndex?: number;
    field?: string;
    value?: string;
    reason?: string;
  };

  if (!songId || lineIndex === undefined || !field || !ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: "songId, lineIndex, and a valid field are required" }, { status: 400 });
  }

  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: { id: true, lyricsKo: true, lyricsEn: true, lyricsRomanized: true },
  });
  if (!song) return NextResponse.json({ error: "Song not found" }, { status: 404 });

  const currentFull = (song as Record<string, string | null>)[field] ?? "";
  const lines = currentFull.split("\n");
  lines[lineIndex] = value ?? "";
  const newFull = lines.join("\n");

  if (canDirectEdit(session.user)) {
    await prisma.$transaction([
      prisma.song.update({ where: { id: songId }, data: { [field]: newFull } }),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "direct_edit",
          entityType: "song",
          entityId: songId,
          detail: `${field} line ${lineIndex + 1}: ${(value ?? "").slice(0, 80)}`,
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // Non-admin: create a suggestion with full reconstructed field value
  await prisma.suggestedEdit.create({
    data: {
      userId: session.userId,
      entityType: "song",
      entityId: songId,
      field,
      currentVal: currentFull,
      suggestedVal: newFull,
      reason: reason?.trim() || `Line ${lineIndex + 1} correction`,
    },
  });
  return NextResponse.json({ ok: true, suggested: true });
}
