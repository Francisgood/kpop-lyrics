import Link from "next/link";
import { CONTRIBUTORS, CITY_TOTALS, type City } from "./data";

export const metadata = { title: "Daebak Leaderboard — Top Contributors | Aegyo Arena" };

const CITIES: City[] = ["Mexico City", "New York", "Paris"];

const CITY_META: Record<City, { flag: string; color: string; accent: string; description: string }> = {
  "Mexico City": { flag: "🇲🇽", color: "#16a34a", accent: "#dcfce7", description: "CDMX ARMYs and Blinks lead the global chart" },
  "New York":    { flag: "🇺🇸", color: "#2563eb", accent: "#dbeafe", description: "Brooklyn stans and NYC K-indie pioneers" },
  "Paris":       { flag: "🇫🇷", color: "#9333ea", accent: "#f3e8ff", description: "La Défense ARMYs and Paris K-indie scene" },
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: cityParam } = await searchParams;
  const activeCity = CITIES.find((c) => c.toLowerCase().replace(" ", "-") === cityParam) ?? null;
  const filtered   = activeCity ? CONTRIBUTORS.filter((c) => c.city === activeCity) : CONTRIBUTORS;
  const top3       = CONTRIBUTORS.slice(0, 3);

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 55%, #0f3460 100%)", color: "#fff", padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / Leaderboard"}
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 10px", lineHeight: 1.1 }}>
            ★ Daebak <span style={{ color: "var(--genius-yellow)" }}>Leaderboard</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: 560, lineHeight: 1.7, margin: "0 0 32px" }}>
            The top 30 contributors fueling the K-pop wiki — from Mexico City ARMYs to Paris K-indie stans to NYC Blinks.
            Every annotation, edit, and comment earns Daebak Points.
          </p>

          {/* City totals strip */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {CITIES.map((city) => {
              const meta = CITY_META[city];
              const data = CITY_TOTALS[city];
              return (
                <div key={city} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 20px", flex: "1 1 180px" }}>
                  <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{meta.flag} {city}</div>
                  <div style={{ fontWeight: 800, color: "var(--genius-yellow)", fontSize: "1.3rem" }}>
                    {data.totalPoints.toLocaleString()} pts
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {data.contributors} contributors · top song: {data.topSong}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Top 3 Podium ─────────────────────────────────────────────────── */}
      <section style={{ background: "#0f0f0f", padding: "48px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--genius-yellow)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
            Hall of Fame
          </div>
          {/* Podium: #2 left, #1 center, #3 right */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-end", flexWrap: "wrap" }}>
            {/* 2nd place */}
            <PodiumCard c={top3[1]} medal="🥈" height={120} />
            {/* 1st place */}
            <PodiumCard c={top3[0]} medal="🥇" height={160} featured />
            {/* 3rd place */}
            <PodiumCard c={top3[2]} medal="🥉" height={100} />
          </div>
        </div>
      </section>

      {/* ── City filter tabs ─────────────────────────────────────────────── */}
      <div style={{ background: "#111", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 52, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
          <FilterTab label="All 30" href="/leaderboard" active={!activeCity} />
          {CITIES.map((city) => (
            <FilterTab
              key={city}
              label={`${CITY_META[city].flag} ${city}`}
              href={`/leaderboard?city=${city.toLowerCase().replace(" ", "-")}`}
              active={activeCity === city}
            />
          ))}
        </div>
      </div>

      {/* ── Leaderboard table ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* City context banner when filtered */}
        {activeCity && (
          <div style={{ background: CITY_META[activeCity].accent, border: `1px solid ${CITY_META[activeCity].color}33`, borderRadius: 8, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.6rem" }}>{CITY_META[activeCity].flag}</span>
            <div>
              <div style={{ fontWeight: 800, color: CITY_META[activeCity].color, fontSize: "0.95rem" }}>{activeCity}</div>
              <div style={{ fontSize: "0.78rem", color: "#444" }}>{CITY_META[activeCity].description}</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontWeight: 800, color: CITY_META[activeCity].color }}>{CITY_TOTALS[activeCity].totalPoints.toLocaleString()} pts</div>
              <div style={{ fontSize: "0.72rem", color: "#666" }}>city total</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c, i) => (
            <div
              key={c.username}
              style={{
                background:   i < 3 && !activeCity ? "linear-gradient(90deg, #111 0%, #1a1400 100%)" : "#fff",
                border:       `1px solid ${i < 3 && !activeCity ? "rgba(255,215,0,0.15)" : "var(--genius-border)"}`,
                borderRadius: 8,
                padding:      "16px 20px",
                display:      "flex",
                alignItems:   "center",
                gap:          16,
                flexWrap:     "wrap",
              }}
            >
              {/* Rank */}
              <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
                {c.rank === 1 ? <span style={{ fontSize: "1.4rem" }}>🥇</span>
                  : c.rank === 2 ? <span style={{ fontSize: "1.4rem" }}>🥈</span>
                  : c.rank === 3 ? <span style={{ fontSize: "1.4rem" }}>🥉</span>
                  : <span style={{ fontWeight: 800, fontSize: "1.1rem", color: i < 3 && !activeCity ? "rgba(255,215,0,0.5)" : "var(--genius-gray)" }}>#{c.rank}</span>
                }
              </div>

              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${c.tierColor}, ${c.tierColor}88)`,
                color: "#fff", fontWeight: 900, fontSize: "1.1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {c.initial}
              </div>

              {/* Name + city + focus */}
              <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: i < 3 && !activeCity ? "#fff" : "#111" }}>
                    {c.username}
                  </span>
                  <span style={{ fontSize: "0.68rem", background: `${c.tierColor}22`, color: c.tierColor, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {c.tier}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: i < 3 && !activeCity ? "rgba(255,255,255,0.45)" : "var(--genius-gray)", marginTop: 3, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span>{c.flag} {c.city}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ background: "#f1f5f9", color: "#475569", padding: "1px 7px", borderRadius: 4, fontSize: "0.68rem", fontWeight: 600 }}>
                    {c.focusTag}
                  </span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>since {c.joinedMonth}</span>
                </div>
              </div>

              {/* Recent activity */}
              <div style={{ flex: "2 1 260px", minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", color: i < 3 && !activeCity ? "rgba(255,255,255,0.6)" : "#444", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.recentAct}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 14, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
                {[
                  { label: "annot.", value: c.annotations },
                  { label: "edits",  value: c.edits },
                  { label: "cmts",   value: c.comments },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.9rem", color: i < 3 && !activeCity ? "rgba(255,215,0,0.8)" : "#111" }}>{value}</div>
                    <div style={{ fontSize: "0.62rem", color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Points */}
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 90 }}>
                <div style={{ fontWeight: 900, fontSize: "1.2rem", color: c.rank <= 3 ? "#fbbf24" : c.tierColor }}>
                  {c.points.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.08em" }}>pts</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 40, textAlign: "center", padding: "32px 0", borderTop: "1px solid var(--genius-border)" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            Want to appear on this leaderboard?
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" className="btn-yellow" style={{ fontSize: "0.9rem", padding: "12px 28px" }}>
              START EARNING POINTS →
            </Link>
            <Link href="/dashboard" style={{ fontSize: "0.9rem", padding: "12px 20px", color: "var(--genius-gray)", textDecoration: "none", border: "1px solid var(--genius-border)", borderRadius: 4 }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PodiumCard({
  c, medal, height, featured = false,
}: {
  c: import("./data").Contributor;
  medal: string;
  height: number;
  featured?: boolean;
}) {
  return (
    <div style={{ flex: "1 1 200px", maxWidth: 280, textAlign: "center" }}>
      <div style={{ marginBottom: 12, fontSize: "2rem" }}>{medal}</div>
      {/* Avatar */}
      <div style={{
        width: featured ? 80 : 64, height: featured ? 80 : 64, borderRadius: "50%",
        background: `linear-gradient(135deg, ${c.tierColor}, ${c.tierColor}99)`,
        color: "#fff", fontWeight: 900, fontSize: featured ? "2rem" : "1.5rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 10px",
        boxShadow: featured ? `0 0 0 4px ${c.tierColor}44, 0 8px 32px ${c.tierColor}33` : "none",
      }}>
        {c.initial}
      </div>
      <div style={{ fontWeight: 800, color: "#fff", fontSize: featured ? "1rem" : "0.88rem", marginBottom: 4 }}>{c.username}</div>
      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{c.flag} {c.city}</div>
      {/* Podium bar */}
      <div style={{
        height, background: `linear-gradient(180deg, ${c.tierColor}44 0%, ${c.tierColor}11 100%)`,
        border: `1px solid ${c.tierColor}44`, borderRadius: "6px 6px 0 0",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
      }}>
        <div style={{ fontWeight: 900, fontSize: featured ? "1.4rem" : "1.1rem", color: featured ? "#fbbf24" : c.tierColor }}>
          {c.points.toLocaleString()}
        </div>
        <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>pts</div>
      </div>
    </div>
  );
}

function FilterTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        padding:        "14px 18px",
        fontSize:       "0.82rem",
        fontWeight:     active ? 700 : 500,
        color:          active ? "var(--genius-yellow)" : "rgba(255,255,255,0.45)",
        textDecoration: "none",
        borderBottom:   active ? "2px solid var(--genius-yellow)" : "2px solid transparent",
        whiteSpace:     "nowrap",
        transition:     "color 0.15s",
      }}
    >
      {label}
    </Link>
  );
}
