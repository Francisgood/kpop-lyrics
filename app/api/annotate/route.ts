import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAnnotation } from "@/lib/community-db";
import { slugify } from "@/app/leaderboard/data";

export const dynamic = "force-dynamic";

// A logged-in user's annotation enters the moderation queue (status pending),
// attributed to their profile slug so it shows on /u/[slug] and /annotation/[id].
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const b = await req.json().catch(() => ({}));
    const note = String(b?.note ?? "").trim();
    const songTitle = String(b?.songTitle ?? "").trim() || "a song";
    const word = String(b?.word ?? "").trim().slice(0, 80);
    if (note.length < 4) return NextResponse.json({ error: "note_required" }, { status: 400 });

    const name = session.user.displayName?.trim() || session.user.email.split("@")[0];
    const authorSlug = session.user.displayName ? slugify(session.user.displayName) : `user-${session.user.id.slice(0, 8)}`;

    const id = await createAnnotation({ authorSlug, authorName: name, songTitle, word, note });
    return NextResponse.json({ ok: true, id, status: "pending" });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
