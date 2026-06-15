import { NextRequest, NextResponse } from "next/server";
import { subscribeToBeehiiv } from "@/lib/beehiiv";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email } = body as { email?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const r = await subscribeToBeehiiv({ email, source: "newsletter-form" });

  // Provider not configured yet (skipped) → don't block the visitor.
  // A genuine provider failure → surface it so they can retry. (Already-subscribed
  // is treated as success inside the helper.)
  if (!r.ok && !r.skipped) {
    return NextResponse.json({ error: "Subscription failed — please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
