// PC Index — Forecast / Earnings-Signal dashboard (/pc-index/forecast). Backdates
// each idol's photocard volume across the last 12 months (modeled, anchored to real
// comebacks) and rolls it up to the four listed labels alongside their reported
// quarterly revenue — framing photocard trading as a fan-driven leading signal for
// label earnings. Server component: pure render.
import Link from "next/link";
import { computeArtistMetrics, usdCompact, INDEX_GROUPS, type ArtistIndexRow } from "@/lib/pc-artist-index";
import {
  monthlySeries, sumSeries, quarterlyFromSeries, momentumPct, ymLabel,
  BACKDATE_MONTHS, ALIGNED_QUARTERS, type MonthPoint,
} from "@/lib/pc-backdating";
import { LABELS, labelForGroup, latestQuarter, usdBig, type LabelInfo } from "@/lib/pc-earnings";
import LineTrend from "@/components/LineTrend";

const ACCENT = "#ff6fa8";

type Row = { row: ArtistIndexRow; annual: number; series: MonthPoint[] };

export default function ForecastDashboard({ rows }: { rows: ArtistIndexRow[] }) {
  const enriched: Row[] = rows.map((r) => {
    const annual = computeArtistMetrics(r).estAnnualVolumeUsd;
    return { row: r, annual, series: monthlySeries(r.groupSlug, annual) };
  });


  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 20px 90px" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>
        <Link href="/" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>Aegyo Arena</Link>{" / "}
        <Link href="/pc-index" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>PC Index</Link>{" / "}Forecast
      </div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)", fontWeight: 800, color: "var(--ink)", lineHeight: 1.08, margin: "0 0 10px" }}>
        Earnings Signal <span style={{ color: ACCENT }}>·</span> Photocards as a Leading Indicator
      </h1>
      <p style={{ fontSize: "1.02rem", color: "var(--ink-dim)", lineHeight: 1.65, margin: "0 0 8px", maxWidth: 760 }}>
        Photocard trading is a real-time, fan-driven demand signal — a proxy for an idol&apos;s <b style={{ color: "var(--ink-dim)" }}>popularity and share of voice</b> online. It spikes on comebacks, the same cycle that drives label revenue. We backdate each idol&apos;s photocard activity over the last 12 months and line the <b style={{ color: "var(--ink-dim)" }}>direction</b> of that signal up against what HYBE, SM, JYP and YG actually earned.
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--ink-faint)", margin: "0 0 32px", lineHeight: 1.6 }}>
        <span style={{ background: `${ACCENT}22`, color: ACCENT, fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.08em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase", marginRight: 8 }}>Modeled</span>
        Monthly history is a reconstruction, weighted by real comeback activity, and every trend line is normalized to its own 12-month peak (0–100%). The point is <b style={{ color: "var(--ink-dim)" }}>directionality, not dollar amounts</b>. Label revenue is reported fact; the photocard trend is a popularity / share-of-voice signal, not a slice of revenue.
      </p>

      {/* ── The four labels ─────────────────────────────────────────────── */}
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 4px" }}>The four labels</div>
      <p style={{ fontSize: "0.8rem", color: "var(--ink-faint)", margin: "0 0 18px" }}>Reported Q2 2026 revenue vs. the trailing-12-month photocard popularity signal — direction, not dollars.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 40 }}>
        {LABELS.map((l) => (
          <LabelCard key={l.key} label={l} enriched={enriched} />
        ))}
      </div>

      {/* ── Per-group 12-month trend with comeback markers ──────────────── */}
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 4px" }}>12-month trend by group</div>
      <p style={{ fontSize: "0.8rem", color: "var(--ink-faint)", margin: "0 0 18px" }}>Directional popularity signal — each group&apos;s photocard activity as % of its own 12-month peak, gridded every 12.5%. Pink dots mark comeback months.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
        {INDEX_GROUPS.map((g) => {
          const members = enriched.filter((x) => x.row.groupSlug === g.slug);
          if (!members.length) return null;
          const series = sumSeries(members.map((x) => x.series));
          return <GroupTrend key={g.slug} name={g.name} slug={g.slug} color={g.color} series={series} />;
        })}
      </div>

      {/* ── Raw per-idol monthly estimates (the backdated table) ────────── */}
      <details style={{ marginBottom: 36, border: "1px solid var(--border)", borderRadius: 14, background: "var(--bg-card, #14101c)", overflow: "hidden" }}>
        <summary style={{ cursor: "pointer", padding: "14px 18px", fontWeight: 800, color: "var(--ink)", fontSize: "0.95rem", listStyle: "none" }}>
          ▸ Per-idol monthly popularity index — 16 idols × 12 months, % of each idol&apos;s 12-month peak (modeled)
        </summary>
        <div style={{ overflowX: "auto", borderTop: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--ink-faint)", position: "sticky", left: 0, background: "var(--bg-card, #14101c)" }}>Idol</th>
                {BACKDATE_MONTHS.map((ym) => (
                  <th key={ym} style={{ textAlign: "right", padding: "8px 8px", color: "var(--ink-faint)", fontWeight: 600 }}>{ymLabel(ym)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map((x) => {
                const peak = Math.max(...x.series.map((p) => p.volumeUsd), 1);
                return (
                  <tr key={x.row.slug} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "7px 12px", color: "var(--ink)", fontWeight: 700, position: "sticky", left: 0, background: "var(--bg-card, #14101c)" }}>{x.row.name}<span style={{ color: "var(--ink-faint)", fontWeight: 400 }}> · {x.row.group}</span></td>
                    {x.series.map((p) => (
                      <td key={p.ym} style={{ padding: "7px 8px", textAlign: "right", color: p.intensity === "high" ? ACCENT : "var(--ink-dim)", fontVariantNumeric: "tabular-nums" }}>{Math.round((p.volumeUsd / peak) * 100)}%</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>

      <MethodologyBox />
    </main>
  );
}

function LabelCard({ label, enriched }: { label: LabelInfo; enriched: Row[] }) {
  const members = enriched.filter((x) => labelForGroup(x.row.groupSlug) === label.key);
  const tracked = members.length > 0;
  const series = tracked ? sumSeries(members.map((x) => x.series)) : [];
  const annual = members.reduce((a, x) => a + x.annual, 0);
  const mom = tracked ? momentumPct(series) : null;
  const q = latestQuarter(label);
  const qIndex = tracked ? quarterlyFromSeries(series) : {};
  const revByQ: Record<string, number | null> = Object.fromEntries(label.quarters.map((x) => [x.q, x.revenueUsd]));
  const signal = mom == null ? null : mom > 8 ? { t: "Rising", c: "#22e06b", a: "↑" } : mom < -8 ? { t: "Cooling", c: "#ff8a8a", a: "↓" } : { t: "Flat", c: "var(--ink-dim)", a: "→" };

  return (
    <div style={{ border: `1px solid ${label.color}55`, borderRadius: 16, background: "var(--bg-card, #14101c)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: 16, borderBottom: "1px solid var(--border)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: label.color }} />
            <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--ink)" }}>{label.name}</span>
          </div>
          <div style={{ fontSize: "0.64rem", color: "var(--ink-faint)", marginTop: 3, letterSpacing: "0.04em" }}>{label.ticker}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{usdBig(q?.revenueUsd)}</div>
          <div style={{ fontSize: "0.62rem", color: "var(--ink-faint)", marginTop: 3 }}>reported {q?.label ?? "revenue"} revenue</div>
        </div>
      </div>

      {tracked && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "12px 16px 6px", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: ACCENT, fontVariantNumeric: "tabular-nums" }}>{usdCompact(annual)}</span>
              <span style={{ fontSize: "0.64rem", color: "var(--ink-faint)", marginLeft: 5 }}>popularity signal · 12mo</span>
            </div>
            {signal && <span style={{ marginLeft: "auto", fontSize: "0.66rem", fontWeight: 800, color: signal.c }}>{signal.a} {signal.t} {mom != null ? `${mom > 0 ? "+" : ""}${mom}%` : ""}</span>}
          </div>
          <div style={{ padding: "0 16px 10px" }}>
            <LineTrend series={series} accent={label.color} height={110} />
          </div>
        </>
      )}

      {/* Quarterly correlation: reported revenue (label color) + photocard index (pink) */}
      <div style={{ padding: "9px 12px 5px", fontSize: "0.55rem", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", borderTop: "1px solid var(--border)" }}>
        Reported revenue{tracked ? <span> · <span style={{ color: ACCENT }}>◆ popularity index</span></span> : null}
      </div>
      <div style={{ display: "flex", gap: 1, background: "var(--border)" }}>
        {ALIGNED_QUARTERS.map((qq) => (
          <div key={qq.key} style={{ flex: 1, background: "var(--bg-card, #14101c)", padding: "6px 8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: "0.56rem", color: "var(--ink-faint)" }}>{qq.label}</div>
            <div style={{ fontSize: "0.92rem", fontWeight: 800, color: label.color, fontVariantNumeric: "tabular-nums" }}>{usdBig(revByQ[qq.key])}</div>
            {tracked && <div style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, marginTop: 1 }}>◆ {usdCompact(qIndex[qq.key] ?? 0)}</div>}
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 16px", fontSize: "0.7rem", color: "var(--ink-dim)", lineHeight: 1.5, borderTop: "1px solid var(--border)" }}>
        {tracked ? (
          <>Tracking {members.length} {members.length === 1 ? "idol" : "idols"}: {members.map((x) => x.row.name).join(", ")}.</>
        ) : (
          <><span style={{ color: "var(--ink-faint)" }}>Signal not active.</span> Add <b style={{ color: "var(--ink)" }}>{label.flagship.slice(0, 2).join(" / ")}</b> to the Idol Market Index to light up this label.</>
        )}
      </div>
    </div>
  );
}

function GroupTrend({ name, slug, color, series }: { name: string; slug: string; color: string; series: MonthPoint[] }) {
  const peak = series.reduce((mx, p) => (p.volumeUsd > mx.volumeUsd ? p : mx), series[0]);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--bg-card, #14101c)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <Link href={`/artists/${slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--ink)" }}>{name}</span>
        </Link>
        {peak?.event && (
          <span style={{ fontSize: "0.68rem", color: "var(--ink-faint)" }}>peak: <b style={{ color: "var(--ink-dim)" }}>{ymLabel(peak.ym)}</b> · {peak.event}</span>
        )}
      </div>
      <LineTrend series={series} accent={color} height={150} />
    </div>
  );
}

function MethodologyBox() {
  return (
    <div style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-card, #14101c)", fontSize: "0.8rem", color: "var(--ink-dim)", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>How the backdating works (and its limits)</div>
      Each idol&apos;s photocard activity is spread over the trailing 12 months, weighted by <b style={{ color: "var(--ink)" }}>real comeback activity</b> — releases, tours, fan-signs flood new cards into circulation and spike trading — then each trend is normalized to its own 12-month peak. So the line shows <b style={{ color: "var(--ink)" }}>direction, not dollars</b>: photocard trading is a proxy for popularity and share of voice, not a revenue figure. Label revenue is <b>reported fact</b>; the popularity signal tends to lead the comeback cycle that drives it. <b style={{ color: "var(--ink)" }}>Next:</b> fan input (voting expected comeback impact) sharpens the forward projection, and adding JYP/YG flagships activates those labels&apos; signals — turning this into a genuine popularity-to-earnings nowcast.
    </div>
  );
}
