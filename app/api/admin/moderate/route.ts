import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRole } from "@/lib/access";
import { can } from "@/lib/roles";
import { moderate, getModerationStats } from "@/lib/community-db";

export const dynamic = "force-dynamic";

// Approve/reject an annotation. Server-enforced: requires Moderator+ (spec §5.1).
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const role = await getRole(session.user);
    const body = await req.json().catch(() => ({}));
    const id = String(body?.id ?? "").trim();
    const decision = body?.decision === "approved" ? "approved" : body?.decision === "rejected" ? "rejected" : null;
    if (!id || !decision) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    if (!can(role, decision === "approved" ? "approve" : "reject")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    await moderate(id, decision, session.user.displayName ?? "Moderator");
    return NextResponse.json({ ok: true, stats: await getModerationStats() });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
