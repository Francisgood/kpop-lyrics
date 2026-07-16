"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { T, useT } from "@/components/LangProvider";

interface Props {
  isLoggedIn: boolean;
  displayName?: string;
  userId?: string;
}

export default function HamburgerMenu({ isLoggedIn, displayName, userId }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  // `label` stays the canonical EN key (the Dashboard highlight below matches on it);
  // `labelEs` is display-only.
  const loggedInItems = [
    { label: "Explore",      labelEs: "Explorar",    href: "/search",      prefix: "" },
    { label: "Quiz",         labelEs: "Quiz",        href: "/quiz",        prefix: "" },
    { label: "Dashboard",    labelEs: "Mi Panel",    href: "/dashboard",   prefix: "★ " },
    { label: "Leaderboard",  labelEs: "Ranking",     href: "/leaderboard", prefix: "" },
    { label: "Contribute",   labelEs: "Contribuir",  href: "/contribute",  prefix: "" },
    { label: "Refer",        labelEs: "Invitar",     href: "/refer",       prefix: "" },
  ];

  const loggedOutItems = [
    { label: "Explore",      labelEs: "Explorar",    href: "/search",      highlight: false },
    { label: "Quiz",         labelEs: "Quiz",        href: "/quiz",        highlight: false },
    { label: "Leaderboard",  labelEs: "Ranking",     href: "/leaderboard", highlight: false },
    { label: "Contribute",   labelEs: "Contribuir",  href: "/contribute",  highlight: false },
    { label: "Sign Up",      labelEs: "Regístrate",  href: "/signup",       highlight: true  },
  ];

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t("Close menu", "Cerrar menú") : t("Open menu", "Abrir menú")}
        style={{
          background: "none",
          border:     "1px solid rgba(255,255,255,0.15)",
          borderRadius: 6,
          cursor:     "pointer",
          padding:    "7px 9px",
          display:    "flex",
          flexDirection: "column",
          gap:        5,
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.15s",
        }}
      >
        {/* Animate bars into X when open */}
        <span style={{
          display: "block", width: 20, height: 2,
          background: open ? "var(--genius-yellow)" : "#2C3340",
          borderRadius: 2,
          transform:   open ? "translateY(7px) rotate(45deg)" : "none",
          transition:  "transform 0.2s, background 0.15s",
        }} />
        <span style={{
          display: "block", width: 20, height: 2,
          background: "#2C3340",
          borderRadius: 2,
          opacity:    open ? 0 : 1,
          transition: "opacity 0.15s",
        }} />
        <span style={{
          display: "block", width: 20, height: 2,
          background: open ? "var(--genius-yellow)" : "#2C3340",
          borderRadius: 2,
          transform:   open ? "translateY(-7px) rotate(-45deg)" : "none",
          transition:  "transform 0.2s, background 0.15s",
        }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:   "absolute",
          top:        "calc(100% + 10px)",
          right:      0,
          background: "#0a0a0a",
          border:     "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          minWidth:   220,
          boxShadow:  "0 12px 40px rgba(0,0,0,0.5)",
          zIndex:     200,
          overflow:   "hidden",
        }}>
          {/* Signed-in identity header */}
          {isLoggedIn && displayName && (
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--genius-yellow)",
                color: "var(--on-accent)", fontWeight: 900, fontSize: "0.9rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {displayName[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem", lineHeight: 1.2 }}>{displayName}</div>
                <Link
                  href={userId ? `/contributors/${userId}` : "/dashboard"}
                  onClick={() => setOpen(false)}
                  style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", textDecoration: "none", letterSpacing: "0.05em" }}
                >
                  <T en="View profile →" es="Ver perfil →" />
                </Link>
              </div>
            </div>
          )}

          {/* Menu items */}
          {isLoggedIn
            ? loggedInItems.map(({ label, labelEs, href, prefix }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    padding:      "13px 18px",
                    color:        label === "Dashboard" ? "var(--genius-yellow)" : "rgba(255,255,255,0.85)",
                    textDecoration: "none",
                    fontSize:     "0.9rem",
                    fontWeight:   600,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    gap:          8,
                    transition:   "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {prefix}<T en={label} es={labelEs} />
                </Link>
              ))
            : loggedOutItems.map(({ label, labelEs, href, highlight }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display:      "block",
                    padding:      "13px 18px",
                    color:        highlight ? "var(--genius-yellow)" : "rgba(255,255,255,0.85)",
                    textDecoration: "none",
                    fontSize:     "0.9rem",
                    fontWeight:   highlight ? 800 : 600,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <T en={label} es={labelEs} />
                </Link>
              ))
          }

          {/* Sign out (logged-in only) */}
          {isLoggedIn && (
            <button
              onClick={handleSignOut}
              style={{
                display:    "block",
                width:      "100%",
                textAlign:  "left",
                padding:    "13px 18px",
                color:      "rgba(255,255,255,0.3)",
                background: "none",
                border:     "none",
                fontSize:   "0.85rem",
                fontWeight: 500,
                cursor:     "pointer",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; }}
            >
              <T en="Sign out" es="Cerrar sesión" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
