// PC Index — market context. Maps the K-pop photocard market against the broader
// ~$9B trading-card market and its big segments (Pokémon, sports, Magic). Client-safe
// constants + helpers; the charts live in components/MarketCharts.tsx.
//
// SOURCING: Pokémon / MTG / K-pop annual figures are the client's researched numbers
// (K-pop = $0.3B/$0.5B/$0.7B = $300M/$500M/$700M). Sports + the ~$9B total are filled
// from market-report research. Annual figures are estimates from trade reports; the
// per-month / per-group splits are MODELED and labeled as such on the page.

export const MARKET_YEARS = [2024, 2025, 2026] as const;

export type Trend = "rising" | "flat" | "cooling";

export type MarketSegment = {
  key: string;
  label: string;
  color: string;
  annualB: (number | null)[]; // USD billions, aligned to MARKET_YEARS
  trend12mo: Trend;
  note: string;
  toggleable: boolean; // K-pop is always shown; the reference markets toggle
};

// Ordered biggest → smallest (2026). K-pop last (always-on focus).
export const CARD_SEGMENTS: MarketSegment[] = [
  { key: "pokemon", label: "Pokémon", color: "#4aa3ff", annualB: [2.1, 2.9, 3.3], trend12mo: "rising", note: "Biggest card segment, booming: ~$2B cards (2024), StockX resale +367% YoY, values +28% in 2025 (beat the S&P).", toggleable: true },
  { key: "sports", label: "Sports cards", color: "#ffd479", annualB: [4.5, 4.4, 4.3], trend12mo: "cooling", note: "Within the $9B card total, ~$4–4.5B; flat/cooling post-2021 bubble (broad retail+grading definition runs ~$13B — a different universe).", toggleable: true },
  { key: "mtg", label: "Magic: The Gathering", color: "#ff8a5c", annualB: [1.3, 1.7, 1.9], trend12mo: "rising", note: "Booming — $1.7B FY2025, +59% YoY on Universes Beyond (Final Fantasy = best-selling set ever).", toggleable: true },
  { key: "kpop", label: "K-pop photocards", color: "#ff6fa8", annualB: [0.3, 0.5, 0.7], trend12mo: "rising", note: "Smallest in absolute terms but the fastest-growing — +133% 2024→2026.", toggleable: false },
];

// The ~$9B all-trading-cards total (client anchor). Filled/confirmed from research.
export const TOTAL_CARD_MARKET_B: number[] = [9.0, 9.9, 10.9]; // Intel MR "collectible trading cards": $8.998B 2024 → $9.892B 2025, ~10.8% CAGR

export function segByKey(key: string): MarketSegment | undefined {
  return CARD_SEGMENTS.find((s) => s.key === key);
}

export function latestAnnualB(s: MarketSegment): number | null {
  for (let i = s.annualB.length - 1; i >= 0; i--) if (s.annualB[i] != null) return s.annualB[i];
  return null;
}

// K-pop photocard market (the $700M anchor) + modeled per-group shares of it. The
// tracked-member figures on /pc-index are a small sample; these shares represent each
// group's TOTAL photocard footprint (all members, all platforms) — modeled estimates.
export const KPOP_MARKET_USD = 700_000_000;
export const KPOP_GROUP_SHARE: { slug: string; name: string; color: string; share: number }[] = [
  { slug: "bts", name: "BTS", color: "#9b8cff", share: 0.16 }, // dominant photocard group (huge back catalogue + 2026 comeback)
  { slug: "aespa", name: "aespa", color: "#ff7ab8", share: 0.05 },
  { slug: "le-sserafim", name: "LE SSERAFIM", color: "#4aa3ff", share: 0.035 },
];

// K-pop album exports by quarter, $M (client research — a growth proxy for photocards;
// 2025 quarters back-calculated from reported growth, so approximate).
export const KPOP_ALBUM_EXPORTS: { q: string; usdM: number }[] = [
  { q: "Q1 '25", usdM: 45 },
  { q: "Q2 '25", usdM: 67 },
  { q: "Q1 '26", usdM: 120 },
  { q: "Q2 '26", usdM: 137 },
];

export function bUsd(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  if (n >= 1) return "$" + n.toFixed(n >= 10 ? 0 : 1).replace(/\.0$/, "") + "B";
  return "$" + Math.round(n * 1000) + "M";
}
