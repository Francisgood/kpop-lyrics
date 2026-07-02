// Fire a Taboola conversion event. The base pixel in the root layout loads the
// _tfa queue; these push named conversion events onto it (browser-only, no-op on
// the server). Account id must match the pixel in app/layout.tsx.
const TABOOLA_ID = 2066412;

export function taboolaEvent(name: string): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { _tfa?: Array<Record<string, unknown>> };
  w._tfa = w._tfa || [];
  w._tfa.push({ notify: "event", name, id: TABOOLA_ID });
}
