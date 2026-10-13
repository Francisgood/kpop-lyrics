"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";

// Back-in-stock popup for a sold-out BABY-T-S product. The shopper picks email
// or phone; whichever tab is active is the only field submitted.

export default function NotifyMeModal({
  product,
  title,
  onClose,
}: {
  product: string;
  title: string;
  onClose: () => void;
}) {
  const { lang } = useLang();
  const es = lang === "es";
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErr(null);
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, [mode]: value }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string; alreadyListed?: boolean };
      if (!res.ok) {
        setErr(d.error ?? (es ? "Algo salió mal. Inténtalo de nuevo." : "Something went wrong. Please try again."));
        setStatus("error");
        return;
      }
      setAlready(Boolean(d.alreadyListed));
      setStatus("ok");
    } catch {
      setErr(es ? "Revisa tu conexión e inténtalo de nuevo." : "Check your connection and try again.");
      setStatus("error");
    }
  }

  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: "0.85rem",
    border: active ? "1px solid var(--sakura)" : "1px solid var(--border-strong)",
    background: active ? "var(--sakura-light)" : "transparent",
    color: active ? "var(--ink)" : "var(--ink-dim)",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={es ? "Avísame cuando esté disponible" : "Notify me when available"}
      style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
      <div
        style={{
          position: "relative", width: "min(440px, 100%)", background: "var(--bg-card)",
          border: "1px solid var(--border-strong)", borderRadius: 16, padding: "28px 26px 26px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        <button
          onClick={onClose}
          aria-label={es ? "Cerrar" : "Close"}
          style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", color: "var(--ink-dim)", fontSize: "1.6rem", cursor: "pointer", lineHeight: 1 }}
        >
          ×
        </button>

        {status === "ok" ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: 10 }}>💜</div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", color: "var(--ink)", margin: "0 0 8px" }}>
              {already
                ? es ? "Ya estabas en la lista" : "You were already on the list"
                : es ? "¡Estás en la lista!" : "You’re on the list!"}
            </h3>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
              {mode === "email"
                ? es ? "Te mandamos un correo apenas vuelva a estar disponible." : "We’ll email you the moment it’s back."
                : es ? "Te mandamos un mensaje apenas vuelva a estar disponible." : "We’ll text you the moment it’s back."}
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 20, padding: "12px 28px", borderRadius: 100, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, cursor: "pointer" }}
            >
              {es ? "Listo" : "Done"}
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", color: "var(--ink)", margin: "0 0 6px", paddingRight: 24 }}>
              {es ? "Avísame cuando esté disponible" : "Notify me when available"}
            </h3>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.9rem", lineHeight: 1.55, margin: "0 0 18px" }}>
              {title}
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button type="button" onClick={() => { setMode("email"); setValue(""); setErr(null); }} style={tab(mode === "email")}>
                {es ? "Correo" : "Email"}
              </button>
              <button type="button" onClick={() => { setMode("phone"); setValue(""); setErr(null); }} style={tab(mode === "phone")}>
                {es ? "Teléfono" : "Phone"}
              </button>
            </div>

            <form onSubmit={submit}>
              <input
                key={mode}
                type={mode === "email" ? "email" : "tel"}
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={mode === "email" ? "your@email.com" : "+1 555 000 1234"}
                disabled={status === "loading"}
                aria-label={mode === "email" ? (es ? "Correo electrónico" : "Email address") : (es ? "Número de teléfono" : "Phone number")}
                style={{ width: "100%", padding: "13px 15px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: "1rem", background: "#fff", color: "#000", boxSizing: "border-box" }}
              />
              {err && <div style={{ color: "#FF8C9B", fontSize: "0.83rem", marginTop: 10 }}>{err}</div>}
              <button
                type="submit"
                disabled={status === "loading"}
                style={{ width: "100%", marginTop: 14, padding: "14px 0", borderRadius: 100, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.95rem", cursor: "pointer" }}
              >
                {status === "loading" ? "…" : es ? "AVÍSAME" : "NOTIFY ME"}
              </button>
            </form>

            <p style={{ color: "var(--ink-faint)", fontSize: "0.75rem", lineHeight: 1.5, margin: "14px 0 0", textAlign: "center" }}>
              {es
                ? "Solo para avisarte del restock. Nada de spam."
                : "Used only to tell you about this restock. No spam."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
