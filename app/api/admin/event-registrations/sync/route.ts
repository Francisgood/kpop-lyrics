import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hostedEventBySlug } from "@/lib/hosted-events";
import { ensureRegistrationTable, onboardRegistrant } from "@/lib/event-registrations";
import { beehiivConfigured, findBeehiivSubscription } from "@/lib/beehiiv";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Replays the beehiiv hand-off and the confirmation email for registrations that
// never completed one — anyone who registered before the integration existed, or
// whose subscribe failed while the API was down. Idempotent: beehiiv reactivates
// an existing subscriber rather than duplicating, and a confirmation that already
// went out is not sent again unless `resend` is passed.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

type Row = { id: string; eventSlug: string; name: string; email: string; optIn: boolean; beehiivStatus: string | null; confirmedAt: Date | null };

/** Dry run: what the sync would do, plus what beehiiv actually holds today. */
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureRegistrationTable();
    const slug = new URL(req.url).searchParams.get("slug");
    const rows = await rowsFor(slug);
    const report = [];
    for (const r of rows) {
      const live = r.optIn ? await findBeehiivSubscription(r.email) : { found: false, skipped: true };
      report.push({
        email: r.email, optIn: r.optIn,
        recordedStatus: r.beehiivStatus ?? "(none)",
        inBeehiiv: r.optIn ? (live.skipped ? "unknown — not configured" : live.found ? `yes (${live.status ?? "active"})` : "no") : "n/a — declined",
        confirmationSent: !!r.confirmedAt,
        wouldSync: r.optIn && r.beehiivStatus !== "subscribed",
        wouldEmail: !r.confirmedAt,
      });
    }
    return NextResponse.json({
      ok: true, beehiivConfigured: beehiivConfigured(), count: rows.length, registrations: report,
    });
  } catch (e) {
    console.error("registration sync dry-run error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureRegistrationTable();
    const body = await req.json().catch(() => ({}));
    const slug = typeof body.slug === "string" ? body.slug : null;
    const resend = body.resend === true;

    const rows = await rowsFor(slug);
    const results = [];
    for (const r of rows) {
      const event = hostedEventBySlug(r.eventSlug);
      if (!event) { results.push({ email: r.email, skipped: "unknown event" }); continue; }
      const out = await onboardRegistrant(event, { name: r.name, email: r.email, optIn: r.optIn }, { resendConfirmation: resend });
      results.push({ email: r.email, beehiivStatus: out.beehiivStatus, emailSent: out.emailSent });
    }
    return NextResponse.json({
      ok: true,
      beehiivConfigured: beehiivConfigured(),
      processed: results.length,
      subscribed: results.filter((r) => r.beehiivStatus === "subscribed").length,
      emailed: results.filter((r) => r.emailSent).length,
      results,
    });
  } catch (e) {
    console.error("registration sync error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

async function rowsFor(slug: string | null): Promise<Row[]> {
  return slug
    ? await prisma.$queryRaw<Row[]>`
        SELECT "id","eventSlug","name","email","optIn","beehiivStatus","confirmedAt"
        FROM "EventRegistration" WHERE "eventSlug" = ${slug} ORDER BY "createdAt" ASC`
    : await prisma.$queryRaw<Row[]>`
        SELECT "id","eventSlug","name","email","optIn","beehiivStatus","confirmedAt"
        FROM "EventRegistration" ORDER BY "createdAt" ASC`;
}
