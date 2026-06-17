import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSongAnnotationsForAudit, applyModeration, type ModerationItem } from "@/lib/community-db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Annotation audit/moderation surface for the annotation-moderation skill.
// GET  ?song=<slug>  → the song's official lyric lines (indexed) + its community annotations.
// POST {action:"moderate", items:[{id, lineIndex?, word?, romanization?, note?, status?}]}
//      → apply placement/quality/moderation fixes (only provided fields change).
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;

  // ?list=1 → the work-list for bulk moderation: every song that has community
  // annotations, with how many are already placed (lineIndex set) vs total.
  if (sp.get("list")) {
    const rows = await prisma.$queryRawUnsafe<{ slug: string; total: number; placed: number }[]>(
      `SELECT "songSlug" AS slug, COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE "lineIndex" IS NOT NULL)::int AS placed
       FROM "CommunityAnnotation"
       WHERE "songSlug" IS NOT NULL AND "songSlug" <> ''
       GROUP BY "songSlug" ORDER BY "songSlug"`,
    );
    return NextResponse.json({ count: rows.length, songs: rows });
  }

  const slug = (sp.get("song") ?? "").trim();
  if (!slug) return NextResponse.json({ error: "song slug required" }, { status: 400 });
  const song = await prisma.song.findUnique({
    where: { slug },
    select: { slug: true, title: true, lyricsKo: true, lyricsEn: true, lyricsRomanized: true },
  });
  if (!song) return NextResponse.json({ error: "song not found" }, { status: 404 });

  const ko = (song.lyricsKo ?? "").split("\n");
  const en = (song.lyricsEn ?? "").split("\n");
  const ro = (song.lyricsRomanized ?? "").split("\n");
  // Indexed lines exactly as the song page renders them (lineIndex aligns to this).
  const n = Math.max(ko.length, en.length, ro.length);
  const lines = Array.from({ length: n }, (_unused, i) => ({
    index: i,
    ko: ko[i] ?? "",
    en: en[i] ?? "",
    ro: ro[i] ?? "",
  })).filter((l) => l.ko.trim() || l.en.trim() || l.ro.trim());

  const annotations = await getSongAnnotationsForAudit(slug, song.title);
  return NextResponse.json({
    song: { slug: song.slug, title: song.title },
    lineCount: n,
    lines,
    annotations: annotations.map((a) => ({
      id: a.id,
      authorName: a.authorName,
      authorSlug: a.authorSlug,
      word: a.word,
      romanization: a.romanization,
      note: a.note,
      lineIndex: a.lineIndex,
      status: a.status,
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (String(b?.action ?? "") !== "moderate") {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
  const items: ModerationItem[] = Array.isArray(b?.items) ? b.items : [];
  const updated = await applyModeration(items);
  return NextResponse.json({ ok: true, updated });
}
