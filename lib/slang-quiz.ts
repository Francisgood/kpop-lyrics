/**
 * Server helpers for the Korean-slang practice quiz points.
 *
 * A perfect run (all QUIZ_SIZE correct) records a one-time +PERFECT_POINTS
 * "slang_quiz_perfect" event in the shared PointsEvent ledger. Like the Teach
 * feature, points are only RECORDED here (credited = false) — the arcade (a
 * separate app) reads uncredited events and credits balances after its review,
 * so nothing mints redeemable points on this side.
 */

import { prisma } from "@/lib/prisma";

export const QUIZ_SIZE = 10;
export const PERFECT_POINTS = 10;

let ready = false;
export async function ensureSlangQuizTable() {
  if (ready) return;
  // Same idempotent DDL as lib/teach.ts' PointsEvent — CREATE TABLE IF NOT EXISTS
  // means whichever feature runs first bootstraps it and the other is a no-op.
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PointsEvent" (
      "id"         TEXT PRIMARY KEY,
      "userId"     TEXT NOT NULL,
      "kind"       TEXT NOT NULL,
      "points"     INTEGER NOT NULL,
      "clipId"     TEXT,
      "credited"   BOOLEAN NOT NULL DEFAULT false,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PointsEvent_credited_idx" ON "PointsEvent" ("credited","createdAt")`);
  // Speeds up the once-per-day guard (userId + kind + day).
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PointsEvent_user_kind_idx" ON "PointsEvent" ("userId","kind","createdAt")`);
  await prisma.$executeRawUnsafe("DO $$ BEGIN IF to_regprocedure('aegyo_install_account_guard(text,text)') IS NOT NULL THEN PERFORM aegyo_install_account_guard('PointsEvent','userId'); END IF; END $$");
  ready = true;
}
