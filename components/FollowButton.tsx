"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T, useLang, useT } from "@/components/LangProvider";

export default function FollowButton({
  targetSlug,
  baseFollowers,
  isLoggedIn,
  displayName,
}: {
  targetSlug: string;
  baseFollowers: number;
  isLoggedIn: boolean;
  displayName: string;
}) {
  const [following, setFollowing] = useState(false);
  const [realCount, setRealCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [gate, setGate] = useState(false);
  const { lang } = useLang();
  const t = useT();

  useEffect(() => {
    fetch(`/api/follow?targetSlug=${encodeURIComponent(targetSlug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.followers === "number") setRealCount(d.followers);
        setFollowing(Boolean(d.following));
      })
      .catch(() => {});
  }, [targetSlug]);

  async function toggle() {
    if (!isLoggedIn) {
      setGate(true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSlug }),
      });
      const d = await res.json();
      if (res.ok) {
        setFollowing(Boolean(d.following));
        if (typeof d.followers === "number") setRealCount(d.followers);
      }
    } catch {
      /* leave state unchanged */
    } finally {
      setBusy(false);
    }
  }

  const total = baseFollowers + realCount;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        style={{
          padding: "11px 26px",
          borderRadius: 100,
          fontWeight: 800,
          fontSize: "0.9rem",
          cursor: busy ? "wait" : "pointer",
          border: following ? "1px solid var(--border-strong)" : "1px solid var(--sakura)",
          background: following ? "transparent" : "var(--sakura)",
          color: following ? "var(--ink-dim)" : "var(--on-accent)",
        }}
      >
        {following ? t("Following ✓", "Siguiendo ✓") : t("+ Follow", "+ Seguir")}
      </button>
      <span style={{ fontSize: "0.9rem", color: "var(--ink-dim)" }}>
        <strong style={{ color: "var(--ink)" }}>{total.toLocaleString(lang === "es" ? "es-419" : "en-US")}</strong>{" "}
        <T en="followers" es="seguidores" />
      </span>

      {gate && (
        <div onClick={() => setGate(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(380px, 94vw)", background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "32px 28px", textAlign: "center", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
            <button type="button" onClick={() => setGate(false)} aria-label={t("Close", "Cerrar")} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "var(--ink-faint)", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer" }}>×</button>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
              <T en="Set up a profile to follow" es="Crea un perfil para seguir" />
            </div>
            <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 24 }}>
              <T
                en={`Create a free Aegyo Arena profile to follow ${displayName}, build your own contributor page, and earn Daebak Rewards.`}
                es={`Crea un perfil gratis en Aegyo Arena para seguir a ${displayName}, armar tu propia página de colaborador y ganar Daebak Rewards.`}
              />
            </div>
            <Link href="/signup" style={{ display: "block", padding: "13px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none", marginBottom: 14 }}>
              <T en="Set up my profile" es="Crear mi perfil" />
            </Link>
            <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)" }}>
              <T en="Already a member?" es="¿Ya eres miembro?" />{" "}
              <Link href="/login" style={{ color: "var(--sakura)", fontWeight: 700 }}>
                <T en="Sign in" es="Inicia sesión" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
