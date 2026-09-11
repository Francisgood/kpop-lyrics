import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POLL_SEEDS, ARTICLE_POLLS, OPTION_KEYS, type OptionKey } from "@/lib/polls";
import { ensurePollTables } from "@/lib/polls-db";

export const dynamic = "force-dynamic";

// Secret-gated rollup of every poll: per-option counts and shares, which articles
// carry the poll, and how the sample splits between anonymous devices and claimed
// profiles. This is the read side of the audience-insight work — the vote ledger
// is append-only, so nothing here mutates anything.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

type Row = { pollSlug: string; option: string; voterType: string; flagged: boolean; c: number };

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensurePollTables();
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT "pollSlug", "option", "voterType",
             ("flags" IS NOT NULL AND "flags" LIKE '%bot%') AS "flagged",
             COUNT(*)::int AS c
      FROM "PollVote"
      WHERE "flags" IS NULL OR "flags" NOT LIKE '%dup%'
      GROUP BY 1, 2, 3, 4`;

    const placements = new Map<string, string[]>();
    for (const [article, pollId] of Object.entries(ARTICLE_POLLS)) {
      placements.set(pollId, [...(placements.get(pollId) ?? []), article]);
    }

    const polls = Object.values(POLL_SEEDS).map((seed) => {
      const mine = rows.filter((r) => r.pollSlug === seed.slug);
      const counts = {} as Record<OptionKey, number>;
      for (const k of OPTION_KEYS) counts[k] = 0;
      let profiles = 0, devices = 0, botFlagged = 0;
      for (const r of mine) {
        const k = r.option as OptionKey;
        if (OPTION_KEYS.includes(k)) counts[k] += Number(r.c);
        if (r.voterType === "profile") profiles += Number(r.c); else devices += Number(r.c);
        if (r.flagged) botFlagged += Number(r.c);
      }
      const total = seed.options.reduce((n, o) => n + counts[o.key], 0);
      return {
        pollId: seed.slug,
        question: seed.question,
        totalVotes: total,
        // Bot-flagged votes are included in the public split but called out here so
        // a buyer of this data can discount them.
        botFlagged,
        voters: { devices, profiles },
        articles: placements.get(seed.slug) ?? (POLL_SEEDS[seed.slug] ? [seed.slug] : []),
        results: seed.options.map((o) => ({
          option: o.key,
          label: o.label,
          votes: counts[o.key],
          share: total ? Math.round((counts[o.key] / total) * 1000) / 10 : 0,
        })),
      };
    });

    polls.sort((a, b) => b.totalVotes - a.totalVotes);
    return NextResponse.json({ ok: true, generatedAt: new Date().toISOString(), totalVotes: polls.reduce((n, p) => n + p.totalVotes, 0), polls });
  } catch (e) {
    console.error("poll results error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
