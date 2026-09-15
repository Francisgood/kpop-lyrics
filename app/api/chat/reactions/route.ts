import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toggleReaction } from "@/lib/chat-db";

export const dynamic = "force-dynamic";

// POST /api/chat/reactions — toggle one emoji on one message.
//
// Behind the same gate as sending: reacting is participating, and an
// unverified visitor tapping a heart is exactly the moment to ask for an email.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "auth_required", message: "Verify your email to react." }, { status: 401 });
    }
    if (!session.user.emailVerified) {
      return NextResponse.json({ error: "verify_required", message: "Verify your email to react." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const messageId = String(body?.messageId ?? "").trim();
    const emoji = String(body?.emoji ?? "");
    if (!messageId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const result = await toggleReaction({ messageId, userId: session.userId, emoji });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, message: result.error === "too_many" ? "That's enough reactions on one message." : "Couldn't react." },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true, on: result.on });
  } catch {
    return NextResponse.json({ error: "error", message: "Couldn't react. Try again." }, { status: 500 });
  }
}
