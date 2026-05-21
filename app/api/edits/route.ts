import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to suggest edits" }, { status: 401 });

  const { entityType, entityId, field, currentVal, suggestedVal, reason } = await req.json().catch(() => ({})) as {
    entityType?: string; entityId?: string; field?: string;
    currentVal?: string; suggestedVal?: string; reason?: string;
  };

  if (!entityType || !entityId || !field || !suggestedVal?.trim()) {
    return NextResponse.json({ error: "entityType, entityId, field, and suggestedVal required" }, { status: 400 });
  }

  const edit = await prisma.suggestedEdit.create({
    data: {
      userId: session.userId,
      entityType,
      entityId,
      field,
      currentVal: currentVal ?? null,
      suggestedVal: suggestedVal.trim(),
      reason: reason?.trim() ?? null,
    },
  });
  return NextResponse.json({ edit });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  const where: Record<string, string> = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const edits = await prisma.suggestedEdit.findMany({
    where,
    include: { user: { select: { displayName: true, id: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ edits });
}
