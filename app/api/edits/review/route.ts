import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canReview } from "@/lib/permissions";
import { applyFieldEdit } from "@/lib/applyEdit";

// PATCH /api/edits/review?id=xxx  body: { action: "approve" | "reject" | "revert" }
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canReview(session.user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const editId = searchParams.get("id");
  if (!editId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { action } = await req.json().catch(() => ({})) as { action?: string };
  if (!action || !["approve", "reject", "revert"].includes(action)) {
    return NextResponse.json({ error: "action must be approve | reject | revert" }, { status: 400 });
  }

  const edit = await prisma.suggestedEdit.findUnique({ where: { id: editId } });
  if (!edit) return NextResponse.json({ error: "Edit not found" }, { status: 404 });

  if (action === "revert" && edit.status !== "approved") {
    return NextResponse.json({ error: "Can only revert approved edits" }, { status: 400 });
  }
  if ((action === "approve" || action === "reject") && edit.status !== "pending") {
    return NextResponse.json({ error: "Edit is not pending" }, { status: 400 });
  }

  const now = new Date();
  const reviewerId = session.user.id;

  await prisma.$transaction(async (tx) => {
    if (action === "approve") {
      await applyFieldEdit(edit.entityType, edit.entityId, edit.field, edit.suggestedVal);
      await tx.suggestedEdit.update({
        where: { id: editId },
        data: { status: "approved", reviewedById: reviewerId, reviewedAt: now },
      });
    } else if (action === "reject") {
      await tx.suggestedEdit.update({
        where: { id: editId },
        data: { status: "rejected", reviewedById: reviewerId, reviewedAt: now },
      });
    } else if (action === "revert") {
      await applyFieldEdit(edit.entityType, edit.entityId, edit.field, edit.currentVal ?? null);
      await tx.suggestedEdit.update({
        where: { id: editId },
        data: { status: "reverted", reviewedById: reviewerId, reviewedAt: now },
      });
    }

    await tx.auditLog.create({
      data: {
        userId:     reviewerId,
        action,
        entityType: edit.entityType,
        entityId:   edit.entityId,
        editId,
        detail:     `field="${edit.field}" val="${action === "revert" ? edit.currentVal : edit.suggestedVal}"`,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
