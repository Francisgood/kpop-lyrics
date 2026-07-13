import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Secret-gated read of the BTS giveaway entrants (the `GiveawayEntry` table that
// app/api/giveaway/route.ts writes). Returns JSON by default, CSV with ?format=csv.
// PII (name/email/phone/country/zip/birthDate) — keep IMAGE_REFRESH_SECRET private.
function authed(req: NextRequest): boolean {
  const s = process.env.IMAGE_REFRESH_SECRET;
  return !!s && req.headers.get("authorization") === `Bearer ${s}`;
}

type Row = {
  firstName: string; lastName: string; email: string; phone: string; zip: string;
  country: string | null; birthDate: Date; newsletterOptIn: boolean; referralCode: string;
  referredByCode: string | null; referralCount: number; createdAt: Date;
};

function ageOf(d: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rows: Row[] = [];
  try {
    // `country` was added after launch; ensure it exists so the export never 500s
    // on a table created before internationalization (idempotent, matches the writer).
    await prisma.$executeRawUnsafe(`ALTER TABLE "GiveawayEntry" ADD COLUMN IF NOT EXISTS "country" TEXT`);
    rows = await prisma.$queryRawUnsafe<Row[]>(
      `SELECT "firstName","lastName","email","phone","zip","country","birthDate","newsletterOptIn",
              "referralCode","referredByCode","referralCount","createdAt"
       FROM "GiveawayEntry" ORDER BY "createdAt" DESC`
    );
  } catch {
    return NextResponse.json({ count: 0, entries: [], note: "No GiveawayEntry rows yet." });
  }

  if (new URL(req.url).searchParams.get("format") === "csv") {
    const cols = ["firstName", "lastName", "email", "phone", "country", "zip", "birthDate", "age",
      "newsletterOptIn", "referralCode", "referredByCode", "referralCount", "createdAt"];
    const cell = (v: unknown) => {
      const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [cols.join(",")];
    for (const r of rows) {
      lines.push([r.firstName, r.lastName, r.email, r.phone, r.country, r.zip, r.birthDate, ageOf(new Date(r.birthDate)),
        r.newsletterOptIn, r.referralCode, r.referredByCode, r.referralCount, r.createdAt].map(cell).join(","));
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bts-giveaway-entries.csv"`,
      },
    });
  }

  return NextResponse.json({
    count: rows.length,
    entries: rows.map((r) => ({ ...r, age: ageOf(new Date(r.birthDate)) })),
  });
}
