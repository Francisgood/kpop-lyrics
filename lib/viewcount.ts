/**
 * lib/viewcount.ts
 *
 * Buffers view count increments and flushes them to SQLite in a single
 * batch every 30 seconds.  Also tracks per-song view velocity (views in
 * the current hour) so the UI can show 🔥 Trending badges without extra
 * DB reads.
 *
 * Safe for Railway's single persistent Node.js process.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pending increments to flush
const pending = new Map<string, number>();

// Hourly velocity: songId → { count, hour }
const velocity = new Map<string, { count: number; hour: number }>();

let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function recordView(songId: string): void {
  // Buffer the DB increment
  pending.set(songId, (pending.get(songId) ?? 0) + 1);

  // Track hourly velocity
  const hour = Math.floor(Date.now() / 3_600_000);
  const v    = velocity.get(songId) ?? { count: 0, hour };
  velocity.set(songId, {
    count: v.hour === hour ? v.count + 1 : 1,
    hour,
  });

  // Schedule flush (debounced — only one timer at a time)
  if (!flushTimer) {
    flushTimer = setTimeout(flush, 30_000);
  }
}

/** Views this song has received in the current clock hour. */
export function getVelocity(songId: string): number {
  const v = velocity.get(songId);
  if (!v) return 0;
  const hour = Math.floor(Date.now() / 3_600_000);
  return v.hour === hour ? v.count : 0;
}

/** Returns the top N hot songs by hourly velocity. */
export function getHotSongIds(n = 5): string[] {
  const hour = Math.floor(Date.now() / 3_600_000);
  return [...velocity.entries()]
    .filter(([, v]) => v.hour === hour)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, n)
    .map(([id]) => id);
}

async function flush(): Promise<void> {
  flushTimer = null;
  if (pending.size === 0) return;

  const batch = new Map(pending);
  pending.clear();

  await Promise.allSettled(
    [...batch.entries()].map(([id, count]) =>
      prisma.song.update({
        where: { id },
        data:  { viewCount: { increment: count } },
      })
    )
  );
}

// Flush on process exit so we don't drop buffered views on deploy
process.on("beforeExit", flush);
