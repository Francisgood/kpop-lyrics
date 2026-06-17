import { NextRequest, NextResponse } from "next/server";
import { reseedCommunity } from "@/lib/community-db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Rebuild the leaderboard showcase annotations/comments after the contributor
// usernames/slugs change (the generated rows are keyed by slug). Real user
// submissions — ids starting with "u-" — are preserved. Secret-gated like the
// other automation endpoints.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const counts = await reseedCommunity();
  return NextResponse.json({ ok: true, ...counts });
}
