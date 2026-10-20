import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { showChatForCountry } from "./chat-region";

const cache = new Map<string, { country: string | null; expiresAt: number }>();
const pending = new Map<string, Promise<string | null>>();
const MAX_CACHE = 2000;

/** Only trust Railway's overwritten header after verifying the deployed proxy path. */
export function chatClientIp(headers: Headers): string | null {
  if (process.env.AEGYO_CHAT_RAILWAY_IP_VERIFIED !== "true") return null;
  const ip = headers.get("x-real-ip");
  return ip && isIP(ip) ? ip : null;
}

export async function chatCountry(headers: Headers): Promise<string | null> {
  const ip = chatClientIp(headers);
  if (!ip) return null;
  const hit = cache.get(ip);
  if (hit && hit.expiresAt > Date.now()) return hit.country;
  const running = pending.get(ip);
  if (running) return running;
  const lookup = (async () => {
    let country: string | null = null;
    try {
      // Same provider previously used by the web client; never forward cookies or credentials.
      const response = await fetch(`https://api.country.is/${encodeURIComponent(ip)}`, {
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(2000),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json() as { country?: unknown };
        if (typeof data.country === "string" && /^[A-Z]{2}$/.test(data.country)) country = data.country;
      }
    } catch { /* Owner decision: unknown country is allowed. */ }
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
    cache.set(ip, { country, expiresAt: Date.now() + (country ? 60_000 : 5000) });
    return country;
  })();
  pending.set(ip, lookup);
  try { return await lookup; } finally { pending.delete(ip); }
}

export async function chatRegionDenial(request: Request): Promise<NextResponse | null> {
  const country = await chatCountry(request.headers);
  if (showChatForCountry(country)) return null;
  return NextResponse.json({
    code: "chat_region_restricted", error: "Fan chat isn't available in your area right now.",
  }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
}
