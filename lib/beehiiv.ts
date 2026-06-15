const BEEHIIV_API = "https://api.beehiiv.com/v2";

type SubscribeResult = { ok: boolean; status: number; skipped?: boolean; error?: string };

/**
 * Add an email to the beehiiv publication and (by default) trigger beehiiv's
 * configured welcome email via `send_welcome_email`.
 *
 * Best-effort and never throws: if BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID are
 * not set it no-ops with { skipped: true } so the calling flow (newsletter form,
 * giveaway entry) still succeeds. Genuine API failures are logged as [beehiiv].
 */
export async function subscribeToBeehiiv(opts: {
  email: string;
  source?: string;
  sendWelcome?: boolean;
}): Promise<SubscribeResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const email = opts.email.trim().toLowerCase();

  if (!apiKey || !pubId) {
    console.warn(`[beehiiv] not configured — skipped subscribe for ${email}`);
    return { ok: false, status: 0, skipped: true };
  }

  try {
    const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: opts.sendWelcome ?? true,
        utm_source: opts.source ?? "aegyoarena",
        utm_medium: "website",
        referring_site: "https://www.aegyoarena.com",
      }),
    });

    if (res.ok) return { ok: true, status: res.status };

    const txt = await res.text().catch(() => "");
    // An already-subscribed email is a success from the visitor's point of view.
    if ((res.status === 400 || res.status === 409) && /already|exist/i.test(txt)) {
      return { ok: true, status: res.status };
    }
    console.error(`[beehiiv] subscribe failed ${res.status}: ${txt}`);
    return { ok: false, status: res.status, error: txt || `status ${res.status}` };
  } catch (e) {
    console.error("[beehiiv] subscribe error:", e);
    return { ok: false, status: 0, error: String(e) };
  }
}
