import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Secret-gated read of the LE SSERAFIM giveaway entrants (the `GiveawayEntryLsf`
// table that app/api/le-sserafim/route.ts writes). Mirrors the BTS export next
// door; kept as its own route because the two campaigns are deliberately
// isolated — different table, different columns, different lifecycle.
// Returns JSON by default, CSV with ?format=csv.
// PII (name/email/country/zip) — keep IMAGE_REFRESH_SECRET private.
function authed(req: NextRequest): boolean {
  const s = process.env.IMAGE_REFRESH_SECRET;
  return !!s && req.headers.get("authorization") === `Bearer ${s}`;
}

// phone and birthDate are nullable: both were dropped from the entry form
// mid-campaign, so early rows carry them and later rows do not.
type Row = {
  firstName: string; lastName: string; email: string; phone: string | null;
  zip: string; country: string | null; birthDate: Date | null;
  newsletterOptIn: boolean; referralCode: string; referredByCode: string | null;
  referralCount: number; createdAt: Date;
};

// The giveaway page promises "every friend who enters is another entry for you",
// so an entrant's weight in the draw is 1 + their referral count.
const weightOf = (referralCount: number) => 1 + Number(referralCount ?? 0);

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rows: Row[] = [];
  try {
    rows = await prisma.$queryRawUnsafe<Row[]>(
      `SELECT "firstName","lastName","email","phone","zip","country","birthDate","newsletterOptIn",
              "referralCode","referredByCode","referralCount","createdAt"
       FROM "GiveawayEntryLsf" ORDER BY "createdAt" ASC`
    );
  } catch {
    return NextResponse.json({ count: 0, entries: [], note: "No GiveawayEntryLsf rows yet." });
  }

  if (new URL(req.url).searchParams.get("format") === "csv") {
    const cols = ["entry_no", "firstName", "lastName", "email", "country", "zip",
      "referralCode", "referredByCode", "referralCount", "total_entries", "createdAt"];
    const cell = (v: unknown) => {
      const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [cols.join(",")];
    rows.forEach((r, i) => {
      lines.push([i + 1, r.firstName, r.lastName, r.email, r.country, r.zip,
        r.referralCode, r.referredByCode, Number(r.referralCount ?? 0),
        weightOf(r.referralCount), r.createdAt].map(cell).join(","));
    });
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="le-sserafim-giveaway-entries.csv"`,
      },
    });
  }

  return NextResponse.json({
    count: rows.length,
    totalWeightedEntries: rows.reduce((a, r) => a + weightOf(r.referralCount), 0),
    entries: rows.map((r, i) => ({ entryNo: i + 1, ...r, totalEntries: weightOf(r.referralCount) })),
  });
}
