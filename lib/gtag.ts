// Thin, safe wrapper over the GA4 gtag() installed in app/layout.tsx (G-700MXJM1FW).
// Never throws and no-ops during SSR / before gtag loads, so callers can fire events
// from any client component without guarding.
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  try {
    w.gtag?.("event", name, params ?? {});
  } catch {
    /* analytics must never break the UI */
  }
}
