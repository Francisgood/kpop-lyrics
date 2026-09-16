// Overridable so the registration flow can be exercised against a local stub in
// development without touching the live publication.
const BEEHIIV_API = process.env.BEEHIIV_API_BASE ?? "https://api.beehiiv.com/v2";

type SubscribeResult = { ok: boolean; status: number; skipped?: boolean; error?: string; subscriptionId?: string };

/** True when the publication credentials are present, so callers can report why a sync no-opped. */
export function beehiivConfigured(): boolean {
  return !!(process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID);
}

type CustomField = { name: string; value: string };

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
  campaign?: string;
  sendWelcome?: boolean;
  /** Custom fields must already exist on the publication; see the retry note below. */
  customFields?: CustomField[];
}): Promise<SubscribeResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const email = opts.email.trim().toLowerCase();

  if (!apiKey || !pubId) {
    console.warn(`[beehiiv] not configured — skipped subscribe for ${email}`);
    return { ok: false, status: 0, skipped: true };
  }

  const payload = (withFields: boolean) => ({
    email,
    reactivate_existing: true,
    send_welcome_email: opts.sendWelcome ?? true,
    utm_source: opts.source ?? "aegyoarena",
    utm_medium: "website",
    ...(opts.campaign ? { utm_campaign: opts.campaign } : {}),
    referring_site: "https://www.aegyoarena.com",
    ...(withFields && opts.customFields?.length ? { custom_fields: opts.customFields } : {}),
  });

  const post = async (withFields: boolean) =>
    fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload(withFields)),
    });

  try {
    let res = await post(true);
    let txt = res.ok ? "" : await res.text().catch(() => "");

    // beehiiv rejects custom fields that haven't been created on the publication.
    // Getting the subscriber in matters more than the metadata, so drop the fields
    // and try once more rather than losing the sign-up.
    if (!res.ok && res.status === 400 && opts.customFields?.length && /custom.?field/i.test(txt)) {
      console.warn(`[beehiiv] custom fields rejected, retrying without them: ${txt}`);
      res = await post(false);
      txt = res.ok ? "" : await res.text().catch(() => "");
    }

    if (res.ok) {
      const body = await res.json().catch(() => null) as { data?: { id?: string } } | null;
      return { ok: true, status: res.status, subscriptionId: body?.data?.id };
    }

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

/**
 * Look an address up in the publication. Used by the registration sync to report
 * who actually landed in beehiiv rather than trusting the write path's own record.
 */
export async function findBeehiivSubscription(email: string): Promise<{ found: boolean; status?: string; id?: string; skipped?: boolean }> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) return { found: false, skipped: true };
  try {
    const url = `${BEEHIIV_API}/publications/${pubId}/subscriptions/by_email/${encodeURIComponent(email.trim().toLowerCase())}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (res.status === 404) return { found: false };
    if (!res.ok) return { found: false };
    const body = await res.json().catch(() => null) as { data?: { id?: string; status?: string } } | null;
    return { found: !!body?.data, id: body?.data?.id, status: body?.data?.status };
  } catch {
    return { found: false };
  }
}

/**
 * Drop a subscriber into a beehiiv automation (the welcome/onboarding journey).
 * No-ops unless BEEHIIV_EVENT_AUTOMATION_ID is set, so the flow works with or
 * without an automation configured on the publication.
 */
export async function enrollInBeehiivAutomation(email: string, automationId?: string): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const id = automationId ?? process.env.BEEHIIV_EVENT_AUTOMATION_ID;
  if (!apiKey || !pubId || !id) return { ok: false, skipped: true };
  try {
    const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/automations/${id}/journeys`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    if (res.ok) return { ok: true };
    const txt = await res.text().catch(() => "");
    // Already on the journey is not a failure.
    if (/already|duplicate/i.test(txt)) return { ok: true };
    console.error(`[beehiiv] automation enroll failed ${res.status}: ${txt}`);
    return { ok: false, error: txt || `status ${res.status}` };
  } catch (e) {
    console.error("[beehiiv] automation enroll error:", e);
    return { ok: false, error: String(e) };
  }
}

/** Remove a subscription entirely — used to undo a test sign-up, not to unsubscribe people. */
export async function deleteBeehiivSubscription(email: string): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) return { ok: false, skipped: true };
  const found = await findBeehiivSubscription(email);
  if (!found.found || !found.id) return { ok: true };
  try {
    const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions/${found.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok || res.status === 404) return { ok: true };
    const txt = await res.text().catch(() => "");
    return { ok: false, error: txt || `status ${res.status}` };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
