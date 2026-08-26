import type { Metadata } from "next";
import ForecastDashboard from "@/components/ForecastDashboard";
import { getArtistIndex } from "@/lib/pc-artist-index-db";
import type { ArtistIndexRow } from "@/lib/pc-artist-index";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Earnings Signal — Photocards as a Leading Indicator | PC Index",
  description: "Backdated 12-month K-pop photocard market index rolled up to HYBE, SM, JYP and YG — framing fan-driven photocard trading as a leading signal for label quarterly revenue.",
};

// /pc-index/forecast — backdated monthly photocard index + the label earnings layer.
export default async function ForecastPage() {
  let rows: ArtistIndexRow[] = [];
  try { rows = await getArtistIndex(); } catch { rows = []; }

  if (!rows.length) {
    return (
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "60px 20px", textAlign: "center", color: "var(--ink-faint)" }}>
        The Idol Market Index is still being gathered — the earnings signal will appear once idol data lands.
      </main>
    );
  }
  return <ForecastDashboard rows={rows} />;
}
