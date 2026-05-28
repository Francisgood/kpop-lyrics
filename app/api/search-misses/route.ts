import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/search-misses
// Returns recent ERROR_SEARCH_NO_RESULTS events with frequency counts.
// Optional query params:
//   ?limit=50       — number of unique queries to return (default 50)
//   ?since=7d       — time window: 1d, 7d, 30d, all (default 7d)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
  const since = searchParams.get("since") ?? "7d";

  let fromDate: Date | undefined;
  const now = new Date();
  if (since === "1d")  { fromDate = new Date(now.getTime() - 86_400_000); }
  if (since === "7d")  { fromDate = new Date(now.getTime() - 7 * 86_400_000); }
  if (since === "30d") { fromDate = new Date(now.getTime() - 30 * 86_400_000); }

  const misses = await prisma.searchMiss.findMany({
    where: fromDate ? { createdAt: { gte: fromDate } } : {},
    orderBy: { createdAt: "desc" },
    take: 5000, // raw rows, will aggregate below
  });

  // Aggregate by query (case-insensitive)
  const freq: Record<string, { query: string; count: number; lastSeen: string }> = {};
  for (const m of misses) {
    const key = m.query.toLowerCase().trim();
    if (!freq[key]) {
      freq[key] = { query: m.query, count: 0, lastSeen: m.createdAt.toISOString() };
    }
    freq[key].count++;
    if (m.createdAt.toISOString() > freq[key].lastSeen) {
      freq[key].lastSeen = m.createdAt.toISOString();
    }
  }

  const rows = Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return NextResponse.json({
    errorCode:  "ERROR_SEARCH_NO_RESULTS",
    period:     since,
    total:      misses.length,
    uniqueTerms: rows.length,
    rows,
  });
}
