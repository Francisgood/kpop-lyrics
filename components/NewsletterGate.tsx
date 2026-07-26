"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";

// "Subscribe to keep reading" gate shown over the 3rd (blurred) article. Submits to
// /api/newsletter, which subscribes the email to the Beehiiv list.
export default function NewsletterGate({ source = "article-gate" }: { source?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      setState(res.ok ? "done" : "error");
    } catch { setState("error"); }
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "3px solid var(--sakura)", borderRadius: 18, padding: "30px 26px", textAlign: "center", boxShadow: "0 -18px 40px -18px rgba(255,111,168,0.25)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 8 }}>
        {es ? "Sigue leyendo" : "Keep reading"}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.5rem, 6vw, 2rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.15, marginBottom: 8 }}>
        {es ? "Suscríbete para seguir leyendo — es gratis" : "Subscribe to keep reading — it's free"}
      </div>
      <p style={{ fontSize: "0.92rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 auto 18px", maxWidth: 440 }}>
        {es
          ? "El feed de K-pop directo a tu correo: noticias, chismes, comebacks y charts. Sin spam."
          : "The K-pop feed straight to your inbox — news, gossip, comebacks & charts. No spam, just K-pop."}
      </p>
      {state === "done" ? (
        <div style={{ color: "var(--volt)", fontWeight: 700, fontSize: "1rem" }}>
          {es ? "✓ ¡Listo! Revisa tu correo. 💜" : "✓ You're in! Check your inbox. 💜"}
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 460, margin: "0 auto" }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={es ? "tu@correo.com" : "your@email.com"} aria-label={es ? "Correo electrónico" : "Email address"}
            style={{ flex: "1 1 220px", minWidth: 0, padding: "13px 16px", borderRadius: 100, border: "1px solid var(--border-strong)", background: "#fff", color: "#000", fontSize: "0.95rem", outline: "none" }} />
          <button type="submit" disabled={state === "loading"}
            style={{ padding: "13px 26px", borderRadius: 100, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.03em", textTransform: "uppercase", cursor: "pointer" }}>
            {state === "loading" ? "…" : es ? "Suscribirme" : "Subscribe"}
          </button>
          {state === "error" && (
            <div style={{ flexBasis: "100%", color: "#FF7A7A", fontSize: "0.82rem", marginTop: 4 }}>
              {es ? "Algo salió mal. Intenta de nuevo." : "Something went wrong — please try again."}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
