// PC Index — per-idol "Idol Market Index". Aggregates one member's photocard
// market into four headline numbers the client asked for: top single card, top
// bundle, live supply across marketplaces, and an ESTIMATED annual sales volume,
// then attributes that volume against the global K-pop card market.
//
// Client-safe core (types + market model + pure math) — no DB imports. The ledger
// + ingest live in lib/pc-artist-index-db.ts.
//
// HONESTY CONTRACT (this is a public dashboard):
//   • OBSERVED   — top card, top bundle, per-platform supply. Sourced from live
//                  listings with URLs. What we actually saw.
//   • MODELED    — annual volume + market share. Derived from observed supply via
//                  the transparent formula below. These are ESTIMATES, labeled as
//                  such on the page. We do not present them as confirmed sales.

// The global market anchor. There is no clean public figure isolating the K-pop
// photocard segment; the broader trading-card market ran ~$9B in 2024 (all cards).
// $700M is the client-provided estimate for the global K-pop photocard/trading-card
// market — ~8% of that total, which is a plausible slice. Cited as an estimate.
export const KPOP_CARD_MARKET_USD = 700_000_000;

// The volume model, all knobs in one place so the page can print them verbatim.
//   estAnnualVolume = liveSupply × avgCardPrice × turnsPerYear
// avgCardPrice is desirability-weighted off the idol's top card (a hotter market
// carries a higher effective average) but bounded to a sane resale band. turns =
// how many times the live inventory level turns over in a year (the softest knob).
export const MARKET_MODEL = {
  turnsPerYear: 4, // active-inventory annual turnover (assumption — the softest input)
  avgCardBase: 11, // USD floor for a representative traded card
  avgCardTopWeight: 0.006, // + this × top-card price → small desirability premium
  avgCardMin: 11,
  avgCardMax: 24, // most cards trade $5–20; price guides top out ~$90–150, rare cards higher
} as const;

// The three groups we track, in display order.
export const INDEX_GROUPS: { slug: string; name: string; color: string }[] = [
  { slug: "bts", name: "BTS", color: "#9b8cff" },
  { slug: "le-sserafim", name: "LE SSERAFIM", color: "#4aa3ff" },
  { slug: "aespa", name: "aespa", color: "#ff7ab8" },
];

// Milestone tiers by estimated annual volume — the "market milestones per idol"
// the client asked to surface.
export const MILESTONES: { min: number; label: string; labelEs: string; color: string; icon: string }[] = [
  { min: 1_000_000, label: "Blue Chip", labelEs: "Primera Línea", color: "#ffd479", icon: "💎" },
  { min: 400_000, label: "Established", labelEs: "Consolidado", color: "#c9a9ff", icon: "⭐" },
  { min: 150_000, label: "Growth", labelEs: "Crecimiento", color: "#8affc1", icon: "📈" },
  { min: 0, label: "Emerging", labelEs: "Emergente", color: "#7bd3ff", icon: "🌱" },
];

export type MarketRef = {
  name: string | null;
  price: number | null; // USD
  url: string | null;
  marketplace: string | null;
  image: string | null; // the actual card photo (listing image) — makes the index about the cards
};

export type ArtistIndexRow = {
  slug: string; // matches /artists/[slug]
  name: string;
  group: string; // "BTS"
  groupSlug: string; // "bts"
  imageUrl: string | null;
  topCard: MarketRef;
  topBundle: MarketRef;
  supply: {
    ebay: number | null;
    meraki: number | null;
    pocamarket: number | null;
    topps: number | null;
    other: number | null;
    otherNote: string | null;
  };
  signal: string | null; // one-line popularity note
  confidence: string | null; // observed | approx | mixed
  shareOfVoice: number | null; // 0-100 online "talked about" index (per-member, drives the popularity line)
};

export type ArtistIndexMetrics = {
  supplyTotal: number;
  avgCardUsd: number; // modeled representative price
  estAnnualVolumeUsd: number; // MODELED
  marketSharePct: number; // of KPOP_CARD_MARKET_USD (MODELED)
  milestone: (typeof MILESTONES)[number];
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function supplyTotal(s: ArtistIndexRow["supply"]): number {
  return (s.ebay ?? 0) + (s.meraki ?? 0) + (s.pocamarket ?? 0) + (s.topps ?? 0) + (s.other ?? 0);
}

export function computeArtistMetrics(row: ArtistIndexRow): ArtistIndexMetrics {
  const total = supplyTotal(row.supply);
  const top = row.topCard.price ?? 0;
  const avgCardUsd = Math.round(
    clamp(MARKET_MODEL.avgCardBase + top * MARKET_MODEL.avgCardTopWeight, MARKET_MODEL.avgCardMin, MARKET_MODEL.avgCardMax)
  );
  const estAnnualVolumeUsd = Math.round(total * avgCardUsd * MARKET_MODEL.turnsPerYear);
  const marketSharePct = (estAnnualVolumeUsd / KPOP_CARD_MARKET_USD) * 100;
  const milestone = MILESTONES.find((m) => estAnnualVolumeUsd >= m.min) ?? MILESTONES[MILESTONES.length - 1];
  return { supplyTotal: total, avgCardUsd, estAnnualVolumeUsd, marketSharePct, milestone };
}

// Compact USD for headline tiles: $1.2M, $840K, $620.
export function usdCompact(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  const v = Math.round(n);
  if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (v >= 1_000) return "$" + (v / 1_000).toFixed(v >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return "$" + v.toLocaleString("en-US");
}

export function sharePct(pct: number): string {
  if (pct >= 1) return pct.toFixed(1) + "%";
  if (pct >= 0.1) return pct.toFixed(2) + "%";
  return pct.toFixed(3) + "%";
}
