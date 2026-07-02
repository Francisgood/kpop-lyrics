import type { NextRequest } from "next/server";
import crypto from "crypto";

// Reddit Conversions API (server-to-server) — complements the browser pixel.
// The shared conversion_id dedups the pixel + CAPI events on Reddit's side.
// Endpoint + schema validated live against the v2.0 API (test_mode returns 200).
const PIXEL_ID = "a2_j9m653pqhzu7";
const ENDPOINT = `https://ads-api.reddit.com/api/v2.0/conversions/events/${PIXEL_ID}`;

const sha256 = (s: string) => crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

// Attribution signals available server-side (Reddit needs ≥1; hashed email is our primary).
export function redditSignals(req: NextRequest): { clickId: string | null; ipAddress: string | null; userAgent: string | null } {
  return {
    clickId: req.cookies.get("rdt_cid")?.value ?? null,
    ipAddress: (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
    userAgent: req.headers.get("user-agent") || null,
  };
}

type Conversion = {
  eventType: "SignUp" | "Lead" | "Purchase" | "PageVisit";
  conversionId: string;
  email?: string | null;
  clickId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

// Best-effort: never throws; no-ops (with a warning) if the token isn't configured,
// so the calling flow (newsletter / giveaway) never breaks on a tracking failure.
export async function sendRedditConversion(c: Conversion): Promise<void> {
  const token = process.env.REDDIT_CONVERSIONS_TOKEN;
  if (!token) {
    console.warn("[reddit-capi] REDDIT_CONVERSIONS_TOKEN not set — skipped");
    return;
  }
  const user: Record<string, string> = {};
  if (c.email) user.email = sha256(c.email);
  if (c.ipAddress) user.ip_address = sha256(c.ipAddress);
  if (c.userAgent) user.user_agent = c.userAgent; // sent in the clear per Reddit spec
  const event: Record<string, unknown> = {
    event_at: new Date().toISOString(),
    event_type: { tracking_type: c.eventType },
    event_metadata: { conversion_id: c.conversionId },
    user,
  };
  if (c.clickId) event.click_id = c.clickId;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ test_mode: false, events: [event] }),
    });
    if (!res.ok) console.error(`[reddit-capi] ${c.eventType} failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  } catch (e) {
    console.error("[reddit-capi] error:", e);
  }
}
