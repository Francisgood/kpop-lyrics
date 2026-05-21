"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  entityType: string;
  entityId: string;
  isLoggedIn: boolean;
  initialFavorited?: boolean;
}

export default function FavoriteButton({ entityType, entityId, isLoggedIn, initialFavorited = false }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId }),
      });
      if (res.ok) {
        const d = await res.json();
        setFavorited(d.favorited);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <Link href="/login" style={{ textDecoration: "none" }}>
        <button style={{ background: "#f8f8f8", border: "1px solid var(--genius-border)", borderRadius: 999, padding: "6px 14px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", color: "var(--genius-gray)", display: "flex", alignItems: "center", gap: 5 }}>
          ♡ Save
        </button>
      </Link>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        background: favorited ? "var(--genius-yellow)" : "#f8f8f8",
        border: `1px solid ${favorited ? "var(--genius-yellow)" : "var(--genius-border)"}`,
        borderRadius: 999,
        padding: "6px 14px",
        fontSize: "0.78rem",
        fontWeight: 700,
        cursor: "pointer",
        color: "#000",
        display: "flex",
        alignItems: "center",
        gap: 5,
        opacity: loading ? 0.6 : 1,
        transition: "all 0.15s",
      }}
    >
      {favorited ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
