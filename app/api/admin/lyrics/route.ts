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

// GET → songs with Korean lyrics still missing a translation.
//   (default)   → missing ENGLISH  (the nightly translate-lyrics skill)
//   ?target=es  → missing SPANISH  (the Korean→Spanish pipeline)
//   ?stats=1    → catalog counts for both languages
// Optional ?prefix=aespa- targets a single artist's recent imports (otherwise the
// view-count ordering buries brand-new, zero-view songs below the cap).
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(Number(sp.get("limit") ?? 60), 200);
  const prefix = (sp.get("prefix") ?? "").trim();
  // Whitelisted, never user-controlled → safe to interpolate into the raw SQL.
  const target = sp.get("target") === "es" ? "es" : "en";
  const missingCol = target === "es" ? `"lyricsEs"` : `"lyricsEn"`;

  if (sp.get("stats")) {
    const rows = await prisma.$queryRawUnsafe<Record<string, number>[]>(
      `SELECT COUNT(*)::int AS "songsTotal",
              COUNT(*) FILTER (WHERE COALESCE("lyricsKo",'') <> '')::int AS "withKorean",
              COUNT(*) FILTER (WHERE COALESCE("lyricsEn",'') <> '')::int AS "withEnglish",
              COUNT(*) FILTER (WHERE COALESCE("lyricsEs",'') <> '')::int AS "withSpanish",
              COUNT(*) FILTER (WHERE COALESCE("lyricsKo",'') <> '' AND COALESCE("lyricsEs",'') = '')::int AS "needSpanish"
       FROM "Song"`);
    return NextResponse.json(rows[0] ?? {});
  }

  type Row = { slug: string; title: string; lyricsKo: string };
  const rows = prefix
    ? await prisma.$queryRawUnsafe<Row[]>(
        `SELECT "slug","title","lyricsKo" FROM "Song"
         WHERE COALESCE("lyricsKo",'') <> '' AND COALESCE(${missingCol},'') = '' AND "slug" LIKE $1
         ORDER BY "viewCount" DESC LIMIT $2`,
        `${prefix}%`,
        limit,
      )
    : await prisma.$queryRawUnsafe<Row[]>(
        `SELECT "slug","title","lyricsKo" FROM "Song"
         WHERE COALESCE("lyricsKo",'') <> '' AND COALESCE(${missingCol},'') = ''
         ORDER BY "viewCount" DESC LIMIT $1`,
        limit,
      );
  return NextResponse.json({ count: rows.length, songs: rows, target });
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

  // Write Spanish translations (Korean→Spanish pipeline). Shown on song pages when
  // the site-wide toggle is set to ES. Never blanks an existing translation.
  if (action === "set-es-translations") {
    const items: { slug?: string; lyricsEs?: string }[] = Array.isArray(b?.items) ? b.items : [];
    let updated = 0;
    for (const it of items) {
      const slug = String(it?.slug ?? "").trim();
      const lyricsEs = String(it?.lyricsEs ?? "");
      if (!slug || !lyricsEs.trim()) continue;
      updated += Number(await prisma.$executeRaw`UPDATE "Song" SET "lyricsEs" = ${lyricsEs} WHERE "slug" = ${slug}`);
    }
    const rows = await prisma.$queryRawUnsafe<{ remaining: number }[]>(
      `SELECT COUNT(*) FILTER (WHERE COALESCE("lyricsKo",'') <> '' AND COALESCE("lyricsEs",'') = '')::int AS remaining FROM "Song"`);
    return NextResponse.json({ ok: true, received: items.length, updated, remaining: rows[0]?.remaining ?? null });
  }

  // One-off catalog cleanup: normalize Cyrillic homoglyphs (е/а/о/с/р/х… that look
  // identical to Latin letters but break exact-substring matching + search) to Latin.
  // Lyrics are Korean + English only, so there is no legitimate Cyrillic to preserve.
  if (action === "clean-homoglyphs") {
    const FROM = "аеосрхуѕіјкАЕОСРХУКМНТВІЈ";
    const TO = "aeocpxysijkAEOCPXYKMHTBIJ";
    const cleaned = await prisma.$executeRawUnsafe(
      `UPDATE "Song" SET
         "lyricsKo" = CASE WHEN "lyricsKo" IS NULL THEN NULL ELSE translate("lyricsKo", $1, $2) END,
         "lyricsEn" = CASE WHEN "lyricsEn" IS NULL THEN NULL ELSE translate("lyricsEn", $1, $2) END,
         "lyricsRomanized" = CASE WHEN "lyricsRomanized" IS NULL THEN NULL ELSE translate("lyricsRomanized", $1, $2) END
       WHERE "lyricsKo" ~ '[а-яА-ЯѕіјЅІЈ]' OR "lyricsEn" ~ '[а-яА-ЯѕіјЅІЈ]' OR "lyricsRomanized" ~ '[а-яА-ЯѕіјЅІЈ]'`,
      FROM,
      TO,
    );
    return NextResponse.json({ ok: true, cleaned });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
