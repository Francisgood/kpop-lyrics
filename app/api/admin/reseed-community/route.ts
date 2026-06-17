import { NextRequest, NextResponse } from "next/server";
import { reseedCommunity } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Rebuild the leaderboard showcase annotations/comments after the contributor
// usernames/slugs change (the generated rows are keyed by slug). Real user
// submissions — ids starting with "u-" — are preserved. Secret-gated like the
// other automation endpoints. Returns a coverage diagnostic (uncached) so the
// reseed result can be verified without fighting song-page ISR caching.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const counts = await reseedCommunity();

  // Coverage diagnostic: how many distinct aespa songs got approved annotations.
  const cov = await prisma.$queryRawUnsafe<{ total: number; covered: number; min: number; max: number }[]>(
    `WITH per AS (
       SELECT s."slug", COUNT(a."id")::int AS n
       FROM "Song" s
       LEFT JOIN "CommunityAnnotation" a ON a."songSlug" = s."slug" AND a."status" = 'approved'
       WHERE s."slug" LIKE 'aespa-%' AND COALESCE(s."lyricsKo",'') <> ''
       GROUP BY s."slug"
     )
     SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE n > 0)::int AS covered,
            COALESCE(MIN(n),0)::int AS min, COALESCE(MAX(n),0)::int AS max FROM per`,
  );
  const sample = await prisma.$queryRawUnsafe<{ songSlug: string; n: number }[]>(
    `SELECT "songSlug", COUNT(*)::int AS n FROM "CommunityAnnotation"
     WHERE "status" = 'approved' AND "songSlug" IN ('aespa-spicy','aespa-whiplash','aespa-supernova','aespa-armageddon','aespa-next-level','aespa-drama')
     GROUP BY "songSlug" ORDER BY "songSlug"`,
  );

  return NextResponse.json({ ok: true, ...counts, aespaCoverage: cov[0], sample });
}
