"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useT } from "@/components/LangProvider";
import { showChatForCountry } from "@/lib/chat-region";

export default function ChatRegionGate({ children, fullPage = false }: { children: ReactNode; fullPage?: boolean }) {
  const t = useT();
  const [country, setCountry] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;
    const refresh = async () => {
      if (document.visibilityState === "hidden" || controller) return;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 4000);
      try {
        const response = await fetch("/api/chat/availability", {
          cache: "no-store", signal: controller.signal,
        });
        const data = response.ok ? await response.json() as { country?: unknown } : null;
        if (active) setCountry(typeof data?.country === "string" ? data.country : null);
      } catch { if (active) setCountry(null); }
      finally { window.clearTimeout(timeout); controller = null; }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  if (country !== undefined && showChatForCountry(country)) return <>{children}</>;
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
