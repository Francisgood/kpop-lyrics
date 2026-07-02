// Unified paid-ads conversion tracking — fires every ad pixel for a conversion so
// call sites don't need to know which pixels exist. Browser-only (no-op on server).
// Pixels: Taboola (account 2066412) + Reddit (a2_j9m653pqhzu7), loaded in app/layout.tsx.
function taboola(name: string): void {
  const w = window as unknown as { _tfa?: Array<Record<string, unknown>> };
  w._tfa = w._tfa || [];
  w._tfa.push({ notify: "event", name, id: 2066412 });
}

function reddit(name: string): void {
  const w = window as unknown as { rdt?: (...args: unknown[]) => void };
  if (typeof w.rdt === "function") w.rdt("track", name);
}

/** Newsletter subscribe conversion (Taboola "signup" / Reddit "SignUp"). */
export function trackSignup(): void {
  if (typeof window === "undefined") return;
  taboola("signup");
  reddit("SignUp");
}

/** BTS giveaway entry conversion (Taboola "lead" / Reddit "Lead"). */
export function trackLead(): void {
  if (typeof window === "undefined") return;
  taboola("lead");
  reddit("Lead");
}
