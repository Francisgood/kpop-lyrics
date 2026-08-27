"use client";

// PC Index — market-context charts. (1) K-pop photocards mapped against the ~$9B
// trading-card market with Pokémon / Sports / MTG reference lines you can toggle;
// (2) the K-pop photocard market over the trailing 12 months (all K-pop + BTS / LSF /
// aespa, modeled); (3) K-pop album exports as a growth proxy. Built from the client's
// research references. Annual figures are from trade reports; monthly/per-group splits
// are MODELED and labeled as such.
import { useState } from "react";
import { monthlySeries, BACKDATE_MONTHS, ymLabel } from "@/lib/pc-backdating";
import {
  CARD_SEGMENTS, MARKET_YEARS, TOTAL_CARD_MARKET_B, KPOP_MARKET_USD, KPOP_GROUP_SHARE,
  KPOP_ALBUM_EXPORTS, bUsd, type MarketSegment,
} from "@/lib/pc-market-context";

const ACCENT = "#ff6fa8";
const TREND_ICON: Record<string, string> = { rising: "▲", flat: "▬", cooling: "▼" };
const TREND_COLOR: Record<string, string> = { rising: "#22e06b", flat: "var(--ink-faint)", cooling: "#ff8a8a" };

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--bg-card, #14101c)", padding: "18px 18px 16px", marginBottom: 20 }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 800, color: "var(--ink)" }}>{title}</div>
      {sub && <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", marginTop: 3, marginBottom: 14, lineHeight: 1.5 }}>{sub}</div>}
      {children}
    </div>
  );
}

// ── Chart 1: K-pop vs the trading-card market, with toggleable references ──────
function MarketComparisonChart() {
  const [on, setOn] = useState<Record<string, boolean>>({ pokemon: true, sports: true, mtg: true });
  const enabled = CARD_SEGMENTS.filter((s) => !s.toggleable || on[s.key]);
  const maxB = Math.max(...enabled.flatMap((s) => s.annualB.filter((v): v is number => v != null)), 1);
  const totalNow = TOTAL_CARD_MARKET_B[TOTAL_CARD_MARKET_B.length - 1];
  const kpop = CARD_SEGMENTS.find((s) => s.key === "kpop")!;
  const kpopNow = kpop.annualB[kpop.annualB.length - 1] ?? 0;

  // share-of-total (latest year), K-pop highlighted; "others" fills the residual
  const shareSegs = CARD_SEGMENTS.map((s) => ({ key: s.key, label: s.label, color: s.color, b: s.annualB[s.annualB.length - 1] ?? 0 }));
  const shareSum = shareSegs.reduce((a, x) => a + x.b, 0);
  const others = Math.max(0, totalNow - shareSum);

  return (
    <Panel title="K-pop photocards vs. the trading-card market" sub={`Annual sales, USD billions. Toggle the reference markets. K-pop sits inside a ~${bUsd(totalNow)} global card market (2026).`}>
      {/* toggle chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {CARD_SEGMENTS.filter((s) => s.toggleable).map((s) => (
          <button key={s.key} onClick={() => setOn((o) => ({ ...o, [s.key]: !o[s.key] }))}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${on[s.key] ? s.color : "var(--border)"}`, background: on[s.key] ? `${s.color}22` : "transparent",
              color: on[s.key] ? "var(--ink)" : "var(--ink-faint)", fontSize: "0.74rem", fontWeight: 700 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: on[s.key] ? s.color : "var(--ink-faint)" }} />
            {s.label}
            <span style={{ color: TREND_COLOR[s.trend12mo], fontSize: "0.6rem" }}>{TREND_ICON[s.trend12mo]}</span>
          </button>
        ))}
        <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, border: `1px solid ${ACCENT}`, background: `${ACCENT}22`, color: "var(--ink)", fontSize: "0.74rem", fontWeight: 800 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: ACCENT }} />K-pop photocards <span style={{ color: "var(--ink-faint)", fontWeight: 600, fontSize: "0.62rem" }}>always on</span>
        </span>
      </div>

      {/* grouped bars by year */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 190, paddingBottom: 18, textAlign: "right", fontSize: "0.56rem", color: "var(--ink-faint)", minWidth: 26 }}>
          {[maxB, maxB * 0.75, maxB * 0.5, maxB * 0.25, 0].map((v, i) => <span key={i}>{bUsd(v)}</span>)}
        </div>
        <div style={{ flex: 1, display: "flex", gap: 10, alignItems: "flex-end" }}>
          {MARKET_YEARS.map((yr, yi) => (
            <div key={yr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 172, width: "100%", justifyContent: "center" }}>
                {enabled.map((s) => {
                  const v = s.annualB[yi];
                  const h = v != null ? Math.max(2, (v / maxB) * 100) : 0;
                  return (
                    <div key={s.key} title={`${s.label} ${yr}: ${bUsd(v)}`} style={{ flex: 1, maxWidth: 34, height: `${h}%`, background: s.color, borderRadius: "3px 3px 0 0", opacity: s.key === "kpop" ? 1 : 0.85, position: "relative" }}>
                      {s.key === "kpop" && v != null && <span style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: "0.52rem", fontWeight: 800, color: ACCENT, whiteSpace: "nowrap" }}>{bUsd(v)}</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: "0.66rem", color: "var(--ink-dim)", marginTop: 6, fontWeight: 700 }}>{yr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* share of the total card market (latest year) */}
      <div style={{ marginTop: 18, fontSize: "0.6rem", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        Share of the ~{bUsd(totalNow)} card market · 2026
      </div>
      <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
        {shareSegs.map((s) => (
          <div key={s.key} title={`${s.label}: ${bUsd(s.b)} (${Math.round((s.b / totalNow) * 100)}%)`}
            style={{ width: `${(s.b / totalNow) * 100}%`, background: s.color, opacity: s.key === "kpop" ? 1 : 0.55, borderRight: "1px solid rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 800, color: "#0a0a0a" }}>
            {s.key === "kpop" ? `K-pop ${Math.round((s.b / totalNow) * 100)}%` : ""}
          </div>
        ))}
        <div title={`Yu-Gi-Oh & others: ${bUsd(others)}`} style={{ width: `${(others / totalNow) * 100}%`, background: "#5b5570", opacity: 0.5 }} />
      </div>

      <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 10, background: `${ACCENT}12`, border: `1px solid ${ACCENT}33`, fontSize: "0.78rem", color: "var(--ink-dim)", lineHeight: 1.55 }}>
        <b style={{ color: ACCENT }}>K-pop is the smallest single segment (~{Math.round((kpopNow / totalNow) * 100)}% of the card market) but the fastest-growing</b> — +133% since 2024, vs Pokémon +57% and Magic +46%. Pokémon &amp; Magic are booming; sports has cooled off its 2021 peak.
      </div>
      <div style={{ marginTop: 8, fontSize: "0.66rem", color: "var(--ink-faint)", lineHeight: 1.5 }}>
        Annual figures from trade reports (Intel Market Research, Hasbro, GM Insights). Sports shown at its within-$9B-total figure (~$4–4.5B); its broad retail+grading definition runs ~$13B — a different universe. K-pop ~$700M is an estimate (no single authoritative figure).
      </div>
    </Panel>
  );
}

// ── Chart 2: K-pop photocard market, trailing 12 months (log scale) ───────────
const LOG_MIN = 1e6, LOG_MAX = 1e8; // $1M … $100M
function logY(v: number): number {
  const c = Math.max(LOG_MIN, Math.min(LOG_MAX, v));
  return ((Math.log10(c) - Math.log10(LOG_MIN)) / (Math.log10(LOG_MAX) - Math.log10(LOG_MIN))) * 100;
}
function KpopMarketTrend() {
  // all K-pop: $700M spread over 12 months on a gently rising shape (the market is growing)
  const wAll = BACKDATE_MONTHS.map((_, i) => 1 + i * 0.03);
  const sumAll = wAll.reduce((a, b) => a + b, 0);
  const allKpop = wAll.map((w) => (KPOP_MARKET_USD * w) / sumAll);
  const groups = KPOP_GROUP_SHARE.map((g) => ({
    ...g,
    monthly: monthlySeries(g.slug, KPOP_MARKET_USD * g.share).map((p) => p.volumeUsd),
  }));
  const lines = [
    { name: "All K-pop", color: ACCENT, monthly: allKpop, dash: true },
    ...groups.map((g) => ({ name: g.name, color: g.color, monthly: g.monthly, dash: false })),
  ];
  const gridVals = [1e6, 1e7, 1e8];

  return (
    <Panel title="K-pop photocard market — trailing 12 months" sub="Modeled monthly volume (log scale): the whole K-pop market vs. BTS, aespa and LE SSERAFIM. Comeback months spike each group; the market total rises gently.">
      <div style={{ display: "flex", gap: 7 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 170, paddingBottom: 16, textAlign: "right", fontSize: "0.55rem", color: "var(--ink-faint)", minWidth: 30 }}>
          {[...gridVals].reverse().map((v) => <span key={v}>{bUsd(v / 1e9)}</span>)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height={170} style={{ display: "block", overflow: "visible" }}>
            {gridVals.map((v) => (
              <line key={v} x1="0" x2="100" y1={100 - logY(v)} y2={100 - logY(v)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="1.5 2" opacity={0.5} vectorEffect="non-scaling-stroke" />
            ))}
            {lines.map((ln) => {
              const d = ln.monthly.map((v, i) => `${i === 0 ? "M" : "L"} ${((i / 11) * 100).toFixed(1)} ${(100 - logY(v)).toFixed(1)}`).join(" ");
              return <path key={ln.name} d={d} fill="none" stroke={ln.color} strokeWidth={ln.dash ? 2.5 : 2} strokeDasharray={ln.dash ? "3 2" : undefined} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.5rem", color: "var(--ink-faint)", marginTop: 3 }}>
            {BACKDATE_MONTHS.map((ym, i) => <span key={ym}>{i % 2 === 0 ? ymLabel(ym).split(" ")[0] : ""}</span>)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 12 }}>
        {lines.map((ln) => (
          <span key={ln.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--ink-dim)" }}>
            <span style={{ width: 14, height: 0, borderTop: `3px ${ln.dash ? "dashed" : "solid"} ${ln.color}` }} />{ln.name}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: "0.66rem", color: "var(--ink-faint)", lineHeight: 1.5 }}>
        Modeled: the $700M K-pop total and each group&apos;s share (BTS ~16%, aespa ~5%, LE SSERAFIM ~3.5% — the dominant photocard groups) distributed across the year by real comeback activity. Directional, not exact.
      </div>
    </Panel>
  );
}

// ── Chart 3: K-pop album exports (growth proxy) ───────────────────────────────
function AlbumExportsChart() {
  const max = Math.max(...KPOP_ALBUM_EXPORTS.map((q) => q.usdM), 1);
  return (
    <Panel title="K-pop album exports by quarter — a growth proxy" sub="Album exports ($M) track the same fandom demand that drives photocards. Roughly tripled in a year — the tailwind under the whole photocard market.">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150, padding: "0 6px" }}>
        {KPOP_ALBUM_EXPORTS.map((q) => (
          <div key={q.q} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>${q.usdM}M</div>
            <div style={{ width: "100%", maxWidth: 54, height: `${(q.usdM / max) * 100}%`, background: `linear-gradient(180deg, ${ACCENT}, #9b8cff)`, borderRadius: "5px 5px 0 0" }} />
            <div style={{ fontSize: "0.64rem", color: "var(--ink-dim)", marginTop: 6 }}>{q.q}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: "0.66rem", color: "var(--ink-faint)", lineHeight: 1.5 }}>
        Client research; 2025 quarters back-calculated from reported growth rates (approximate). Album exports are a leading indicator for photocard demand — pre-order benefits and lucky-draw cards ship with the albums.
      </div>
    </Panel>
  );
}

export default function MarketContextCharts() {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 4px" }}>
        Market health <span style={{ color: ACCENT }}>·</span> the bigger picture
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--ink-faint)", margin: "0 0 18px" }}>
        Where the K-pop photocard market sits inside the ~$9B trading-card world, and how it&apos;s trending.
      </p>
      <MarketComparisonChart />
      <KpopMarketTrend />
      <AlbumExportsChart />
    </section>
  );
}
