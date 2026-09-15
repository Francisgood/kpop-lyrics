import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRole } from "@/lib/access";
import { can } from "@/lib/roles";
import { reportMessage, moderationQueue } from "@/lib/chat-db";
import { REPORT_REASONS, AUTO_HIDE_REPORTS, type ReportReason } from "@/lib/chat-moderation";

export const dynamic = "force-dynamic";

// POST /api/chat/report — any verified member flags a message.
//
// Reports are the half of moderation a word list can't do. Three distinct
// reporters hide a message on the spot, which is what actually stops a pile-on
// at 3am; a moderator then confirms or restores it from the queue below.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    if (!session.user.emailVerified) {
      return NextResponse.json({ error: "verify_required", message: "Verify your email to report." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const messageId = String(body?.messageId ?? "").trim();
    const reason = String(body?.reason ?? "") as ReportReason;
    if (!messageId || !REPORT_REASONS.includes(reason)) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const result = await reportMessage({ messageId, reporterId: session.userId, reason });
    return NextResponse.json({
      ok: true,
      hidden: result.hidden,
      message: result.hidden
        ? "Thanks — that message is hidden pending review."
        : "Thanks for flagging. A moderator will look.",
      threshold: AUTO_HIDE_REPORTS,
    });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

// GET /api/chat/report — Moderator+ reads the queue of reported or hidden messages.
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const role = await getRole(session.user);
    if (!can(role, "view_mod_queue")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    return NextResponse.json({ queue: await moderationQueue() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
