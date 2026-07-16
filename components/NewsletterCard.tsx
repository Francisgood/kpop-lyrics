"use client";

import { useState } from "react";
import { trackSignup } from "@/lib/conversions";
import { T, useT } from "@/components/LangProvider";

export default function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const t = useT();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("saving");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "culture-dance" }),
      });
      const d = res.ok ? await res.json().catch(() => ({})) : null;
      setState(res.ok ? "done" : "error");
      if (res.ok) trackSignup((d as { rdtConversionId?: string } | null)?.rdtConversionId);
    } catch {
      setState("error");
    }
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 20, padding: "34px 28px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ff6fa8", fontWeight: 700, marginBottom: 10 }}>
        <T en="Stay in the Loop" es="No te pierdas nada" />
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "#15131f", marginBottom: 6 }}>
        <T en="K-pop news, straight to you." es="Noticias K-pop, directo a tu correo." />
      </div>
      <p style={{ color: "#6b6b72", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 18px" }}>
        <T
          en="New lyrics, artist breakdowns, slang drops, and chart alerts. No spam. Just K-pop."
          es="Nuevas letras, análisis de artistas, slang fresquito y alertas de charts. Nada de spam. Puro K-pop."
        />
      </p>
      {state === "done" ? (
        <div style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.95rem" }}>
          <T en="✓ You’re on the list — see you in your inbox!" es="✓ ¡Ya estás en la lista — nos vemos en tu inbox!" />
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 460, margin: "0 auto" }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("you@email.com", "tu@correo.com")}
            aria-label={t("Email address", "Correo electrónico")}
            style={{ flex: "1 1 220px", minWidth: 0, padding: "12px 16px", borderRadius: 100, border: "1px solid #e2e2e8", fontSize: "0.95rem", color: "#15131f", background: "#fbfafc" }}
          />
          <button type="submit" disabled={state === "saving"} style={{ padding: "12px 22px", borderRadius: 100, border: "none", background: "#ff6fa8", color: "#fff", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", opacity: state === "saving" ? 0.6 : 1 }}>
            {state === "saving" ? t("Subscribing…", "Suscribiendo…") : t("Subscribe — It’s Free", "Suscríbete — Es Gratis")}
          </button>
        </form>
      )}
      {state === "error" && (
        <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: 8 }}>
          <T en="Something went wrong — try again." es="Algo salió mal — intenta de nuevo." />
        </div>
      )}
      <div style={{ fontSize: "0.78rem", color: "#9a9aa6", marginTop: 14 }}>
        <T en="Join 40,000+ fans already on the list." es="Únete a más de 40,000 fans que ya están en la lista." />
      </div>
    </div>
  );
}
