"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { T, LangToggle, useT } from "@/components/LangProvider";

interface Props {
  isLoggedIn: boolean;
  displayName?: string;
  userId?: string;
}

type Sub = { en: string; es: string; href: string };
type NavItem = { en: string; es: string; href: string; subs?: Sub[] };

// Big TMZ-style categories. Each points at its category page; `subs` deep-link
// into the various parts of that section.
const NAV: NavItem[] = [
  {
    en: "News", es: "Noticias", href: "/",
    subs: [
      { en: "Charts & Signals", es: "Charts y Señales", href: "/news" },
      { en: "Artists",          es: "Artistas",         href: "/artists" },
      { en: "Events",           es: "Eventos",          href: "/events" },
    ],
  },
  { en: "Slang",   es: "Jerga",   href: "/korean-slang" },
  { en: "Mukbang", es: "Mukbang", href: "/culture/mukbang" },
  { en: "Dance",   es: "Baile",   href: "/culture/dance" },
  {
    en: "Games", es: "Juegos", href: "/quiz",
    subs: [
      { en: "Leaderboard", es: "Ranking",   href: "/leaderboard" },
      { en: "Rewards",     es: "Recompensas", href: "/daebak-rewards" },
    ],
  },
];

export default function HamburgerMenu({ isLoggedIn, displayName, userId }: Props) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const close = () => setOpen(false);

  // Lock body scroll + close on Escape while the full-screen menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t("Open menu", "Abrir menú")}
        style={{
          background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
          cursor: "pointer", padding: "7px 9px", display: "flex", flexDirection: "column",
          gap: 5, alignItems: "center", justifyContent: "center",
        }}
      >
        <span style={{ display: "block", width: 20, height: 2, background: "#2C3340", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#2C3340", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#2C3340", borderRadius: 2 }} />
      </button>

      {/* Full-screen overlay menu (TMZ /pages/tips style, aegyo pink/purple) */}
      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 1000, overflowY: "auto",
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(184,160,255,0.18), rgba(0,0,0,0) 55%), " +
              "radial-gradient(120% 80% at 50% 100%, rgba(255,111,168,0.16), rgba(0,0,0,0) 55%), #070709",
            WebkitBackdropFilter: "blur(2px)", backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, margin: "0 auto", padding: "18px 24px 44px", minHeight: "100%", animation: "fade-up 0.22s ease" }}
          >
            {/* Top bar: logo + close */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <Link href="/" onClick={close} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/aegyo-logo.png" alt="Aegyo Arena" style={{ height: 30, width: "auto", display: "block" }} />
              </Link>
              <button
                onClick={close}
                aria-label={t("Close menu", "Cerrar menú")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: "1.9rem", lineHeight: 1, padding: 6, opacity: 0.85 }}
              >
                ×
              </button>
            </div>

            {/* GOT A TIP? — the marquee CTA */}
            <Link
              href="/tips"
              onClick={close}
              style={{
                display: "block", textAlign: "center", textDecoration: "none",
                background: "linear-gradient(90deg, var(--sakura), var(--lavender))",
                color: "#fff", fontWeight: 900, fontStyle: "italic", fontSize: "1.5rem",
                letterSpacing: "0.02em", textTransform: "uppercase",
                padding: "16px 20px", borderRadius: 12,
                boxShadow: "0 10px 30px rgba(255,111,168,0.28)", marginBottom: 30,
              }}
            >
              <T en="Got a Tip?" es="¿Tienes un Chisme?" />
            </Link>

            {/* Big category list */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 26, textAlign: "center" }}>
              {NAV.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    style={{
                      display: "inline-block", textDecoration: "none", color: "#fff",
                      fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em",
                      fontSize: "clamp(1.9rem, 7vw, 2.4rem)", lineHeight: 1.05,
                    }}
                  >
                    <T en={item.en} es={item.es} />
                  </Link>
                  {item.subs && (
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 16px", marginTop: 10 }}>
                      {item.subs.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          onClick={close}
                          style={{ textDecoration: "none", color: "var(--lavender)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}
                        >
                          <T en={s.en} es={s.es} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Divider label (echoes TMZ's "SHOWS") */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "34px 0 20px" }}>
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--sakura))" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff", fontWeight: 700 }}>
                <T en="Your Account" es="Tu Cuenta" />
              </span>
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--lavender), transparent)" }} />
            </div>

            {/* Account section */}
            {isLoggedIn ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 4px 14px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--sakura), var(--lavender))", color: "#fff", fontWeight: 900, fontSize: "1.05rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {(displayName?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>{displayName}</div>
                    <Link href={userId ? `/contributors/${userId}` : "/dashboard"} onClick={close} style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                      <T en="View profile →" es="Ver perfil →" />
                    </Link>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href="/dashboard" onClick={close} style={{ flex: 1, textAlign: "center", textDecoration: "none", padding: "12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                    <T en="Dashboard" es="Mi Panel" />
                  </Link>
                  <button onClick={handleSignOut} style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    <T en="Sign out" es="Cerrar sesión" />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/login" onClick={close} style={{ flex: 1, textAlign: "center", textDecoration: "none", padding: "13px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontWeight: 800, fontSize: "0.88rem" }}>
                  <T en="Log In" es="Entrar" />
                </Link>
                <Link href="/signup" onClick={close} style={{ flex: 1, textAlign: "center", textDecoration: "none", padding: "13px", borderRadius: 100, background: "linear-gradient(90deg, var(--sakura), var(--lavender))", color: "#fff", fontWeight: 800, fontSize: "0.88rem" }}>
                  <T en="Sign Up" es="Regístrate" />
                </Link>
              </div>
            )}

            {/* Language toggle */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
              <LangToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
