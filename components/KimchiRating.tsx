"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  entityType: "song" | "artist";
  entityId: string;
  isLoggedIn: boolean;
  initialAvg?: number;
  initialCount?: number;
  initialUserRating?: number | null;
  /** true when rendered on the dark hero background */
  onDark?: boolean;
}

export default function KimchiRating({
  entityType,
  entityId,
  isLoggedIn,
  initialAvg = 0,
  initialCount = 0,
  initialUserRating = null,
  onDark = false,
}: Props) {
  const [avg, setAvg]               = useState(initialAvg);
  const [count, setCount]           = useState(initialCount);
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);
  const [hovered, setHovered]       = useState<number | null>(null);
  const [loading, setLoading]       = useState(false);

  async function rate(n: number) {
    if (!isLoggedIn || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, rating: n }),
      });
      if (res.ok) {
        const d = await res.json();
        setAvg(d.avg);
        setCount(d.count);
        setUserRating(d.userRating);
      }
    } finally {
      setLoading(false);
    }
  }

  // The displayed "active" threshold: hover preview > user's own rating > rounded avg
  const activeUpTo = hovered ?? userRating ?? (count > 0 ? Math.round(avg) : 0);

  const labelColor  = onDark ? "rgba(255,255,255,0.45)" : "var(--genius-gray)";
  const metaColor   = onDark ? "rgba(255,255,255,0.55)" : "var(--genius-gray)";
  const loginColor  = onDark ? "var(--genius-yellow)"   : "#0066cc";

  return (
    <div style={{ textAlign: "center" }}>
      {/* Section label */}
      <div style={{
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: labelColor,
        marginBottom: 6,
      }}>
        Kimchi Rating
      </div>

      {/* 5-icon row */}
      <div
        style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center" }}
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= activeUpTo;
          return (
            <button
              key={n}
              onClick={() => isLoggedIn ? rate(n) : undefined}
              onMouseEnter={() => isLoggedIn && setHovered(n)}
              aria-label={`Rate ${n} kimchi${n !== 1 ? "s" : ""}`}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: isLoggedIn ? (loading ? "wait" : "pointer") : "default",
                opacity: filled ? 1 : 0.22,
                filter: filled ? "none" : "grayscale(100%)",
                transform: hovered === n && isLoggedIn ? "scale(1.12)" : "scale(1)",
                transition: "all 0.14s ease",
                display: "block",
                lineHeight: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/kimchi-emoji.png"
                alt={`kimchi ${n}`}
                className="kimchi-icon"
                style={{ display: "block" }}
              />
            </button>
          );
        })}
      </div>

      {/* Avg + count */}
      <div style={{ marginTop: 7, fontSize: "0.72rem", color: metaColor, fontWeight: 600 }}>
        {count > 0
          ? `${avg.toFixed(1)} avg · ${count.toLocaleString()} rating${count !== 1 ? "s" : ""}`
          : "No ratings yet"}
      </div>

      {/* Login nudge for guests */}
      {!isLoggedIn && (
        <div style={{ marginTop: 4, fontSize: "0.67rem", color: metaColor }}>
          <Link href="/login" style={{ color: loginColor, textDecoration: "none", fontWeight: 600 }}>
            Log in to rate
          </Link>
        </div>
      )}

      {/* Confirmation of user's own vote */}
      {isLoggedIn && userRating && !hovered && (
        <div style={{ marginTop: 4, fontSize: "0.67rem", color: metaColor }}>
          Your rating: {userRating} kimchi{userRating !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
