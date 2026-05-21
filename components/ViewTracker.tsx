"use client";
/**
 * ViewTracker — fires a view event once per song per 2-hour window.
 * Uses localStorage so the same browser session doesn't inflate counts.
 * Renders nothing visible.
 */
import { useEffect } from "react";

const TWO_HOURS = 2 * 60 * 60 * 1000;

export default function ViewTracker({ songId }: { songId: string }) {
  useEffect(() => {
    try {
      const key  = `view_${songId}`;
      const last = parseInt(localStorage.getItem(key) ?? "0", 10);
      if (Date.now() - last < TWO_HOURS) return;

      fetch("/api/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      })
        .then(() => localStorage.setItem(key, Date.now().toString()))
        .catch(() => null); // silent — never block the page
    } catch {
      // localStorage may be blocked in private browsing; just skip
    }
  }, [songId]);

  return null;
}
