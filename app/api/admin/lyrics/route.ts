import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Lyrics admin: list songs needing translation, move imported lyrics to the Korean
// column, and write English translations. Secret-gated like the other automation
// endpoints (used by the translate-lyrics skill).
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// GET → songs with Korean lyrics but no English translation yet.
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") ?? 60), 200);
  const rows = await prisma.$queryRawUnsafe<{ slug: string; title: string; lyricsKo: string }[]>(
    `SELECT "slug","title","lyricsKo" FROM "Song"
     WHERE COALESCE("lyricsKo",'') <> '' AND COALESCE("lyricsEn",'') = ''
     ORDER BY "viewCount" DESC LIMIT $1`,
    limit,
  );
  return NextResponse.json({ count: rows.length, songs: rows });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const action = String(b?.action ?? "");

  // One-off: imported lyrics (original Korean) landed in lyricsEn; move them to the
  // Korean column (left) for the recently-imported Aespa/Kiiikiii songs.
  if (action === "move-imported") {
    const moved = await prisma.$executeRawUnsafe(
      `UPDATE "Song" SET "lyricsKo" = "lyricsEn", "lyricsEn" = NULL
       WHERE ("slug" LIKE 'aespa-%' OR "slug" LIKE 'kiiikiii-%')
         AND COALESCE("lyricsKo",'') = '' AND COALESCE("lyricsEn",'') <> ''`,
    );
    return NextResponse.json({ ok: true, moved });
  }

  // Write English translations (right side) produced by the translate-lyrics skill.
  // Optionally also rewrite the Korean (left side) with a cleaned version — the
  // skill strips Genius page chrome (the "N Contributors…Lyrics[…가사]" header,
  // trailing "Embed"/"You might also like") so both columns read cleanly.
  if (action === "set-translations") {
    const items: { slug?: string; lyricsEn?: string; lyricsKo?: string }[] = Array.isArray(b?.items) ? b.items : [];
    let updated = 0;
    for (const it of items) {
      const slug = String(it?.slug ?? "").trim();
      const lyricsEn = String(it?.lyricsEn ?? "");
      if (!slug || !lyricsEn.trim()) continue;
      const lyricsKo = typeof it?.lyricsKo === "string" && it.lyricsKo.trim() ? it.lyricsKo : null;
      if (lyricsKo) {
        await prisma.$executeRaw`UPDATE "Song" SET "lyricsEn" = ${lyricsEn}, "lyricsKo" = ${lyricsKo} WHERE "slug" = ${slug}`;
      } else {
        await prisma.$executeRaw`UPDATE "Song" SET "lyricsEn" = ${lyricsEn} WHERE "slug" = ${slug}`;
      }
      updated++;
    }
    return NextResponse.json({ ok: true, updated });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
