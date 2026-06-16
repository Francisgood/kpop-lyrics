import { NextRequest, NextResponse } from "next/server";
import { reindexAll } from "@/lib/search";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Rebuild the Elasticsearch index from the DB. Secret-gated like the other
// automation endpoints; runs inside the app so it can reach the private ES service.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await reindexAll();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
