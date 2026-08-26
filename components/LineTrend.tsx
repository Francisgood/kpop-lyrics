// A dramatic directional line graph for the 12-month photocard-popularity trend.
// Photocard trading is treated as a PROXY FOR POPULARITY / SHARE OF VOICE, not a
// dollar figure — so the Y-axis is 0–100% (each series normalized to its own 12-month
// peak), gridded every 12.5%. The point is DIRECTION, not exact money.
import { ymLabel, type MonthPoint } from "@/lib/pc-backdating";

const GRID = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];

export default function LineTrend({
  series, accent, height = 130, showYAxis = true, showXAxis = true,
}: {
  series: MonthPoint[];
  accent: string;
  height?: number;
  showYAxis?: boolean;
  showXAxis?: boolean;
}) {
  if (series.length < 2) return null;
  const max = Math.max(...series.map((p) => p.volumeUsd), 1);
  const pts = series.map((p, i) => ({
    x: (i / (series.length - 1)) * 100,
    y: (p.volumeUsd / max) * 100, // % of this series' own peak
    p,
  }));
  const line = pts.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(2)} ${(100 - pt.y).toFixed(2)}`).join(" ");
  const area = `${line} L 100 100 L 0 100 Z`;

  return (
    <div style={{ display: "flex", gap: 7 }}>
      {showYAxis && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height, paddingBottom: showXAxis ? 14 : 0, textAlign: "right", fontSize: "0.52rem", color: "var(--ink-faint)", fontVariantNumeric: "tabular-nums", minWidth: 26, flexShrink: 0 }}>
          {[...GRID].reverse().map((g) => (
            <span key={g}>{g}%</span>
          ))}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height={height} style={{ display: "block", overflow: "visible" }}>
          {/* gridlines every 12.5% */}
          {GRID.map((g) => (
            <line key={g} x1="0" x2="100" y1={100 - g} y2={100 - g} stroke="var(--border)" strokeWidth="0.5" strokeDasharray={g === 0 ? undefined : "1.5 2"} opacity={g === 0 ? 0.9 : 0.45} vectorEffect="non-scaling-stroke" />
          ))}
          {/* area + line */}
          <path d={area} fill={`${accent}22`} stroke="none" />
          <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {/* markers: comeback (high) months larger, everything else small */}
          {pts.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={100 - pt.y} r={pt.p.intensity === "high" ? 3 : 1.6} fill={pt.p.intensity === "high" ? accent : "var(--bg-card, #14101c)"} stroke={accent} strokeWidth={pt.p.intensity === "high" ? 0 : 1.4} vectorEffect="non-scaling-stroke">
              <title>{`${ymLabel(pt.p.ym)} · ${Math.round(pt.y)}% of peak${pt.p.event ? ` · ${pt.p.event}` : ""}`}</title>
            </circle>
          ))}
        </svg>
        {showXAxis && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.5rem", color: "var(--ink-faint)", marginTop: 3 }}>
            {series.map((p, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center" }}>{i % 2 === 0 ? ymLabel(p.ym).split(" ")[0] : ""}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
