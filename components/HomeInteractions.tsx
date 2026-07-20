"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";

export default function HomeInteractions() {
  const { lang } = useLang();
  const es = lang === "es";
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  // Drag-to-scroll for the merch strip
  useEffect(() => {
    const scroll = document.getElementById("merchScroll");
    if (!scroll) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    const down = (e: MouseEvent) => { isDown = true; scroll.style.cursor = "grabbing"; startX = e.pageX - scroll.offsetLeft; scrollLeft = scroll.scrollLeft; };
    const leave = () => { isDown = false; scroll.style.cursor = "grab"; };
    const up = () => { isDown = false; scroll.style.cursor = "grab"; };
    const move = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - scroll.offsetLeft; scroll.scrollLeft = scrollLeft - (x - startX) * 1.2; };
    scroll.addEventListener("mousedown", down);
    scroll.addEventListener("mouseleave", leave);
    scroll.addEventListener("mouseup", up);
    scroll.addEventListener("mousemove", move);
    return () => {
      scroll.removeEventListener("mousedown", down);
      scroll.removeEventListener("mouseleave", leave);
      scroll.removeEventListener("mouseup", up);
      scroll.removeEventListener("mousemove", move);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home-hero" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErrMsg((d as { error?: string }).error ?? (es ? "Algo salió mal." : "Something went wrong."));
        setStatus("error");
      } else {
        setStatus("ok");
        setEmail("");
      }
    } catch {
      setErrMsg(es ? "Error de red — inténtalo de nuevo." : "Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="nl-form">
        <div style={{ background: "var(--sakura-light)", border: "1px solid rgba(255,111,168,0.35)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.4rem" }}>✓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--sakura)" }}>{es ? "¡Ya estás dentro!" : "You’re in!"}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)" }}>{es ? "Revisa tu correo para confirmar." : "Check your inbox to confirm."}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="nl-form" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="nl-input"
        placeholder={es ? "tu@correo.com" : "your@email.com"}
        disabled={status === "loading"}
      />
      <button className="nl-btn" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "…" : es ? "Suscríbete — Es Gratis" : "Subscribe — It's Free"}
      </button>
      <p className="nl-note">
        {status === "error"
          ? <span style={{ color: "#ff8fb0" }}>{errMsg}</span>
          : es ? "Nada de spam. Cancela cuando quieras. Respetamos tu bandeja." : "No spam. Unsubscribe anytime. We respect your inbox."}
      </p>
    </form>
  );
}
