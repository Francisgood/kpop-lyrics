import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPollSeed } from "@/lib/polls";
import type { NewsRow } from "../route";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

// Public single-article lookup by slug (used by the mobile app to render the
// full EN/ES body natively). Same columns as the feed, plus the poll slug the
// web article page would attach.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let rows: NewsRow[];
  try {
    rows = await prisma.$queryRawUnsafe<NewsRow[]>(
      `SELECT "id","slug","headline","subheadline","body","esHeadline","esSubheadline","bodyEs","imageUrl","imageCredit","category","tag",
              "artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt"
       FROM "NewsPost" WHERE "slug" = $1 AND "status" = 'live'
       LIMIT 1`, slug
    );
  } catch {
    return NextResponse.json({ error: "Articles are temporarily unavailable." }, { status: 503, headers: NO_STORE });
  }
  const post = rows[0];
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  const pollSlug = getPollSeed(slug)?.slug ?? null;
  return NextResponse.json({ ...post, pollSlug }, { headers: NO_STORE });
}
