/**
 * lib/cache.ts
 *
 * Persistent in-memory TTL cache for the Railway process.
 * Because Railway runs a single long-lived Node.js server (not serverless
 * lambdas), module-level state is safe and far cheaper than hitting SQLite
 * on every request.
 *
 * TTL strategy:
 *   Trending / homepage   — 5 min   (view counts change frequently)
 *   Song pages            — 10 min  (lyrics never change; views updated async)
 *   Artist / album pages  — 60 min  (stable data, refreshed on deploy)
 *   Dictionary / define   — 24 h    (extremely stable)
 */

type Entry<T> = { data: T; expires: number };

const store = new Map<string, Entry<unknown>>();

export function memGet<T>(key: string): T | null {
  const entry = store.get(key) as Entry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expires) { store.delete(key); return null; }
  return entry.data;
}

export function memSet<T>(key: string, data: T, ttlMs: number): T {
  store.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

/** Wrap any async getter with transparent TTL memoisation. */
export function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = memGet<T>(key);
  if (hit !== null) return Promise.resolve(hit);
  return fetcher().then(data => memSet(key, data, ttlMs));
}

// ── Convenience TTLs ──────────────────────────────────────────────────────────
export const TTL = {
  trending:  5  * 60_000,   // 5 min
  song:      10 * 60_000,   // 10 min
  artist:    60 * 60_000,   // 1 h
  define:    24 * 60 * 60_000, // 24 h
} as const;
