import { createHash, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type DeletionInput = { requestId: string; issuer: string; subject: string };
export function deletionAuthorized(header: string | null): boolean {
  const key = process.env.AEGYO_ACCOUNT_DELETION_KEY;
  if (!key || key.length < 32 || !header || header.length > 1024) return false;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(header), hash(`Bearer ${key}`));
}
export function deletionInput(value: unknown): DeletionInput | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const issuer = process.env.AEGYO_AUTH_BASE_URL ? `${process.env.AEGYO_AUTH_BASE_URL}/api/auth` : null;
  return typeof v.requestId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.requestId) &&
    issuer !== null && v.issuer === issuer && typeof v.subject === "string" && v.subject.length > 0 && v.subject.length <= 200
    ? v as DeletionInput : null;
}

export async function deleteSocialAccount(input: DeletionInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.issuer + ":" + input.subject}))`;
    const prior = await tx.$queryRaw<Array<{ requestId: string; issuer: string; subject: string; manifest: {status: string; [key: string]: unknown} }>>`
      SELECT * FROM "AccountDeletionReceipt" WHERE "requestId"=${input.requestId}::uuid OR (issuer=${input.issuer} AND subject=${input.subject})`;
    if (prior.length) {
      const receipt = prior[0];
      if (receipt.issuer !== input.issuer || receipt.subject !== input.subject) throw new Error("request_conflict");
      return { ...receipt.manifest, requestId: input.requestId };
    }
    const users = await tx.$queryRaw<Array<{ id: string; email: string; displayName: string | null }>>`
      SELECT u.id,u.email,u."displayName" FROM "User" u JOIN "SharedAuthIdentity" i ON i."userId"=u.id
      WHERE i.issuer=${input.issuer} AND i.subject=${input.subject} FOR UPDATE OF u`;
    const user = users[0];
    const removed: Record<string, number> = {};
    const review: string[] = [];
    const reviewRecords: Array<Record<string, unknown>> = [];
    if (user) {
      // Serialize against chat's post/moderation transaction; all future writes lose their User FK/session.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;
      const columns = await tx.$queryRaw<Array<{ table_name: string; column_name: string }>>`
        SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public'`;
      const has = (table: string, column: string) => columns.some((c) => c.table_name === table && c.column_name === column);
      const erase = async (table: string, column: string, value: string) => {
        if (!has(table, column)) return;
        // Identifiers come exclusively from the literal manifest below, never user input.
        removed[table] = (removed[table] ?? 0) + await tx.$executeRawUnsafe(
          `DELETE FROM "${table}" WHERE "${column}"=$1`, value,
        );
      };
      if (has("TeachClipVote", "clipId") && has("TeachClip", "userId")) {
        removed.TeachClipVotesOnRemovedClips = await tx.$executeRaw`
          DELETE FROM "TeachClipVote" WHERE "clipId" IN (SELECT id FROM "TeachClip" WHERE "userId"=${user.id})`;
      }
      // Remove messages before their audit records lose the message link.
      if (has("ChatModerationEvent", "messageId")) {
        removed.ChatModerationEvent = await tx.$executeRaw`
          DELETE FROM "ChatModerationEvent" WHERE "userId"=${user.id}
          OR "messageId" IN (SELECT id FROM "ChatMessage" WHERE "authorId"=${user.id})`;
      }
      for (const [table, column] of [
        ["Session","userId"],["Favorite","userId"],["SuggestedEdit","userId"],["Comment","userId"],
        ["ChatReport","reporterId"],["ChatMessage","authorId"],["ChatPostAttempt","userId"],
        ["ChatParticipation","userId"],["ChatMute","userId"],["TeachClipVote","userId"],
        ["PointsEvent","userId"],["TeachClip","userId"],["Follow","followerId"],["SlangVote","userId"],
        ["PollVote","voterRef"],
      ]) await erase(table, column, user.id);
      await erase("PasswordReset", "email", user.email);
      for (const table of ["EventRegistration","RestockAlert","PlushieNotify","Tip",
        "GiveawayEntry","GiveawayEntryLsf","GiveawayEntryMystery2027"]) {
        if (has(table, "email")) {
          // External newsletter copies need a private reconciliation reference.
          const matches = await tx.$queryRawUnsafe<Array<{ id: string }>>(`SELECT id FROM "${table}" WHERE email=$1`, user.email);
          if (matches.length) {
            if (!review.includes("external_newsletter_subscription")) {
              review.push("external_newsletter_subscription");
              reviewRecords.push({ category: "external_newsletter_subscription", email: user.email });
            }
          }
          await erase(table, "email", user.email);
        }
      }
      // Historical annotations used display-name slugs, which are not unique account IDs.
      // Flag matches for reconciliation; never erase another person's content by a name match.
      const slug = user.displayName?.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `user-${user.id.slice(0,8)}`;
      for (const table of ["CommunityAnnotation","CommunityComment"]) {
        if (has(table, "authorSlug")) {
          const matches = await tx.$queryRawUnsafe<Array<{ id: string }>>(`SELECT id FROM "${table}" WHERE "authorSlug"=$1`, slug);
          if (matches.length) {
            review.push(`legacy_unattributed_${table}`);
            reviewRecords.push({ category: "ambiguous_ownership", table, recordIds: matches.map((r) => r.id) });
          }
        }
      }
      for (const [table, column] of [["ChatMessage","reviewedById"],["ChatModerationEvent","actorId"],["ChatMute","actorId"]]) {
        if (has(table,column)) await tx.$executeRawUnsafe(`UPDATE "${table}" SET "${column}"=$1 WHERE "${column}"=$2`, "deleted-account", user.id);
      }
      await erase("SharedAuthIdentity", "userId", user.id);
      await erase("User", "id", user.id);
    }
    const manifest = { requestId: input.requestId, status: review.length ? "needs_review" : user ? "completed" : "no_link",
      removed, retained: ["deletion_tombstone"], review };
    await tx.$executeRaw`INSERT INTO "AccountDeletionReceipt" ("requestId",issuer,subject,manifest,"reviewRecords")
      VALUES(${input.requestId}::uuid,${input.issuer},${input.subject},${JSON.stringify(manifest)}::jsonb,${JSON.stringify(reviewRecords)}::jsonb)`;
    return manifest;
  }, { timeout: 15_000 });
}
