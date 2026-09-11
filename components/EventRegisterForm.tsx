"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/LangProvider";

/**
 * Registration for an event Aegyo Arena hosts. Attending requires registering
 * here — the form is the page's primary call to action.
 *
 * The mailing-list checkbox is opt-IN and ships UNCHECKED: the API only accepts
 * `optIn === true`, so nobody is subscribed by a default, a stale value or a
 * missing field. Registering and joining the list are two separate decisions.
 */
export default function EventRegisterForm({ slug, spotsNote }: { slug: string; spotsNote?: boolean }) {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/events/register?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (live && d && typeof d.count === "number") setCount(d.count); })
      .catch(() => { /* count is decoration — a failure just hides it */ });
    return () => { live = false; };
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes("@")) return;
    setState("saving");
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, email, optIn }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
        setMsg(d.alreadyRegistered
          ? t("You were already on the list — we've updated your details.", "Ya estabas en la lista — actualizamos tus datos.")
          : "");
        if (typeof d.count === "number") setCount(d.count);
      } else {
        setState("error");
        setMsg(String(d.error ?? t("Something went wrong. Please try again.", "Algo salió mal. Inténtalo de nuevo.")));
      }
    } catch {
      setState("error");
      setMsg(t("Something went wrong. Please try again.", "Algo salió mal. Inténtalo de nuevo."));
    }
  }

  const field: React.CSSProperties = {
    width: "100%", padding: "11px 13px", borderRadius: 5, border: "1px solid var(--border-strong)",
    background: "var(--bg)", color: "var(--ink)", fontSize: ".92rem", fontFamily: "inherit", marginBottom: 9,
  };

  if (state === "done") {
    return (
      <div style={{ border: "1px solid var(--sakura)", borderRadius: 8, padding: "18px 18px 20px", background: "rgba(255,111,168,0.10)" }}>
        <div style={{ fontWeight: 900, color: "var(--ink)", fontSize: "1.02rem", marginBottom: 6 }}>
          {t("You're registered ✓", "Estás registrado ✓")}
        </div>
        <p style={{ fontSize: ".88rem", lineHeight: 1.6, color: "var(--ink-dim)", margin: 0 }}>
          {msg || t("See you under the arch. Bring a friend — they need to register too.",
                    "Nos vemos bajo el arco. Trae a alguien — también tiene que registrarse.")}
        </p>
        {count !== null && (
          <div style={{ marginTop: 10, fontSize: ".8rem", fontWeight: 800, color: "var(--sakura)" }}>
            {count} {count === 1 ? t("person registered", "persona registrada") : t("people registered", "personas registradas")}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div style={{ fontSize: ".62rem", fontWeight: 900, letterSpacing: ".13em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>
        {t("Register to attend", "Regístrate para asistir")}
      </div>

      <label>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{t("Your name", "Tu nombre")}</span>
        <input style={field} value={name} onChange={(e) => setName(e.target.value)} required
               placeholder={t("Your name", "Tu nombre")} autoComplete="name" />
      </label>
      <label>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{t("Email address", "Correo electrónico")}</span>
        <input style={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
               placeholder={t("you@email.com", "tu@correo.com")} autoComplete="email" />
      </label>

      {/* Opt-in, unchecked by default — consent is a deliberate act, not a default. */}
      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", cursor: "pointer", margin: "4px 0 13px" }}>
        <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)}
               style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--sakura)", flexShrink: 0 }} />
        <span style={{ fontSize: ".8rem", lineHeight: 1.5, color: "var(--ink-dim)" }}>
          {t("Email me occasionally about future events and promotions on Aegyo Arena.",
             "Envíenme correos ocasionales sobre futuros eventos y promociones de Aegyo Arena.")}
        </span>
      </label>

      <button type="submit" disabled={state === "saving"}
        style={{ width: "100%", padding: "13px 18px", borderRadius: 5, border: 0, background: "var(--sakura)",
                 color: "#1B2027", fontWeight: 900, fontSize: ".95rem", fontFamily: "inherit",
                 cursor: state === "saving" ? "default" : "pointer", opacity: state === "saving" ? 0.6 : 1 }}>
        {state === "saving" ? t("Registering…", "Registrando…") : t("Register — it's free", "Regístrate — es gratis")}
      </button>

      {state === "error" && (
        <div style={{ marginTop: 9, fontSize: ".82rem", color: "#FF8C42", fontWeight: 700 }}>{msg}</div>
      )}

      <div style={{ marginTop: 10, fontSize: ".74rem", lineHeight: 1.55, color: "var(--ink-faint)" }}>
        {spotsNote !== false && t("Free to attend, but registration is required so we know how many to expect.",
                                  "Asistir es gratis, pero el registro es obligatorio para saber cuántos esperar.")}
        {count !== null && count > 0 && (
          <> {" · "}<span style={{ color: "var(--sakura)", fontWeight: 800 }}>
            {count} {count === 1 ? t("registered", "registrado") : t("registered", "registrados")}
          </span></>
        )}
      </div>
    </form>
  );
}
