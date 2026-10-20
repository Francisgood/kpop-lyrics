import { NextRequest, NextResponse } from "next/server";
import { deletionAuthorized, deletionInput, deleteSocialAccount } from "@/lib/account-deletion";
import { readChatJson } from "@/lib/chat-request";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(request: NextRequest) {
  if (!deletionAuthorized(request.headers.get("authorization"))) return json({ error: "unauthorized" }, 401);
  try {
    await prisma.$queryRaw`SELECT "requestId" FROM "AccountDeletionReceipt" LIMIT 0`;
    return json({ ready: true, version: 1, product: "social" });
  } catch { return json({ ready: false }, 503); }
}
export async function POST(request: NextRequest) {
  if (!deletionAuthorized(request.headers.get("authorization"))) return json({ error: "unauthorized" }, 401);
  const body = await readChatJson(request, 2048);
  if (body.tooLarge) return json({ error: "request_too_large" }, 413);
  const input = deletionInput(body.value);
  if (!input) return json({ error: "invalid_request" }, 400);
  try { return json(await deleteSocialAccount(input)); }
  catch { return json({ error: "deletion_retry_required" }, 503); }
}
