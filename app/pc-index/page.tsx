import Link from "next/link";
import type { Metadata } from "next";
import SmartImage from "@/components/SmartImage";
import { getAllCardsWithListings, type PcCardFull } from "@/lib/pc-index-db";
import { CARD_TIERS, computeMetrics, priceSeries, usd, type PcListing } from "@/lib/pc-index";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "PC Index — K-pop Photocard Market Intelligence",
  description: "A price ticker for K-pop photocards. Floor, median-sold (fair value), ceiling, and volume tracked across marketplaces. MVP: Jennie × Topps, Chaewon on eBay, and photocard bundles.",
};

// PC Index MVP (see the PC Index PRD). Tracks a few example cards and computes the
// PRD's market metrics from an observed listing/sales ledger. Data via
// POST /api/admin/pc-index. EN-first per the PRD (KR/JP/ES are later phases).
export default async function PcIndexPage() {
  let cards: PcCardFull[] = [];
  try { cards = await getAllCardsWithListings(); } catch { cards = []; }

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 20px 90px" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>
        <Link href="/" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>Aegyo Arena</Link>{" / "}PC Index
      </div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 6vw, 3rem)", fontWeight: 800, color: "var(--ink)", lineHeight: 1.08, margin: "0 0 10px" }}>
        PC Index <span style={{ color: "#ff6fa8" }}>·</span> Photocard Market Intelligence
      </h1>
      <p style={{ fontSize: "1.05rem", color: "var(--ink-dim)", lineHeight: 1.65, margin: "0 0 8px", maxWidth: 720 }}>
        A price ticker for K-pop photocards — floor, median-sold (fair value), ceiling, and volume observed across marketplaces.
      </p>
      <p style={{ fontSize: "0.82rem", color: "var(--ink-faint)", margin: "0 0 34px" }}>
        <span style={{ background: "#ff6fa822", color: "#ff6fa8", fontWeight: 800, fontSize: "0.62rem", letterSpacing: "0.08em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase", marginRight: 8 }}>MVP</span>
        Tracking {cards.length || 3} example cards. We report observed sales — we don't authenticate cards or imply any artist/label endorsement.
      </p>

      {cards.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-faint)", border: "1px dashed var(--border)", borderRadius: 16 }}>
          Market data is being gathered — check back shortly.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {cards.map((card) => (
            <CardPanel key={card.sku} card={card} />
          ))}
        </div>
      )}

      {/* Methodology / disclaimer — open methodology is a community-trust tool (PRD §5.4, §9) */}
      <div style={{ marginTop: 40, padding: "18px 20px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-card, #14101c)", fontSize: "0.8rem", color: "var(--ink-dim)", lineHeight: 1.7 }}>
        <div style={{ fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>How to read this</div>
        <b>Floor</b> = lowest active resale ask. <b>Median sold</b> = the middle confirmed sale price, our "fair value." <b>Ceiling</b> = highest confirmed sale. <b>Top ask</b> is shown separately from ceiling so unsold asks never inflate the high. <b>Momentum</b> = recent vs. trailing median. Signed cards are the highest fraud risk — we surface prices but do not authenticate; treat unverified signatures with caution. Prices are normalized to USD. Cards trade $5–$50 typically, with signed event cards reaching $1,500–$2,000+.
      </div>
    </main>
  );
}

function CardPanel({ card }: { card: PcCardFull }) {
  const m = computeMetrics(card.listings);
  const series = priceSeries(card.listings);
  const tier = CARD_TIERS[card.tier] ?? CARD_TIERS[1];
  const primary = card.listings.filter((l) => l.listingType === "primary");
  const secondary = card.listings.filter((l) => l.listingType === "secondary");

  const stats: { label: string; value: string; sub?: string; accent?: boolean }[] = [
    { label: "Floor", value: usd(m.floor), accent: true },
    { label: "Median sold", value: usd(m.median), sub: m.lowData ? "low data" : "fair value" },
    { label: "Ceiling", value: usd(m.ceiling) },
    { label: "Top ask", value: usd(m.topAsk) },
    { label: "Sales vol.", value: m.volume ? `${m.volume}` : "—", sub: m.volume ? usd(m.volumeUsd) : undefined },
    { label: "Momentum", value: m.momentumPct == null ? "—" : `${m.momentumPct > 0 ? "+" : ""}${m.momentumPct}%` },
  ];

  return (
    <section style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--bg-card, #14101c)", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 16, padding: 18, alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        {card.imageUrl ? (
          <SmartImage src={card.imageUrl} alt={card.name} width={76} height={106} sizes="76px" style={{ width: 76, height: 106, objectFit: "cover", borderRadius: 8, flexShrink: 0, background: "rgba(255,255,255,0.05)" }} />
        ) : (
          <div style={{ width: 76, height: 106, borderRadius: 8, flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🃏</div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--ink)", lineHeight: 1.2 }}>{card.name}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)", marginTop: 3 }}>
            {[card.performer, card.group, card.era].filter(Boolean).join(" · ")}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ background: `${tier.color}22`, color: tier.color, fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.04em", padding: "3px 9px", borderRadius: 999 }}>TIER {card.tier} · {tier.label}</span>
            {card.isBundle && <span style={{ background: "#ffffff14", color: "var(--ink-dim)", fontSize: "0.64rem", fontWeight: 800, padding: "3px 9px", borderRadius: 999 }}>BUNDLE / LOT</span>}
          </div>
        </div>
      </div>

      {/* metric tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 1, background: "var(--border)" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "var(--bg-card, #14101c)", padding: "12px 14px" }}>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{s.label}</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: s.accent ? "#ff6fa8" : "var(--ink)", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: "0.66rem", color: "var(--ink-faint)", marginTop: 1 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {series.length >= 2 && (
        <div style={{ padding: "14px 18px 4px" }}>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 6 }}>Sold price history ({series.length} sales)</div>
          <PriceSpark series={series} />
        </div>
      )}

      {primary.length > 0 && <ListingTable title="Primary — where to buy new" rows={primary} />}
      {secondary.length > 0 && <ListingTable title="Secondary — resale market" rows={secondary} />}
    </section>
  );
}

function ListingTable({ title, rows }: { title: string; rows: PcListing[] }) {
  return (
    <div style={{ padding: "12px 18px 18px" }}>
      <div style={{ fontSize: "0.66rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)", margin: "8px 0 8px" }}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <tbody>
            {rows.slice(0, 12).map((l, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 10px 8px 0", color: "var(--ink-dim)", whiteSpace: "nowrap" }}>{l.marketplace || "—"}</td>
                <td style={{ padding: "8px 10px", color: "var(--ink-faint)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.note || (l.status === "sold" ? "sold" : "listing")}</td>
                <td style={{ padding: "8px 10px", color: "var(--ink-faint)", whiteSpace: "nowrap" }}>
                  {l.status === "sold" ? <span style={{ color: "#22e06b" }}>sold{l.soldDate ? ` ${l.soldDate}` : ""}</span> : "active"}
                </td>
                <td style={{ padding: "8px 0 8px 10px", textAlign: "right", fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {usd(l.price)}{l.origCurrency && l.origCurrency !== "USD" && l.origPrice ? <span style={{ color: "var(--ink-faint)", fontWeight: 400, fontSize: "0.72rem" }}> ({l.origPrice} {l.origCurrency})</span> : null}
                </td>
                <td style={{ padding: "8px 0 8px 10px", textAlign: "right", whiteSpace: "nowrap" }}>
                  {l.url ? <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" data-no-outbound="1" style={{ color: "#ff6fa8", textDecoration: "none", fontWeight: 700 }}>view ↗</a> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sold-price sparkline (oldest → newest), min→max scaled.
function PriceSpark({ series }: { series: { t: string; p: number }[] }) {
  const prices = series.map((s) => s.p);
  const min = Math.min(...prices), max = Math.max(...prices);
  const W = 640, H = 60, rng = max - min || 1;
  const pts = series.map((s, i) => `${((i / (series.length - 1)) * W).toFixed(1)},${(H - ((s.p - min) / rng) * (H - 8) - 4).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={60} preserveAspectRatio="none" style={{ display: "block" }} aria-hidden="true">
      <polyline points={pts.join(" ")} fill="none" stroke="#ff6fa8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => { const [x, y] = p.split(","); return <circle key={i} cx={x} cy={y} r="2.4" fill="#ff6fa8" />; })}
    </svg>
  );
}
