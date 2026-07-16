"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";

export default function RestockAlert() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  // Stored as a kind rather than a rendered string so the message re-renders in
  // the right language if the user flips the toggle after an error.
  const [err, setErr] = useState<{ kind: "generic" | "network" } | { kind: "server"; text: string } | null>(null);
  const [already, setAlready] = useState(false);
  const { lang } = useLang();
  const es = lang === "es";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErr(null);
    try {
      const res = await fetch("/api/restock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        const serverText = (d as { error?: string }).error;
        setErr(serverText ? { kind: "server", text: serverText } : { kind: "generic" });
        setStatus("error");
        return;
      }
      setAlready(Boolean((d as { alreadyListed?: boolean }).alreadyListed));
      setStatus("ok");
    } catch {
      setErr({ kind: "network" });
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 12, padding: "18px 22px", maxWidth: 460, margin: "0 auto" }}>
        <span style={{ fontSize: "1.5rem" }}>💜</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "0.98rem" }}>
            {already
              ? (es ? "¡Ya estás en la lista!" : "You’re already on the list!")
              : (es ? "¡Estás en la lista!" : "You’re on the list!")}
          </div>
          <div style={{ color: "var(--ink-dim)", fontSize: "0.85rem", marginTop: 2 }}>
            {es
              ? "Te mandamos un correo apenas vuelvan a estar disponibles."
              : "We’ll email you the moment these drop back in stock."}
          </div>
        </div>
      </div>
    );
  }

  const input: React.CSSProperties = {
    flex: 1, minWidth: 200, padding: "13px 16px", border: "1px solid var(--border-strong)",
    borderRadius: 8, fontSize: "1rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box",
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 460, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === "loading"}
          aria-label={es ? "Correo electrónico" : "Email address"}
          style={input}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{ padding: "13px 24px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.02em", cursor: status === "loading" ? "wait" : "pointer", whiteSpace: "nowrap" }}
        >
          {status === "loading" ? "…" : es ? "Avísame" : "Notify me"}
        </button>
      </div>
      {status === "error" && err && (
        <div role="alert" style={{ marginTop: 10, fontSize: "0.85rem", color: "#ff5a5a", fontWeight: 600 }}>
          {err.kind === "server"
            ? err.text
            : err.kind === "network"
              ? (es ? "Error de red — inténtalo de nuevo." : "Network error — please try again.")
              : (es ? "Algo salió mal. Inténtalo de nuevo." : "Something went wrong. Please try again.")}
        </div>
      )}
      <p style={{ marginTop: 12, fontSize: "0.76rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
        {es
          ? "Un solo correo cuando haya restock — nada de spam. Puedes darte de baja cuando quieras."
          : "One email when we restock — no spam. You can unsubscribe anytime."}
      </p>
    </form>
  );
}
