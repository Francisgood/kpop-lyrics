import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public, paginated news feed for the homepage infinite scroll.
export type NewsRow = {
  id: string; slug: string | null; headline: string; subheadline: string | null; body: string | null;
  esHeadline: string | null; esSubheadline: string | null;
  imageUrl: string | null; imageCredit: string | null; category: string | null; tag: string | null;
  artistSlug: string | null; artistName: string | null; sourceName: string | null; sourceUrl: string;
  readMins: number; publishedAt: Date | null;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
  try {
    const rows = await prisma.$queryRawUnsafe<NewsRow[]>(
      `SELECT "id","slug","headline","subheadline","body","esHeadline","esSubheadline","imageUrl","imageCredit","category","tag",
              "artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt"
       FROM "NewsPost" WHERE "status" = 'live'
       ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
       LIMIT $1 OFFSET $2`, limit, offset
    );
    return NextResponse.json({ posts: rows, nextOffset: offset + rows.length, hasMore: rows.length === limit });
  } catch {
    // Table not created yet → empty feed (never 500s the homepage).
    return NextResponse.json({ posts: [], nextOffset: offset, hasMore: false });
  }
}
