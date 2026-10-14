/**
 * Client-side shared state for the slang deck ↔ practice-quiz adaptive loop.
 *
 * No auth, no server: everything lives in localStorage so the loop works for
 * everyone (the deck is deliberately anonymous) and stays in sync between the
 * memory deck and the quiz, which are same-origin pages.
 *
 *   SAVED_KEY  — slugs the user swiped right ("My Deck") — the cards they pick up.
 *   REVIEW_KEY — slugs they missed in the quiz → surfaced first in the next deck round.
 */

export const SAVED_KEY = "aegyo_slang_saved";
export const REVIEW_KEY = "aegyo_slang_review";

function read(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, slugs: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(slugs));
  } catch {
    /* private mode / blocked storage — the loop just won't persist */
  }
}

export const readSaved = () => read(SAVED_KEY);
export const readReview = () => read(REVIEW_KEY);

/** Union the missed slugs into the review set (dedup, preserves existing). */
export function addToReview(slugs: string[]) {
  if (!slugs.length) return;
  const set = new Set(read(REVIEW_KEY));
  for (const s of slugs) set.add(s);
  write(REVIEW_KEY, [...set]);
}

/** Drop a slug from the review set once it's been re-practiced in the deck. */
export function clearFromReview(slug: string) {
  const cur = read(REVIEW_KEY);
  if (!cur.includes(slug)) return;
  write(
    REVIEW_KEY,
    cur.filter((s) => s !== slug),
  );
}
