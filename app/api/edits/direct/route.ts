import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canDirectEdit } from "@/lib/permissions";
import { applyFieldEdit } from "@/lib/applyEdit";

// POST /api/edits/direct  body: { entityType, entityId, field, value }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDirectEdit(session.user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { entityType, entityId, field, value } = await req.json().catch(() => ({})) as {
    entityType?: string; entityId?: string; field?: string; value?: string;
  };

  if (!entityType || !entityId || !field) {
    return NextResponse.json({ error: "entityType, entityId, and field required" }, { status: 400 });
  }

  await applyFieldEdit(entityType, entityId, field, value ?? null);

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "direct_edit",
      entityType,
      entityId,
      detail: JSON.stringify({ field, value }),
    },
  });

  return NextResponse.json({ ok: true });
}
