import { NextRequest, NextResponse } from "next/server";

// Geo language router: default Latin-American (and Spanish-speaking) visitors to
// Spanish. Railway doesn't inject a client-country header, so we read one IF the
// infra ever provides it (Cloudflare's cf-ipcountry, Vercel's x-vercel-ip-country,
// etc.) and otherwise fall back to Accept-Language, which is always present and
// already flags most LatAm traffic (devices set to es-* / pt-BR).
//
// This only SEEDS a default (the `aegyo_geo` hint cookie). An explicit toggle
// choice lives in the separate `aegyo-lang` cookie and always wins — the hint
// never overrides it (see components/LangProvider.tsx).

const SPANISH_COUNTRIES = new Set([
  // Latin America (Spanish)
  "MX", "GT", "HN", "SV", "NI", "CR", "PA", "CO", "VE", "EC", "PE", "BO",
  "CL", "AR", "PY", "UY", "DO", "CU", "PR",
  "BR", // Brazil → the site's non-English language is Spanish (better than English for BR)
  "ES", "GQ", // Spain, Equatorial Guinea (Spanish-speaking)
]);

function countryHeader(req: NextRequest): string | null {
  const h = req.headers;
  const c =
    h.get("cf-ipcountry") ||          // Cloudflare
    h.get("x-vercel-ip-country") ||   // Vercel
    h.get("x-country") ||
    h.get("x-geo-country") ||
    h.get("x-appengine-country");     // GCP
  return c ? c.trim().toUpperCase() : null;
}

function langFromAcceptLanguage(al: string | null): "es" | "en" | null {
  if (!al) return null;
  const first = al.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("es")) return "es"; // Spanish (es-MX, es-AR, es-419, es-ES…)
  if (first.startsWith("pt")) return "es"; // Portuguese (Brazil) → site's Spanish
  return null;
}

export function middleware(req: NextRequest) {
  // Respect any prior decision — an explicit choice or an already-seeded hint.
  if (req.cookies.get("aegyo-lang") || req.cookies.get("aegyo_geo")) {
    return NextResponse.next();
  }

  const country = countryHeader(req);
  const lang: "es" | "en" | null = country
    ? SPANISH_COUNTRIES.has(country) ? "es" : "en"
    : langFromAcceptLanguage(req.headers.get("accept-language"));

  const res = NextResponse.next();
  if (lang) {
    res.cookies.set("aegyo_geo", lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // 180 days
      sameSite: "lax",
    });
  }
  return res;
}

// Run on page navigations only — skip static assets, the image optimizer, and APIs.
export const config = {
  matcher: ["/((?!_next|api|.*\\.[a-zA-Z0-9]+$).*)"],
};
