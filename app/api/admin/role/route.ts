import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getRole, setRole } from "@/lib/access";
import { RANK, rankOf, type Role } from "@/lib/roles";

export const dynamic = "force-dynamic";

// Assign a role to a user. Per spec §4.3: managing roles requires Admin+, and only
// the Superadmin may act on an existing Admin or grant the Superadmin role.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const actorRole = await getRole(session.user);
    if (rankOf(actorRole) < RANK.admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const userId = String(body?.userId ?? "").trim();
    const newRole = String(body?.role ?? "") as Role;
    if (!userId || !(newRole in RANK) || newRole === "public") {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const targetRole = await getRole(target);

    // Admin-on-admin and superadmin grants are reserved for the Superadmin.
    const touchesAdmin = targetRole === "admin" || targetRole === "superadmin" || newRole === "admin" || newRole === "superadmin";
    if (touchesAdmin && actorRole !== "superadmin") {
      return NextResponse.json({ error: "superadmin_required" }, { status: 403 });
    }
    if (target.email.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase()) {
      return NextResponse.json({ error: "owner_locked" }, { status: 403 });
    }

    await setRole(userId, newRole);
    return NextResponse.json({ ok: true, role: newRole });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
