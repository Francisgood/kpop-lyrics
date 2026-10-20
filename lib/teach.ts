/**
 * Shared helpers for the Teach Choreography feature. Lives in lib/ (not a route
 * file) so both /api/teach and /api/teach/upvote can import it — route files are
 * only allowed to export route handlers, so shared code can't live in one.
 */

import { prisma } from "@/lib/prisma";

export const UPVOTE_BONUS_THRESHOLD = 10; // ">10 unique users" unlocks the bonus
export const UPLOAD_POINTS = 10;
export const BONUS_POINTS = 100;

let ready = false;
export async function ensureTeachTables() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeachClip" (
      "id"            TEXT PRIMARY KEY,
      "userId"        TEXT NOT NULL,
      "userName"      TEXT,
      "videoId"       TEXT NOT NULL,
      "title"         TEXT NOT NULL,
      "artist"        TEXT,
      "city"          TEXT,
      "status"        TEXT NOT NULL DEFAULT 'live',
      "bonusAwarded"  BOOLEAN NOT NULL DEFAULT false,
      "createdAt"     TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TeachClip_status_created_idx" ON "TeachClip" ("status","createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TeachClip_user_video_key" ON "TeachClip" ("userId","videoId")`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeachClipVote" (
      "id"         TEXT PRIMARY KEY,
      "clipId"     TEXT NOT NULL,
      "userId"     TEXT NOT NULL,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TeachClipVote_clip_user_key" ON "TeachClipVote" ("clipId","userId")`);
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
  await prisma.$executeRawUnsafe("DO $$ BEGIN IF to_regprocedure('aegyo_install_account_guard(text,text)') IS NOT NULL THEN PERFORM aegyo_install_account_guard('TeachClip','userId'); END IF; END $$");
  await prisma.$executeRawUnsafe("DO $$ BEGIN IF to_regprocedure('aegyo_install_account_guard(text,text)') IS NOT NULL THEN PERFORM aegyo_install_account_guard('TeachClipVote','userId'); END IF; END $$");
  await prisma.$executeRawUnsafe("DO $$ BEGIN IF to_regprocedure('aegyo_install_account_guard(text,text)') IS NOT NULL THEN PERFORM aegyo_install_account_guard('PointsEvent','userId'); END IF; END $$");
  ready = true;
}

// Pull the 11-char video id out of any common YouTube URL form.
export function youtubeId(raw: string): string | null {
  const s = (raw || "").trim();
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/) ||
            s.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}
