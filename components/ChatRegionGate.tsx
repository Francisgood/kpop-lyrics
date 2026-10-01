"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useT } from "@/components/LangProvider";
import { showChatForCountry } from "@/lib/chat-region";

const cacheKey = "aegyo-chat-country";
const cacheLifetimeMs = 60 * 60 * 1000;
let countryRequest: Promise<string | null> | null = null;

function visitorCountry(): Promise<string | null> {
  if (!countryRequest) {
    const request = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch("https://api.country.is/", {
          cache: "no-store",
          credentials: "omit",
          referrerPolicy: "no-referrer",
          signal: controller.signal,
        });
        if (!response.ok) return null;
        const data = await response.json() as { country?: unknown };
        return typeof data.country === "string" ? data.country : null;
      } catch {
        return null;
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    countryRequest = request;
    void request.finally(() => { if (countryRequest === request) countryRequest = null; });
  }
  return countryRequest;
}

export default function ChatRegionGate({ children, fullPage = false }: { children: ReactNode; fullPage?: boolean }) {
  const t = useT();
  const [country, setCountry] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null") as { country?: unknown; expiresAt?: unknown } | null;
      if (cached && typeof cached.country === "string" && typeof cached.expiresAt === "number" && cached.expiresAt > Date.now()) {
        setCountry(cached.country);
        return;
      }
    } catch { /* storage is optional */ }

    void visitorCountry().then((result) => {
      if (!active) return;
      setCountry(result);
      if (result) {
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ country: result, expiresAt: Date.now() + cacheLifetimeMs })); }
        catch { /* storage is optional */ }
      }
    });
    return () => { active = false; };
  }, []);

  if (showChatForCountry(country)) return <>{children}</>;
  if (!fullPage) return null;
  return <main className="chat-page" role="status">
    <div className="chat-page-intro">
      <h1>{t("The fan room", "La sala de fans")}</h1>
      <p>{country === undefined
        ? t("Checking chat availability…", "Comprobando la disponibilidad del chat…")
        : country === null
          ? t("Fan chat is unavailable right now. Please try again later.", "El chat de fans no está disponible en este momento. Vuelve a intentarlo más tarde.")
          : t("Fan chat isn't available in your area right now.", "El chat de fans no está disponible en tu zona por ahora.")}</p>
    </div>
  </main>;
}
