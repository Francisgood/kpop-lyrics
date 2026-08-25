import { NextRequest, NextResponse } from "next/server";
import { ingestVideos, type VideoIn } from "@/lib/videos-db";

export const dynamic = "force-dynamic";

// Secret-gated ingest for per-entity videos. Auth: Bearer ${IMAGE_REFRESH_SECRET}.
// POST { videos: [ { entityType:"artist"|"song", entitySlug, kind, ref, title?, note?, ... } ] }
// Idempotent (upsert by entity+kind+ref). Live immediately — no deploy.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json().catch(() => ({}));
    const videos: VideoIn[] = Array.isArray(b?.videos) ? b.videos : Array.isArray(b) ? b : [];
    if (!videos.length) return NextResponse.json({ error: "Provide { videos: [...] }" }, { status: 400 });
    const n = await ingestVideos(videos);
    return NextResponse.json({ ok: true, upserted: n });
  } catch (e) {
    console.error("videos ingest error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
