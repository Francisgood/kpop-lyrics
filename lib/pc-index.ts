// PC Index — K-pop photocard market-intelligence MVP (see the "PC Index" PRD).
// Tracks a small set of cards across marketplaces and computes per-card market
// metrics from a listing/sales ledger. This file is the shared, client-safe core
// (types + tier defs + pure metric math) — no DB imports. The ledger + ingest live
// in lib/pc-index-db.ts.

// PRD §2.1 card tiers — a $3 album pull and a $2,000 signed card are different markets.
export const CARD_TIERS: Record<number, { label: string; labelEs: string; color: string }> = {
  1: { label: "Album inclusion", labelEs: "Inclusión de álbum", color: "#7bd3ff" },
  2: { label: "POB / retailer", labelEs: "POB / minorista", color: "#8affc1" },
  3: { label: "Lucky draw / fansign", labelEs: "Lucky draw / fansign", color: "#ffe08a" },
  4: { label: "Broadcast / SG / membership", labelEs: "Broadcast / SG / membresía", color: "#c9a9ff" },
  5: { label: "Signed / autograph", labelEs: "Firmada / autógrafo", color: "#ff9db1" },
};

export type PcListing = {
  marketplace: string;
  url: string | null;
  price: number; // USD
  currency: string; // always "USD" after normalization
  origPrice: number | null;
  origCurrency: string | null;
  listingType: "primary" | "secondary"; // primary = retail/box, secondary = resale
  status: "active" | "sold";
  soldDate: string | null; // ISO date for sold listings (the price history)
  note: string | null;
};

export type PcCardSeed = {
  sku: string;
  name: string;
  performer: string;
  group: string;
  era: string;
  tier: number; // 1–5
  imageUrl: string | null;
  isBundle: boolean;
  listings: PcListing[];
};

export type PcMetrics = {
  floor: number | null; // lowest active secondary ask (PRD §2)
  topAsk: number | null; // highest active ask — reported separately so unsold asks don't inflate ceiling
  median: number | null; // median confirmed sold ("fair value")
  ceiling: number | null; // highest confirmed sold
  volume: number; // count of confirmed sold
  volumeUsd: number; // $ value of confirmed sold
  momentumPct: number | null; // 7-day vs 30-day median-sold delta
  activeCount: number;
  lowData: boolean; // too few sales to trust median/momentum (honest-uncertainty flag, PRD §6.3)
};

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const MIN_SALES_FOR_TRUST = 3;

export function computeMetrics(listings: PcListing[]): PcMetrics {
  const active = listings.filter((l) => l.status === "active");
  const activeSecondary = active.filter((l) => l.listingType === "secondary");
  const sold = listings.filter((l) => l.status === "sold");
  const soldPrices = sold.map((l) => l.price).filter((p) => p > 0);

  const floorPool = (activeSecondary.length ? activeSecondary : active).map((l) => l.price).filter((p) => p > 0);
  const floor = floorPool.length ? Math.min(...floorPool) : null;
  const topAsk = active.length ? Math.max(...active.map((l) => l.price)) : null;

  // Momentum: median of sales in the most recent 7 days vs the prior comparison
  // window, anchored to the newest sale we have.
  let momentumPct: number | null = null;
  const dated = sold.filter((l) => l.soldDate).map((l) => ({ t: Date.parse(l.soldDate!), p: l.price })).filter((d) => !isNaN(d.t));
  if (dated.length >= 4) {
    const newest = Math.max(...dated.map((d) => d.t));
    const day = 86400000;
    const last7 = median(dated.filter((d) => d.t >= newest - 7 * day).map((d) => d.p));
    const prev = median(dated.filter((d) => d.t >= newest - 30 * day).map((d) => d.p));
    if (last7 != null && prev != null && prev > 0) momentumPct = Math.round(((last7 - prev) / prev) * 1000) / 10;
  }

  return {
    floor,
    topAsk,
    median: median(soldPrices),
    ceiling: soldPrices.length ? Math.max(...soldPrices) : null,
    volume: sold.length,
    volumeUsd: Math.round(soldPrices.reduce((a, b) => a + b, 0)),
    momentumPct,
    activeCount: active.length,
    lowData: sold.length < MIN_SALES_FOR_TRUST,
  };
}

// Sold sales as a chronological price series for the sparkline (oldest → newest).
export function priceSeries(listings: PcListing[]): { t: string; p: number }[] {
  return listings
    .filter((l) => l.status === "sold" && l.soldDate && l.price > 0)
    .map((l) => ({ t: l.soldDate!, p: l.price }))
    .sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
}

export function usd(n: number | null | undefined): string {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}
