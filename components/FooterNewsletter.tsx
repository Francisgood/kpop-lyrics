"use client";
import { useState } from "react";
import { trackSignup } from "@/lib/conversions";
import { T, useT } from "@/components/LangProvider";

export default function FooterNewsletter() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const t = useT();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErrMsg((d as { error?: string }).error ?? t("Something went wrong.", "Algo salió mal."));
        setStatus("error");
      } else {
        const d = await res.json().catch(() => ({}));
        setStatus("ok");
        setEmail("");
        trackSignup((d as { rdtConversionId?: string }).rdtConversionId);
      }
    } catch {
      setErrMsg(t("Network error — please try again.", "Error de conexión — intenta de nuevo."));
      setStatus("error");
    }
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: "28px 32px",
      maxWidth: 480,
      margin: "0 auto 40px",
    }}>
      <div style={{ fontSize: "0.65rem", color: "var(--genius-yellow)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        <T en="Newsletter" es="Newsletter" />
      </div>
      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", marginBottom: 6 }}>
        <T en="Stay plugged into K-pop" es="Mantente al día con el K-pop" />
      </div>
      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.6 }}>
        <T
          en="New lyrics, artist breakdowns, slang explainers, and chart alerts — straight to your inbox. No spam."
          es="Nuevas letras, análisis de artistas, slang explicado y alertas de charts — directo a tu inbox. Nada de spam."
        />
      </p>

      {status === "ok" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255,215,0,0.12)", border: "1px solid var(--genius-yellow)", borderRadius: 6 }}>
          <span style={{ fontSize: "1.2rem" }}>✓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--genius-yellow)" }}>
              <T en="You’re in!" es="¡Ya estás dentro!" />
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
              <T en="Check your inbox to confirm." es="Revisa tu inbox para confirmar." />
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("your@email.com", "tu@correo.com")}
            aria-label={t("Email address", "Correo electrónico")}
            disabled={status === "loading"}
            style={{
              flex: 1,
              minWidth: 180,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              color: "#fff",
              padding: "10px 14px",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              background: "var(--genius-yellow)",
              color: "var(--on-accent)",
              border: "none",
              borderRadius: 4,
              padding: "10px 20px",
              fontWeight: 800,
              fontSize: "0.78rem",
              letterSpacing: "0.06em",
              cursor: status === "loading" ? "wait" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {status === "loading" ? "…" : t("SUBSCRIBE", "SUSCRIBIRME")}
          </button>
          {status === "error" && (
            <div style={{ width: "100%", fontSize: "0.75rem", color: "#ff6b6b", marginTop: 4 }}>{errMsg}</div>
          )}
        </form>
      )}
    </div>
  );
}
