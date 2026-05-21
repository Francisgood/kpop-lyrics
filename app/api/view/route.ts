/**
 * POST /api/view
 * Body: { songId: string }
 *
 * Called by the ViewTracker client component on first mount.
 * Deduplication is handled client-side via localStorage (2-hour window),
 * so this endpoint just unconditionally records the view.
 */

import { NextRequest, NextResponse } from "next/server";
import { recordView } from "@/lib/viewcount";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { songId } = body as { songId?: string };

  if (!songId || typeof songId !== "string") {
    return NextResponse.json({ error: "songId required" }, { status: 400 });
  }

  recordView(songId);
  return NextResponse.json({ ok: true });
}
