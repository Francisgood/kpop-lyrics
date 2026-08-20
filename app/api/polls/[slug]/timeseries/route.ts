import { NextRequest, NextResponse } from "next/server";
import { getPollSeed } from "@/lib/polls";
import { getTimeseries } from "@/lib/polls-db";

export const dynamic = "force-dynamic";

// Hourly A/B split buckets since the poll opened — powers the sparkline-weight
// results-over-time chart on the results view.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getPollSeed(slug)) return NextResponse.json({ error: "Unknown poll" }, { status: 404 });
  try {
    const buckets = await getTimeseries(slug);
    return NextResponse.json({ ok: true, buckets });
  } catch (e) {
    console.error("poll timeseries error:", e);
    return NextResponse.json({ ok: true, buckets: [] });
  }
}
