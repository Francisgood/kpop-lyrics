import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRole } from "@/lib/access";
import { can } from "@/lib/roles";
import {
  listMessages,
  listReactions,
  listRecentlyHidden,
  postMessage,
  hideMessage,
  unhideMessage,
  countPresent,
  touchPresence,
  MAX_LEN,
} from "@/lib/chat-db";

export const dynamic = "force-dynamic";

// GET /api/chat/messages?since=<seq>&ref=<deviceId>
//
// The read side is open to anonymous visitors — that is the whole point of the
// launcher. The same request doubles as the presence heartbeat, so the "N fans
// here" count costs no extra round trip.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sinceRaw = Number(searchParams.get("since"));
    const since = Number.isFinite(sinceRaw) && sinceRaw > 0 ? Math.floor(sinceRaw) : null;
    const ref = String(searchParams.get("ref") ?? "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);

    const session = await getSession();
    if (ref || session) await touchPresence(session ? `u:${session.userId}` : `d:${ref}`);

    const [messages, reactions, hidden, present] = await Promise.all([
      listMessages(since),
      listReactions(session?.userId ?? null),
      listRecentlyHidden(),
      countPresent(),
    ]);

    const role = session ? await getRole(session.user) : "public";

    return NextResponse.json(
      {
        messages,
        reactions,
        hidden,
        present,
        // canSend is separate from being signed in: it also gates reactions, and
        // it is what the join form in the widget is asking for.
        me: session
          ? {
              id: session.userId,
              displayName: session.user.displayName ?? session.user.email.split("@")[0],
              canSend: session.user.emailVerified,
              canModerate: can(role, "reject"),
            }
          : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { messages: [], reactions: [], hidden: [], present: 0, me: null },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}

const SEND_ERRORS: Record<string, string> = {
  empty: "Say something first.",
  too_long: `Keep it under ${MAX_LEN} characters.`,
  rate_limited: "Slow down a sec.",
  duplicate: "You just said that.",
};

// POST /api/chat/messages — registered, email-verified members only.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "auth_required", message: "Verify your email to chat." }, { status: 401 });
    }
    if (!session.user.emailVerified) {
      return NextResponse.json({ error: "verify_required", message: "Verify your email to chat." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const result = await postMessage({
      userId: session.userId,
      authorName: session.user.displayName ?? session.user.email.split("@")[0],
      body: String(body?.body ?? ""),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, message: result.reason ?? SEND_ERRORS[result.error] ?? "Message rejected." },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true, message: result.message });
  } catch {
    return NextResponse.json({ error: "error", message: "Couldn't send. Try again." }, { status: 500 });
  }
}

// DELETE /api/chat/messages?id=<id>[&restore=1] — Moderator+ hides or restores a
// message. Soft, so the seq cursors every open client is polling with stay valid,
// and the hide is echoed back through the GET so open clients drop it live.
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const role = await getRole(session.user);
    if (!can(role, "reject")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = String(searchParams.get("id") ?? "").trim();
    if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    if (searchParams.get("restore") === "1") {
      await unhideMessage(id);
      return NextResponse.json({ ok: true, restored: true });
    }
    await hideMessage(id, `mod:${session.user.displayName ?? session.user.email}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
