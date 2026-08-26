// PC Index — backdated monthly model. Reconstructs the last 12 months of each
// idol's photocard-market volume so the dashboard can show trends and project
// forward. Client-safe (types + pure math + the comeback calendar constant).
//
// HONESTY: this is a MODELED RECONSTRUCTION, not observed history. We do not have
// historical listing snapshots. Instead we distribute each idol's current annual
// run-rate (estAnnualVolumeUsd from the point-in-time model) across the trailing
// 12 months, weighting each month by how much REAL comeback/release activity that
// month carried (the calendar below is researched fact). Comebacks flood new cards
// into circulation and spike trading — so the shape is demand-driven and defensible
// for trend work, but every monthly figure is an estimate, labeled as such.

// Trailing 12 months, oldest → newest. "Now" = 2026-08.
export const BACKDATE_MONTHS = [
  "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03", "2026-04",
  "2026-05", "2026-06", "2026-07", "2026-08",
] as const;

export type MonthIntensity = "none" | "low" | "med" | "high";

// How much a month's real activity spikes photocard demand → relative monthly
// weight. Series are normalized by the sum of weights, so these are ratios, not
// absolute levels. A "high" comeback month ends up ~2.5–3× a "none" month.
export const INTENSITY_WEIGHT: Record<MonthIntensity, number> = {
  none: 0.6,
  low: 0.85,
  med: 1.35,
  high: 2.3,
};

export const INTENSITY_COLOR: Record<MonthIntensity, string> = {
  none: "#5b5570",
  low: "#7bd3ff",
  med: "#c9a9ff",
  high: "#ff6fa8",
};

export type CalendarEntry = { ym: string; intensity: MonthIntensity; event: string };

// Per groupSlug → 12 monthly entries (Sep 2025 → Aug 2026), from research.
// Filled with the real comeback/release calendar. If a group is missing, the model
// falls back to a flat "low" baseline.
export const COMEBACK_CALENDAR: Record<string, CalendarEntry[]> = {
  // BTS — dormant post-military through Feb 2026, then the ARIRANG mega-comeback
  // (1st album in 5 yrs, Mar 2026) + stadium world tour Apr–Aug 2026. All 7 back.
  bts: [
    { ym: "2025-09", intensity: "none", event: "" },
    { ym: "2025-10", intensity: "low", event: "j-hope \u00d7 LSF 'SPAGHETTI'" },
    { ym: "2025-11", intensity: "low", event: "Jin 'RunSeokjin' encore" },
    { ym: "2025-12", intensity: "none", event: "" },
    { ym: "2026-01", intensity: "low", event: "ARIRANG comeback announced" },
    { ym: "2026-02", intensity: "low", event: "Album pre-orders open" },
    { ym: "2026-03", intensity: "high", event: "ARIRANG \u2014 1st album in 5 yrs" },
    { ym: "2026-04", intensity: "high", event: "WORLD TOUR 'ARIRANG' opens" },
    { ym: "2026-05", intensity: "high", event: "US / Mexico stadium leg" },
    { ym: "2026-06", intensity: "high", event: "Busan + Madrid stadiums" },
    { ym: "2026-07", intensity: "high", event: "Europe leg" },
    { ym: "2026-08", intensity: "high", event: "US / Canada leg" },
  ],
  // LE SSERAFIM — continuous: SPAGHETTI (Oct 2025, j-hope crossover) + Pureflow Pt.1 (May 2026).
  "le-sserafim": [
    { ym: "2025-09", intensity: "med", event: "EASY CRAZY HOT \u2014 N. America" },
    { ym: "2025-10", intensity: "high", event: "'SPAGHETTI' (feat. j-hope)" },
    { ym: "2025-11", intensity: "med", event: "Tokyo Dome encore" },
    { ym: "2025-12", intensity: "low", event: "" },
    { ym: "2026-01", intensity: "med", event: "Seoul encore" },
    { ym: "2026-02", intensity: "low", event: "Tour finale" },
    { ym: "2026-03", intensity: "low", event: "" },
    { ym: "2026-04", intensity: "med", event: "'Celebration' pre-release" },
    { ym: "2026-05", intensity: "high", event: "'Pureflow Pt.1' + HQ pop-up" },
    { ym: "2026-06", intensity: "med", event: "'Iconic by Mistake' collab" },
    { ym: "2026-07", intensity: "high", event: "Pureflow tour opens" },
    { ym: "2026-08", intensity: "med", event: "Pureflow tour (Asia/US/EU)" },
  ],
  // aespa — Rich Man (Sep 2025) + Lemonade (May 2026, G-Dragon feat) + new tour Aug 2026.
  aespa: [
    { ym: "2025-09", intensity: "high", event: "'Rich Man' EP + tour opens" },
    { ym: "2025-10", intensity: "med", event: "Synk tour \u2014 Japan" },
    { ym: "2025-11", intensity: "med", event: "Tour + solo digital single" },
    { ym: "2025-12", intensity: "low", event: "" },
    { ym: "2026-01", intensity: "none", event: "" },
    { ym: "2026-02", intensity: "med", event: "Hong Kong show" },
    { ym: "2026-03", intensity: "med", event: "Macau show" },
    { ym: "2026-04", intensity: "med", event: "Tokyo Dome finale + teaser" },
    { ym: "2026-05", intensity: "high", event: "'Lemonade' (feat. G-Dragon)" },
    { ym: "2026-06", intensity: "med", event: "Lemonade fansigns" },
    { ym: "2026-07", intensity: "med", event: "'Kiss n Tell' JP EP" },
    { ym: "2026-08", intensity: "high", event: "Synk: Complaexity tour opens" },
  ],
};

export type MonthPoint = {
  ym: string;
  volumeUsd: number;
  intensity: MonthIntensity;
  event: string;
};

function calendarFor(groupSlug: string): CalendarEntry[] {
  const cal = COMEBACK_CALENDAR[groupSlug];
  if (cal && cal.length === BACKDATE_MONTHS.length) return cal;
  return BACKDATE_MONTHS.map((ym) => ({ ym, intensity: "low" as MonthIntensity, event: "" }));
}

// Distribute an annual run-rate across the trailing 12 months by comeback weight.
// The series always sums to `annualVolumeUsd`, so it stays consistent with the
// point-in-time Idol Market Index.
export function monthlySeries(groupSlug: string, annualVolumeUsd: number): MonthPoint[] {
  const cal = calendarFor(groupSlug);
  const weights = cal.map((c) => INTENSITY_WEIGHT[c.intensity] ?? 1);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return cal.map((c, i) => ({
    ym: c.ym,
    volumeUsd: Math.round((annualVolumeUsd * weights[i]) / sum),
    intensity: c.intensity,
    event: c.event,
  }));
}

// Sum many idols' monthly series into one label/group series (aligned by month).
export function sumSeries(seriesList: MonthPoint[][]): MonthPoint[] {
  return BACKDATE_MONTHS.map((ym, i) => {
    const vol = seriesList.reduce((a, s) => a + (s[i]?.volumeUsd ?? 0), 0);
    // strongest intensity / a representative event for the month
    let intensity: MonthIntensity = "none";
    let event = "";
    for (const s of seriesList) {
      const p = s[i];
      if (!p) continue;
      if (INTENSITY_WEIGHT[p.intensity] > INTENSITY_WEIGHT[intensity]) { intensity = p.intensity; event = p.event; }
    }
    return { ym, volumeUsd: vol, intensity, event };
  });
}

// Calendar quarters that sit fully inside the window (for earnings alignment):
// Q4'25 (Oct–Dec 25), Q1'26 (Jan–Mar 26), Q2'26 (Apr–Jun 26).
export const ALIGNED_QUARTERS: { key: string; label: string; months: string[] }[] = [
  { key: "2025-Q4", label: "Q4 '25", months: ["2025-10", "2025-11", "2025-12"] },
  { key: "2026-Q1", label: "Q1 '26", months: ["2026-01", "2026-02", "2026-03"] },
  { key: "2026-Q2", label: "Q2 '26", months: ["2026-04", "2026-05", "2026-06"] },
];

export function quarterlyFromSeries(series: MonthPoint[]): Record<string, number> {
  const byYm: Record<string, number> = {};
  for (const p of series) byYm[p.ym] = p.volumeUsd;
  const out: Record<string, number> = {};
  for (const q of ALIGNED_QUARTERS) out[q.key] = q.months.reduce((a, m) => a + (byYm[m] ?? 0), 0);
  return out;
}

// Trailing momentum: last 3 months vs the prior 3 months (direction of the signal).
export function momentumPct(series: MonthPoint[]): number | null {
  if (series.length < 6) return null;
  const last3 = series.slice(-3).reduce((a, p) => a + p.volumeUsd, 0);
  const prev3 = series.slice(-6, -3).reduce((a, p) => a + p.volumeUsd, 0);
  if (prev3 <= 0) return null;
  return Math.round(((last3 - prev3) / prev3) * 1000) / 10;
}

export function ymLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const mon = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m)] ?? m;
  return `${mon} '${y.slice(2)}`;
}
