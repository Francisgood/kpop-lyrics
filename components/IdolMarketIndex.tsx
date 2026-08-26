// Idol Market Index — the per-idol dashboard on /pc-index. For each tracked member
// it surfaces the four client-requested numbers (top single card, top bundle, live
// supply across marketplaces, estimated annual volume) and attributes that volume
// against the $700M global market. Server component: pure render, no interactivity.
//
// Visual honesty: OBSERVED numbers (top card, top bundle, supply) render solid;
// MODELED numbers (est. annual volume, market share) carry an "est" tag + dashed
// treatment so no one mistakes the model for confirmed sales.
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { usd } from "@/lib/pc-index";
import {
  computeArtistMetrics,
  supplyTotal,
  usdCompact,
  sharePct,
  INDEX_GROUPS,
  MILESTONES,
  MARKET_MODEL,
  KPOP_CARD_MARKET_USD,
  type ArtistIndexRow,
} from "@/lib/pc-artist-index";
import { monthlySeries } from "@/lib/pc-backdating";
import LineTrend from "@/components/LineTrend";

const ACCENT = "#ff6fa8";

export default function IdolMarketIndex({ rows }: { rows: ArtistIndexRow[] }) {
  if (!rows.length) return null;

  const withMetrics = rows.map((r) => ({ row: r, m: computeArtistMetrics(r) }));
  const trackedVolume = withMetrics.reduce((a, x) => a + x.m.estAnnualVolumeUsd, 0);
  const trackedSharePct = (trackedVolume / KPOP_CARD_MARKET_USD) * 100;
  const trackedSupply = withMetrics.reduce((a, x) => a + x.m.supplyTotal, 0);

  return (
    <section style={{ marginBottom: 40 }}>
      {/* ── Market attribution header — the $700M anchor ─────────────────── */}
      <div style={{ border: `1px solid ${ACCENT}55`, borderRadius: 18, background: "linear-gradient(135deg, rgba(255,111,168,0.10), rgba(155,140,255,0.06))", padding: "22px 22px 20px", marginBottom: 28 }}>
        <div style={{ fontSize: "0.66rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>
          Global K-pop photocard market · attribution model
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 34px", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: "clamp(2rem,7vw,3rem)", fontWeight: 800, color: "var(--ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>$700M</div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: 4 }}>est. total market / year</div>
          </div>
          <div>
            <div style={{ fontSize: "clamp(1.4rem,5vw,2rem)", fontWeight: 800, color: ACCENT, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{usdCompact(trackedVolume)}</div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: 4 }}>{rows.length} idols tracked · est. volume</div>
          </div>
          <div>
            <div style={{ fontSize: "clamp(1.4rem,5vw,2rem)", fontWeight: 800, color: "var(--ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{sharePct(trackedSharePct)}</div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: 4 }}>of the global market</div>
          </div>
          <div>
            <div style={{ fontSize: "clamp(1.4rem,5vw,2rem)", fontWeight: 800, color: "var(--ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{trackedSupply.toLocaleString("en-US")}</div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: 4 }}>live listings across platforms</div>
          </div>
        </div>
        {/* share-of-market bar */}
        <div style={{ marginTop: 18, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ width: `${Math.max(1.5, Math.min(100, trackedSharePct))}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, #9b8cff)`, borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 8, lineHeight: 1.5 }}>
          The tracked idols represent an estimated <b style={{ color: "var(--ink-dim)" }}>{sharePct(trackedSharePct)}</b> of the $700M global market. The broader trading-card market (all cards) ran ~$9B in 2024; $700M is an estimate for the K-pop photocard slice.
        </div>
      </div>

      {/* ── Per-group idol cards ─────────────────────────────────────────── */}
      {INDEX_GROUPS.map((g) => {
        const members = withMetrics
          .filter((x) => x.row.groupSlug === g.slug)
          .sort((a, b) => b.m.estAnnualVolumeUsd - a.m.estAnnualVolumeUsd);
        if (!members.length) return null;
        const groupVolume = members.reduce((a, x) => a + x.m.estAnnualVolumeUsd, 0);
        return (
          <div key={g.slug} style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14, paddingBottom: 8, borderBottom: `2px solid ${g.color}44` }}>
              <Link href={`/artists/${g.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: g.color, display: "inline-block" }} />
                <span style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)" }}>{g.name}</span>
                <span style={{ fontSize: "0.72rem", color: g.color, fontWeight: 700 }}>{members.length} members ↗</span>
              </Link>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{usdCompact(groupVolume)}</div>
                <div style={{ fontSize: "0.64rem", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>est. group vol / yr</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {members.map(({ row, m }) => (
                <IdolCard key={row.slug} row={row} m={m} groupColor={g.color} />
              ))}
            </div>
          </div>
        );
      })}

      <MethodologyBox />
    </section>
  );
}

function IdolCard({ row, m, groupColor }: { row: ArtistIndexRow; m: ReturnType<typeof computeArtistMetrics>; groupColor: string }) {
  const s = row.supply;
  const breakdown = [
    ["eBay", s.ebay],
    ["Mercari", s.meraki],
    ["Poca", s.pocamarket],
    ["Topps", s.topps],
    [s.otherNote || "Other", s.other],
  ].filter(([, v]) => v != null && (v as number) > 0) as [string, number][];

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--bg-card, #14101c)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ display: "flex", gap: 12, padding: 14, alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        {row.imageUrl ? (
          <SmartImage src={row.imageUrl} alt={row.name} width={52} height={52} sizes="52px" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "rgba(255,255,255,0.05)" }} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: `${groupColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>🃏</div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link href={`/artists/${row.slug}`} style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.15 }}>{row.name}</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            <span style={{ background: `${m.milestone.color}22`, color: m.milestone.color, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.03em", padding: "2px 8px", borderRadius: 999 }}>{m.milestone.icon} {m.milestone.label}</span>
            {row.confidence && <span style={{ color: "var(--ink-faint)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.confidence}</span>}
          </div>
        </div>
      </div>

      {/* Featured photocards — the actual top card + top bundle images (OBSERVED) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 14 }}>
        <CardThumb label="Top card" image={row.topCard.image} price={row.topCard.price} name={row.topCard.name} url={row.topCard.url} accent />
        <CardThumb label="Top bundle" image={row.topBundle.image} price={row.topBundle.price} name={row.topBundle.name} url={row.topBundle.url} />
      </div>

      {/* Supply (observed) + est. volume (modeled, secondary) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", borderTop: "1px solid var(--border)" }}>
        <div style={{ background: "var(--bg-card, #14101c)", padding: "12px 14px" }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Cards for sale</div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{supplyTotal(s).toLocaleString("en-US")}</div>
          <div style={{ fontSize: "0.62rem", color: "var(--ink-faint)", marginTop: 3, lineHeight: 1.5 }}>
            {breakdown.length ? breakdown.map(([k, v]) => `${k} ${v.toLocaleString("en-US")}`).join(" · ") : "—"}
          </div>
        </div>
        <div style={{ background: "var(--bg-card, #14101c)", padding: "12px 14px" }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center", gap: 5 }}>
            Est. volume / yr
            <span style={{ border: "1px dashed var(--ink-faint)", color: "var(--ink-faint)", fontSize: "0.5rem", fontWeight: 800, padding: "0 4px", borderRadius: 4, letterSpacing: "0.04em" }}>MODEL</span>
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: groupColor, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{usdCompact(m.estAnnualVolumeUsd)}</div>
          <div style={{ fontSize: "0.62rem", color: "var(--ink-faint)", marginTop: 3 }}>{sharePct(m.marketSharePct)} of market</div>
        </div>
      </div>

      {/* Popularity trend — directional share-of-voice proxy (% of 12-mo peak) */}
      <div style={{ padding: "12px 14px 6px" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 6 }}>
          Popularity trend <span style={{ opacity: 0.7 }}>· share of voice · 12mo</span>
        </div>
        <LineTrend series={monthlySeries(row.groupSlug, m.estAnnualVolumeUsd)} accent={groupColor} height={108} />
      </div>

      {row.signal && (
        <div style={{ padding: "10px 14px", fontSize: "0.72rem", color: "var(--ink-dim)", lineHeight: 1.5, borderTop: "1px solid var(--border)", fontStyle: "italic" }}>{row.signal}</div>
      )}
    </div>
  );
}

function CardThumb({ label, image, price, name, url, accent }: { label: string; image: string | null; price: number | null; name: string | null; url: string | null; accent?: boolean }) {
  const inner = (
    <>
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", background: "rgba(255,255,255,0.05)", borderRadius: 9, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {image ? (
          <SmartImage src={image} alt={name || label} width={170} height={226} sizes="170px" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "2rem", opacity: 0.35 }}>🃏</span>
        )}
        <span style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,0.72)", color: accent ? ACCENT : "#fff", fontSize: "0.56rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 6 }}>{label}</span>
        <span style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: "0.86rem", fontWeight: 800, padding: "2px 8px", borderRadius: 7, fontVariantNumeric: "tabular-nums" }}>{usd(price)}</span>
      </div>
      <div style={{ fontSize: "0.6rem", color: "var(--ink-faint)", marginTop: 5, display: "flex", alignItems: "center", gap: 3 }} title={name || undefined}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name || "—"}</span>{url ? <span style={{ color: ACCENT, flexShrink: 0 }}>↗</span> : null}
      </div>
    </>
  );
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" data-no-outbound="1" style={{ textDecoration: "none", display: "block", minWidth: 0 }}>{inner}</a>
  ) : (
    <div style={{ minWidth: 0 }}>{inner}</div>
  );
}

function MethodologyBox() {
  return (
    <div style={{ marginTop: 8, padding: "18px 20px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-card, #14101c)", fontSize: "0.8rem", color: "var(--ink-dim)", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>How these numbers are built</div>
      <b style={{ color: "var(--ink)" }}>Observed</b> (top card, top bundle, cards-for-sale) come from live marketplace listings — the highest plausible genuine ask, not joke placeholder prices. <b style={{ color: "var(--ink)" }}>Estimated annual volume</b> is <i>modeled</i>, not confirmed sales:
      {" "}<code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 5, fontSize: "0.76rem" }}>volume = live supply × avg card price × {MARKET_MODEL.turnsPerYear} turns/yr</code>, where the average card price is desirability-weighted off the top card and bounded to ${MARKET_MODEL.avgCardMin}–${MARKET_MODEL.avgCardMax}. The <b>{MARKET_MODEL.turnsPerYear}× annual turnover</b> is the softest assumption — treat volume + market-share figures as order-of-magnitude, not precise. Milestone tiers:{" "}
      {MILESTONES.map((mi, i) => (
        <span key={mi.label} style={{ color: mi.color, fontWeight: 700 }}>{mi.icon} {mi.label} (≥{usdCompact(mi.min)}){i < MILESTONES.length - 1 ? " · " : ""}</span>
      ))}. Supply counts are marketplace search results and can include look-alike items; we surface prices, we don't authenticate cards or imply any artist/label endorsement.
    </div>
  );
}
