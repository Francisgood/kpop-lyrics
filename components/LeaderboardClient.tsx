"use client";

import { useState } from "react";
import Link from "next/link";
import type { Contributor, City } from "@/app/leaderboard/data";

const TABS: { key: "All" | City; label: string; flag: string }[] = [
  { key: "All", label: "All Cities", flag: "🌐" },
  { key: "Mexico City", label: "Mexico City", flag: "🇲🇽" },
  { key: "New York", label: "New York", flag: "🇺🇸" },
  { key: "Paris", label: "Paris", flag: "🇫🇷" },
];

const fmt = (n: number) => n.toLocaleString("en-US");
const MEDALS = ["#ffd35c", "#cdd3dc", "#e0a06b"]; // gold · silver · bronze

function Avatar({ c, size, ring }: { c: Contributor; size: number; ring?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: c.tierColor, color: "#fff", fontWeight: 800, fontSize: size * 0.42, border: ring ? `3px solid ${ring}` : "none" }}>
      {c.initial}
    </span>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span style={{ textAlign: "right", minWidth: 56 }}>
      <span style={{ display: "block", fontWeight: 800, fontSize: accent ? "1.05rem" : "0.92rem", color: accent ? "var(--sakura)" : "var(--ink)" }}>{value}</span>
      <span style={{ display: "block", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-faint)" }}>{label}</span>
    </span>
  );
}

export default function LeaderboardClient({ contributors }: { contributors: Contributor[] }) {
  const [city, setCity] = useState<"All" | City>("All");

  const ranked = (city === "All" ? contributors : contributors.filter((c) => c.city === city))
    .slice()
    .sort((a, b) => b.points - a.points)
    .map((c, i) => ({ ...c, displayRank: i + 1 }));

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) as (Contributor & { displayRank: number })[];

  const totals = {
    players: ranked.length,
    points: ranked.reduce((s, c) => s + c.points, 0),
    annotations: ranked.reduce((s, c) => s + c.annotations, 0),
  };

  return (
    <main style={{ padding: "0 0 80px" }}>
      {/* Header */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "48px 24px 34px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 12 }}>Community Leaderboard</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,6vw,3.2rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.05 }}>Top Contributors</h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 580, margin: 0 }}>
            The fans shaping the wiki — ranked by points earned from annotations, edits, and community love.
          </p>
          <div style={{ display: "flex", gap: 32, marginTop: 24, flexWrap: "wrap" }}>
            {([["Players", fmt(totals.players)], ["Total Points", fmt(totals.points)], ["Annotations", fmt(totals.annotations)]] as const).map(([label, val]) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)" }}>{val}</div>
                <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-faint)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        {/* City tabs */}
        <div style={{ display: "flex", gap: 8, margin: "26px 0", flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const active = city === t.key;
            return (
              <button key={t.key} type="button" onClick={() => setCity(t.key)}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 100, cursor: "pointer",
                  border: active ? "1px solid var(--sakura)" : "1px solid var(--border)",
                  background: active ? "var(--sakura)" : "var(--bg-card)",
                  color: active ? "var(--on-accent)" : "var(--ink-dim)", fontWeight: 700, fontSize: "0.85rem" }}>
                <span>{t.flag}</span>{t.label}
              </button>
            );
          })}
        </div>

        {/* Podium (top 3) */}
        {podiumOrder.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${podiumOrder.length}, 1fr)`, gap: 14, alignItems: "end", marginBottom: 30 }}>
            {podiumOrder.map((c) => {
              const place = c.displayRank;
              const medal = MEDALS[place - 1] ?? "var(--border-strong)";
              const first = place === 1;
              return (
                <Link key={c.slug} href={`/u/${c.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "var(--bg-card)", border: `1px solid ${first ? "var(--sakura)" : "var(--border)"}`, borderTop: `3px solid ${medal}`, borderRadius: 16, padding: first ? "24px 14px 20px" : "18px 12px 16px", textAlign: "center", transform: first ? "translateY(-10px)" : "none", boxShadow: first ? "0 18px 48px rgba(0,0,0,0.32)" : "none" }}>
                    <div style={{ fontSize: "1.05rem", marginBottom: 6 }}>{place === 1 ? "👑" : place === 2 ? "🥈" : "🥉"}</div>
                    <div style={{ display: "grid", placeItems: "center", marginBottom: 10 }}><Avatar c={c} size={first ? 70 : 56} ring={medal} /></div>
                    <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: first ? "1rem" : "0.88rem", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.username}</div>
                    <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginBottom: 10 }}>{c.flag} {c.city}</div>
                    <div style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: first ? "1.7rem" : "1.35rem", color: "var(--sakura)", lineHeight: 1 }}>{fmt(c.points)}</div>
                    <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 10 }}>points</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: "0.72rem", color: "var(--ink-dim)" }}>
                      <span><strong style={{ color: "var(--ink)" }}>{c.annotations}</strong> ann.</span>
                      <span><strong style={{ color: "var(--ink)" }}>{fmt(c.followers)}</strong> followers</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Ranked rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rest.map((c) => (
            <Link key={c.slug} href={`/u/${c.slug}`}
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 18px" }}>
              <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--ink-faint)", fontSize: "0.95rem", width: 26, textAlign: "center", flexShrink: 0 }}>{c.displayRank}</span>
              <Avatar c={c} size={40} />
              <span style={{ flex: "1 1 160px", minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.username}</span>
                <span style={{ display: "block", fontSize: "0.76rem", color: "var(--ink-faint)" }}>{c.flag} {c.city} · {c.tier}</span>
              </span>
              <span style={{ display: "flex", gap: 20, alignItems: "center", marginLeft: "auto" }}>
                <Stat label="Annotations" value={fmt(c.annotations)} />
                <Stat label="Followers" value={fmt(c.followers)} />
                <Stat label="Points" value={fmt(c.points)} accent />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
