"use client";

import { useState } from "react";
import Link from "next/link";
import { T, LangToggle, useT } from "@/components/LangProvider";

export default function TipsPage() {
  const t = useT();
  const [tip, setTip] = useState("");
  const [artist, setArtist] = useState("");
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(true);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<{ en: string; es: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tip.trim().length < 3 || state === "saving") return;
    setState("saving");
    setErrMsg(null);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip, artist, email, subscribe }),
      });
      if (res.ok) {
        setState("done");
      } else {
        setState("error");
        setErrMsg({ en: "Something went wrong — try again.", es: "Algo salió mal — intenta de nuevo." });
      }
    } catch {
      setState("error");
      setErrMsg({ en: "Something went wrong — try again.", es: "Algo salió mal — intenta de nuevo." });
    }
  }

  const field: React.CSSProperties = { width: "100%", padding: "12px 15px", border: "1px solid var(--border-strong)", borderRadius: 9, fontSize: "0.95rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 };

  return (
    <main style={{ minHeight: "82vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <LangToggle align="center" marginBottom={16} />

        {/* Marquee CTA header — matches the hamburger "GOT A TIP?" energy */}
        <div style={{ textAlign: "center", background: "linear-gradient(90deg, var(--sakura), var(--lavender))", color: "#fff", fontWeight: 900, fontStyle: "italic", fontSize: "1.7rem", letterSpacing: "0.02em", textTransform: "uppercase", padding: "18px 20px", borderRadius: 14, boxShadow: "0 12px 34px rgba(255,111,168,0.28)", marginBottom: 8 }}>
          <T en="Got a Tip?" es="¿Tienes un Chisme?" />
        </div>
        <p style={{ textAlign: "center", color: "var(--ink-dim)", fontSize: "0.95rem", lineHeight: 1.55, margin: "0 0 22px" }}>
          <T
            en="Spill it, bestie. Comebacks, dating rumors, receipts, messy timelines — send us the scoop and stay anonymous if you want. 👀"
            es="Suéltalo, amiga. Comebacks, rumores de romance, pruebas, dramas — mándanos el chisme y quédate anónima si quieres. 👀"
          />
        </p>

        {/* Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "26px 26px 30px", boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
          {state === "done" ? (
            <div style={{ textAlign: "center", padding: "24px 8px" }}>
              <div style={{ fontSize: "2.4rem", marginBottom: 10 }}>💌</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                <T en="Tip received — you're iconic." es="Chisme recibido — eres icónica." />
              </div>
              <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.55, margin: "0 0 20px" }}>
                <T
                  en="Our girlies will look into it. Thanks for keeping the timeline fed. 💜"
                  es="Nuestras amigas lo van a investigar. Gracias por mantener el timeline alimentado. 💜"
                />
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => { setTip(""); setArtist(""); setState("idle"); }} className="btn-yellow" style={{ padding: "11px 20px", fontSize: "0.82rem" }}>
                  <T en="Send another" es="Enviar otro" />
                </button>
                <Link href="/" style={{ padding: "11px 20px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  <T en="Back to the feed" es="Volver al feed" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {errMsg && (
                <div style={{ background: "rgba(255,90,90,0.1)", border: "1px solid rgba(255,90,90,0.35)", borderRadius: 9, padding: "10px 14px", fontSize: "0.85rem", color: "#ff9a9a" }}>
                  <T en={errMsg.en} es={errMsg.es} />
                </div>
              )}

              <div>
                <label style={labelStyle}><T en="The Tip" es="El Chisme" /></label>
                <textarea
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  required
                  rows={5}
                  placeholder={t("What's the scoop? Who, what, when — spill everything…", "¿Cuál es el chisme? Quién, qué, cuándo — suéltalo todo…")}
                  style={{ ...field, resize: "vertical", minHeight: 110, fontFamily: "inherit" }}
                />
              </div>

              <div>
                <label style={labelStyle}><T en="About which artist? (optional)" es="¿Sobre qué artista? (opcional)" /></label>
                <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder={t("e.g. aespa, BTS, Jennie…", "ej. aespa, BTS, Jennie…")} style={field} />
              </div>

              <div>
                <label style={labelStyle}><T en="Your email (optional)" es="Tu correo (opcional)" /></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Leave blank to stay anonymous", "Déjalo vacío para quedar anónima")} style={field} />
              </div>

              {email.trim() && (
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: "0.86rem", color: "var(--ink-dim)", lineHeight: 1.4 }}>
                  <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--sakura)", marginTop: 1, flexShrink: 0, cursor: "pointer" }} />
                  <span><T en="Email me K-pop rumors, gossip & comebacks 💌" es="Envíame chismes, rumores y comebacks de K-pop 💌" /></span>
                </label>
              )}

              <button type="submit" disabled={state === "saving"} className="btn-yellow" style={{ width: "100%", padding: "14px", fontSize: "0.9rem", marginTop: 2, opacity: state === "saving" ? 0.6 : 1 }}>
                {state === "saving" ? <T en="Sending…" es="Enviando…" /> : <T en="SEND THE TIP" es="ENVIAR EL CHISME" />}
              </button>

              <p style={{ fontSize: "0.72rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
                <T
                  en="Tips are reviewed before anything is published. Be accurate — no doxxing, no minors, no harassment."
                  es="Los chismes se revisan antes de publicar nada. Sé precisa — nada de doxxing, ni menores, ni acoso."
                />
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
