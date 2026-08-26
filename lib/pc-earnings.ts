// PC Index — label earnings layer. Ties the fan-driven photocard index to the four
// publicly-traded K-pop labels, so the dashboard can frame photocard trading as a
// leading/coincident signal for label quarterly revenue.
//
// HONESTY: label revenue figures are REPORTED FACTS (company earnings). The
// photocard index is a MODELED fan-engagement signal, NOT a revenue component — it
// is a tiny fraction of revenue. We plot them together to show whether fan trading
// activity tracks the comeback cycle that drives earnings; we do not claim
// photocards ARE the earnings.

export type LabelKey = "HYBE" | "SM" | "JYP" | "YG";

export type Quarter = {
  q: string; // "2026-Q2"
  label: string; // "Q2 '26"
  revenueUsd: number | null;
  opProfitUsd: number | null;
};

export type LabelInfo = {
  key: LabelKey;
  name: string;
  color: string;
  ticker: string;
  trackedGroups: string[]; // groupSlugs we already track photocards for
  flagship: string[]; // notable acts (for coverage we could add)
  quarters: Quarter[]; // oldest → newest
};

// Which label each tracked group rolls up to (incl. HYBE sublabels).
export const GROUP_LABEL: Record<string, LabelKey> = {
  bts: "HYBE", // BigHit Music
  "le-sserafim": "HYBE", // Source Music
  aespa: "SM",
};

export function labelForGroup(groupSlug: string): LabelKey | null {
  return GROUP_LABEL[groupSlug] ?? null;
}

// Reported quarterly figures. Q2 2026 seeded from the client's reported numbers
// (HYBE $967M, SM $233M, JYP $122M, YG $85M — quarterly revenue, USD). Earlier
// quarters filled from research; null = not yet confirmed.
export const LABELS: LabelInfo[] = [
  // Quarterly CONSOLIDATED revenue + operating profit, USD (KRW @ ~1,500, mid-2026
  // spot). Reported results, cross-verified against FY/9M totals. Q2'26 = the
  // figures the client provided; HYBE's $967M is its first-ever >KRW 1T quarter
  // (+105.5% YoY) on the BTS World Tour ARIRANG.
  {
    key: "HYBE", name: "HYBE", color: "#9b8cff", ticker: "KRX:352820",
    trackedGroups: ["bts", "le-sserafim"],
    flagship: ["BTS", "LE SSERAFIM", "SEVENTEEN", "TXT", "ENHYPEN"],
    quarters: [
      { q: "2025-Q4", label: "Q4 '25", revenueUsd: 478_000_000, opProfitUsd: 3_000_000 },
      { q: "2026-Q1", label: "Q1 '26", revenueUsd: 466_000_000, opProfitUsd: -131_000_000 },
      { q: "2026-Q2", label: "Q2 '26", revenueUsd: 967_000_000, opProfitUsd: 114_000_000 },
    ],
  },
  {
    key: "SM", name: "SM Entertainment", color: "#4aa3ff", ticker: "KRX:041510",
    trackedGroups: ["aespa"],
    flagship: ["aespa", "NCT", "RIIZE", "Red Velvet"],
    quarters: [
      { q: "2025-Q4", label: "Q4 '25", revenueUsd: 213_000_000, opProfitUsd: 36_000_000 },
      { q: "2026-Q1", label: "Q1 '26", revenueUsd: 186_000_000, opProfitUsd: 26_000_000 },
      { q: "2026-Q2", label: "Q2 '26", revenueUsd: 233_000_000, opProfitUsd: 35_000_000 },
    ],
  },
  {
    key: "JYP", name: "JYP Entertainment", color: "#8affc1", ticker: "KRX:035900",
    trackedGroups: [],
    flagship: ["Stray Kids", "TWICE", "ITZY", "NMIXX"],
    quarters: [
      { q: "2025-Q4", label: "Q4 '25", revenueUsd: 155_000_000, opProfitUsd: 28_000_000 },
      { q: "2026-Q1", label: "Q1 '26", revenueUsd: 124_000_000, opProfitUsd: 22_000_000 },
      { q: "2026-Q2", label: "Q2 '26", revenueUsd: 122_000_000, opProfitUsd: 21_000_000 },
    ],
  },
  {
    key: "YG", name: "YG Entertainment", color: "#ffd479", ticker: "KRX:122870",
    trackedGroups: [],
    flagship: ["BLACKPINK", "BABYMONSTER", "TREASURE"],
    quarters: [
      { q: "2025-Q4", label: "Q4 '25", revenueUsd: 115_000_000, opProfitUsd: 15_000_000 },
      { q: "2026-Q1", label: "Q1 '26", revenueUsd: 98_000_000, opProfitUsd: 13_000_000 },
      { q: "2026-Q2", label: "Q2 '26", revenueUsd: 85_000_000, opProfitUsd: 7_000_000 },
    ],
  },
];

export function labelByKey(key: LabelKey): LabelInfo | undefined {
  return LABELS.find((l) => l.key === key);
}

export function latestQuarter(l: LabelInfo): Quarter | null {
  for (let i = l.quarters.length - 1; i >= 0; i--) if (l.quarters[i].revenueUsd != null) return l.quarters[i];
  return null;
}

// Compact USD for big money: $967M, $1.2B.
export function usdBig(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  const v = Math.round(n);
  if (v >= 1_000_000_000) return "$" + (v / 1_000_000_000).toFixed(v >= 10_000_000_000 ? 0 : 2).replace(/\.?0+$/, "") + "B";
  if (v >= 1_000_000) return "$" + Math.round(v / 1_000_000) + "M";
  if (v >= 1_000) return "$" + Math.round(v / 1_000) + "K";
  return "$" + v.toLocaleString("en-US");
}
