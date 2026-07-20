import { NextRequest, NextResponse } from "next/server";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { sendRedditConversion, redditSignals } from "@/lib/reddit-capi";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, source } = body as { email?: string; source?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Forward the per-form source (rumor-gate, footer, culture-dance, home, …) so
  // each capture surface is attributed in Beehiiv instead of a flat label.
  const r = await subscribeToBeehiiv({ email, source: source || "newsletter-form" });

  // Provider not configured yet (skipped) → don't block the visitor.
  // A genuine provider failure → surface it so they can retry. (Already-subscribed
  // is treated as success inside the helper.)
  if (!r.ok && !r.skipped) {
    return NextResponse.json({ error: "Subscription failed — please try again." }, { status: 502 });
  }

  // Reddit Conversions API "SignUp" (server-side). Return the conversion_id so the
  // browser pixel fires with the same id and Reddit dedups the two events.
  const rdtConversionId = randomUUID();
  await sendRedditConversion({ eventType: "SignUp", conversionId: rdtConversionId, email, ...redditSignals(req) });

  return NextResponse.json({ ok: true, rdtConversionId });
}
