// Unified paid-ads conversion tracking — fires every ad pixel for a conversion so
// call sites don't need to know which pixels exist. Browser-only (no-op on server).
// Pixels loaded in app/layout.tsx: GA4 (gtag, G-700MXJM1FW), Taboola (_tfa, 2066412),
// Reddit (rdt, a2_j9m653pqhzu7), TikTok (ttq, D9AFTIJC77U1026600GG).
// The optional conversionId (minted server-side and returned by the API route) is
// passed to the Reddit pixel so it dedups against the Reddit Conversions API event.
function taboola(name: string): void {
  const w = window as unknown as { _tfa?: Array<Record<string, unknown>> };
  w._tfa = w._tfa || [];
  w._tfa.push({ notify: "event", name, id: 2066412 });
}

function reddit(name: string, opts?: string | Record<string, unknown>): void {
  const w = window as unknown as { rdt?: (...args: unknown[]) => void };
  if (typeof w.rdt !== "function") return;
  if (typeof opts === "string") w.rdt("track", name, { conversion_id: opts, conversionId: opts });
  else if (opts) w.rdt("track", name, opts);
  else w.rdt("track", name);
}

function gtag(event: string, params?: Record<string, unknown>): void {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", event, params ?? {});
}

function tiktok(event: string, params?: Record<string, unknown>): void {
  const w = window as unknown as { ttq?: { track?: (...args: unknown[]) => void } };
  if (!w.ttq || typeof w.ttq.track !== "function") return;
  w.ttq.track(event, params ?? {});
}

/** Newsletter subscribe conversion (Taboola "signup" / Reddit "SignUp"). */
export function trackSignup(conversionId?: string): void {
  if (typeof window === "undefined") return;
  taboola("signup");
  reddit("SignUp", conversionId);
}

/** BTS giveaway entry conversion (Taboola "lead" / Reddit "Lead"). */
export function trackLead(conversionId?: string): void {
  if (typeof window === "undefined") return;
  taboola("lead");
  reddit("Lead", conversionId);
}

// ── Auth-page conversions: GA4 + Reddit + TikTok + Taboola ───────────────────
// Each function fires the same intent to all four platforms. To make them count as
// conversions you must also designate these event names in each dashboard:
//   • GA4:     mark `sign_up`, `login`, `signup_page_view`, `login_page_view` as Key events
//   • Reddit:  `SignUp` + Custom "Login" + `ViewContent` → set as conversion goals
//   • TikTok:  `CompleteRegistration`, `Login`, `ViewContent` in Events Manager
//   • Taboola: define events `complete_registration`, `login`, `signup_page_view`,
//              `login_page_view` as conversions (account 2066412)

/** Viewed the /signup page. */
export function trackSignupPageView(): void {
  if (typeof window === "undefined") return;
  gtag("signup_page_view", { page: "/signup" });
  reddit("ViewContent", { content_name: "signup" });
  tiktok("ViewContent", { content_type: "product", content_id: "signup" });
  taboola("signup_page_view");
}

/** Viewed the /login page. */
export function trackLoginPageView(): void {
  if (typeof window === "undefined") return;
  gtag("login_page_view", { page: "/login" });
  reddit("ViewContent", { content_name: "login" });
  tiktok("ViewContent", { content_type: "product", content_id: "login" });
  taboola("login_page_view");
}

/** Successful account creation on /signup (GA4 recommended `sign_up`). */
export function trackAccountCreated(): void {
  if (typeof window === "undefined") return;
  gtag("sign_up", { method: "email" });
  reddit("SignUp");
  tiktok("CompleteRegistration");
  taboola("complete_registration");
}

/** Successful sign-in on /login (GA4 recommended `login`). */
export function trackLoginSuccess(): void {
  if (typeof window === "undefined") return;
  gtag("login", { method: "email" });
  reddit("Custom", { customEventName: "Login" });
  tiktok("Login");
  taboola("login");
}
