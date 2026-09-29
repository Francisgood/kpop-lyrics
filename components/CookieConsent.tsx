"use client";

/**
 * CookieConsent — a small Osano-style cookie widget.
 *
 * • A floating cookie icon (bottom-left) opens a "Storage Preferences" panel.
 * • On first visit a disclosure banner appears (US/opt-out model: non-essential
 *   categories default ON, so existing ad/analytics tracking keeps working, and
 *   the visitor can opt out per category). Flip DEFAULT_GRANTED to false for a
 *   GDPR-strict opt-in default.
 * • Consent choices are stored in the `aa_consent` cookie (1 year). The site's
 *   third-party pixels (Google Analytics, Taboola, Reddit, TikTok) are loaded
 *   HERE, gated on consent — they were removed from app/layout.tsx so the toggles
 *   are real, not decorative. Revoking a previously-granted category reloads the
 *   page so those scripts stop firing.
 * • A random per-session UUID (`aa_sid`) is issued when Analytics is allowed and
 *   reported once per browser session to /api/session.
 *
 * Any element with a [data-cookie-prefs] attribute (e.g. the footer link) opens
 * the panel via a delegated click handler.
 */

import { useEffect, useState, useCallback, type CSSProperties } from "react";
import Script from "next/script";

const COOKIE = "aa_consent";
const VERSION = 1;
const YEAR = 60 * 60 * 24 * 365;
const DEFAULT_GRANTED = true; // opt-out default (US/CCPA). false = opt-in (GDPR-strict).

type Choices = { advertising: boolean; personalization: boolean; analytics: boolean };
type Consent = Choices & { v: number; ts: number };

const CATEGORIES: {
  key: keyof Choices | "essential";
  label: string;
  desc: string;
  cookies: string;
  locked?: boolean;
}[] = [
  {
    key: "essential",
    label: "Essential",
    desc: "Required to enable basic site functionality — your login session, language preference, and remembering these cookie choices. You may not disable essential cookies.",
    cookies: "aa_session, lang, aa_consent",
    locked: true,
  },
  {
    key: "advertising",
    label: "Targeted Advertising",
    desc: "Used to deliver advertising that is more relevant to you, limit how often you see an ad, and measure the effectiveness of ad campaigns. Set by our advertising partners: Taboola, Reddit, and TikTok.",
    cookies: "Taboola (_tfa), Reddit (rdt), TikTok (ttq)",
  },
  {
    key: "personalization",
    label: "Personalization",
    desc: "Allows the site to remember choices you make — such as your language or region — to provide enhanced, more personal features.",
    cookies: "lang, region preferences",
  },
  {
    key: "analytics",
    label: "Analytics",
    desc: "Helps us understand how the site performs and how visitors use it so we can improve it. Includes Google Analytics and a randomly-generated session ID.",
    cookies: "Google Analytics (_ga), aa_sid",
  },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(name: string, value: string, maxAge = YEAR) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
function readConsent(): Consent | null {
  try {
    const raw = getCookie(COOKIE);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (typeof c !== "object" || c.v !== VERSION) return null;
    return { v: VERSION, ts: Number(c.ts) || Date.now(), advertising: !!c.advertising, personalization: !!c.personalization, analytics: !!c.analytics };
  } catch {
    return null;
  }
}
function uuid(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ── theme tokens (match the site) ───────────────────────────────────────────
const CARD = "var(--bg-card, #2A303D)";
const BORDER = "var(--border, rgba(255,255,255,0.08))";
const INK = "var(--ink, #FAFAF8)";
const DIM = "var(--ink-dim, rgba(250,250,248,.55))";
const FAINT = "var(--ink-faint, rgba(250,250,248,.3))";
const SAKURA = "var(--sakura, #FF6FA8)";

function Toggle({ on, locked, onChange }: { on: boolean; locked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={locked}
      onClick={() => !locked && onChange?.(!on)}
      style={{
        width: 42, height: 24, borderRadius: 999, border: "none", flexShrink: 0,
        background: on ? SAKURA : "rgba(255,255,255,0.15)",
        opacity: locked ? 0.55 : 1, cursor: locked ? "not-allowed" : "pointer",
        position: "relative", transition: "background .18s", padding: 0,
      }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .18s" }} />
    </button>
  );
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | undefined>(undefined);
  const [banner, setBanner] = useState(false);
  const [panel, setPanel] = useState(false);
  const [draft, setDraft] = useState<Choices>({ advertising: DEFAULT_GRANTED, personalization: DEFAULT_GRANTED, analytics: DEFAULT_GRANTED });
  const [expanded, setExpanded] = useState<string | null>(null);

  // Resolve stored consent (or apply the default) on mount.
  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setConsent(stored);
      setDraft({ advertising: stored.advertising, personalization: stored.personalization, analytics: stored.analytics });
    } else {
      const def: Consent = { v: VERSION, ts: Date.now(), advertising: DEFAULT_GRANTED, personalization: DEFAULT_GRANTED, analytics: DEFAULT_GRANTED };
      setConsent(def);
      setDraft({ advertising: def.advertising, personalization: def.personalization, analytics: def.analytics });
      setBanner(true); // disclosure until an explicit choice is stored
    }
  }, []);

  // Let any [data-cookie-prefs] element (e.g. the footer link) open the panel.
  const openPanel = useCallback(() => {
    if (consent) setDraft({ advertising: consent.advertising, personalization: consent.personalization, analytics: consent.analytics });
    setPanel(true);
  }, [consent]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("[data-cookie-prefs]")) { e.preventDefault(); openPanel(); }
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [openPanel]);

  // Per-session UUID — issued + reported only when Analytics is allowed.
  useEffect(() => {
    if (!consent?.analytics) return;
    let sid = getCookie("aa_sid");
    if (!sid) { sid = uuid(); setCookie("aa_sid", sid); }
    try {
      if (!sessionStorage.getItem("aa_sid_sent")) {
        sessionStorage.setItem("aa_sid_sent", "1");
        fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sid, path: location.pathname, ref: document.referrer || null }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  }, [consent?.analytics]);

  const persist = (choices: Choices) => {
    const prev = consent;
    const next: Consent = { v: VERSION, ts: Date.now(), ...choices };
    setCookie(COOKIE, JSON.stringify(next));
    // Revoking a previously-granted category needs a reload to actually stop the
    // already-loaded scripts; pure grants load live below with no reload.
    const revoked = !!prev && (
      (prev.advertising && !next.advertising) ||
      (prev.analytics && !next.analytics) ||
      (prev.personalization && !next.personalization)
    );
    setConsent(next);
    setBanner(false);
    setPanel(false);
    if (revoked) location.reload();
  };

  if (consent === undefined) return null; // render nothing until consent is known

  const acceptAll = () => persist({ advertising: true, personalization: true, analytics: true });
  const rejectAll = () => persist({ advertising: false, personalization: false, analytics: false });

  return (
    <>
      {/* ── Consent-gated third-party pixels (moved out of layout.tsx) ── */}
      {consent.analytics && (
        <>
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-700MXJM1FW" strategy="afterInteractive" />
          <Script id="ga4-gtag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-700MXJM1FW');`}
          </Script>
        </>
      )}
      {consent.advertising && (
        <>
          <Script id="taboola-tfa" strategy="lazyOnload">
            {`window._tfa=window._tfa||[];window._tfa.push({notify:'event',name:'page_view',id:2066412});!function(t,f,a,x){if(!document.getElementById(x)){t.async=1;t.src=a;t.id=x;f.parentNode.insertBefore(t,f);}}(document.createElement('script'),document.getElementsByTagName('script')[0],'//cdn.taboola.com/libtrc/unip/2066412/tfa.js','tb_tfa_script');`}
          </Script>
          <Script id="reddit-pixel" strategy="lazyOnload">
            {`!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_j9m653pqhzu7",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_j9m653pqhzu7');rdt('track','PageVisit');`}
          </Script>
          <Script id="tiktok-pixel" strategy="lazyOnload">
            {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('D9AFTIJC77U1026600GG');ttq.page();}(window,document,'ttq');`}
          </Script>
        </>
      )}

      {/* ── Floating cookie icon (bottom-left) ── */}
      <button
        type="button"
        aria-label="Cookie preferences"
        onClick={openPanel}
        style={{
          position: "fixed", left: 16, bottom: 16, zIndex: 2147483000,
          width: 44, height: 44, borderRadius: "50%", border: `1px solid ${BORDER}`,
          background: CARD, color: INK, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, lineHeight: 1, padding: 0,
        }}
      >
        🍪
      </button>

      {/* ── First-visit disclosure banner ── */}
      {banner && (
        <div
          role="dialog"
          aria-label="Cookie notice"
          style={{
            position: "fixed", left: 16, right: 16, bottom: 72, zIndex: 2147483000,
            maxWidth: 460, background: CARD, color: INK, border: `1px solid ${BORDER}`,
            borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.45)", padding: "18px 18px 16px",
            fontFamily: "var(--font-sans, system-ui)",
          }}
        >
          <div style={{ fontSize: "0.92rem", lineHeight: 1.6, color: DIM, marginBottom: 14 }}>
            We use cookies to run the site, analyze traffic, and personalize content and ads. You can accept all, reject
            non-essential, or manage your choices. See our{" "}
            <a href="/cookie-policy" style={{ color: SAKURA, textDecoration: "underline" }}>Cookie Policy</a>.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={acceptAll} style={btn(true)}>Accept all</button>
            <button type="button" onClick={rejectAll} style={btn(false)}>Reject non-essential</button>
            <button type="button" onClick={openPanel} style={{ ...btn(false), borderColor: "transparent", background: "transparent", color: DIM }}>Manage</button>
          </div>
        </div>
      )}

      {/* ── Preferences panel ── */}
      {panel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Storage Preferences"
          onClick={(e) => { if (e.target === e.currentTarget) setPanel(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 2147483001, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: 16 }}
        >
          <div style={{ width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", background: CARD, color: INK, border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.55)", fontFamily: "var(--font-sans, system-ui)" }}>
            <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0, fontFamily: "var(--serif, Georgia, serif)", fontSize: "1.4rem", fontWeight: 700, color: INK }}>Storage Preferences</h2>
                <button type="button" aria-label="Close" onClick={() => setPanel(false)} style={{ background: "none", border: "none", color: DIM, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: "0.86rem", lineHeight: 1.6, color: DIM }}>
                When you visit our website, we may store or retrieve data using cookies. Some are necessary; others you can control below.{" "}
                <a href="/cookie-policy" style={{ color: SAKURA, textDecoration: "underline" }}>Cookie Policy</a>
              </p>
            </div>

            <div style={{ padding: "8px 20px 4px" }}>
              {CATEGORIES.map((cat) => {
                const on = cat.locked ? true : draft[cat.key as keyof Choices];
                return (
                  <div key={cat.key} style={{ padding: "14px 0", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.98rem", color: INK }}>{cat.label}</span>
                      <Toggle on={on} locked={cat.locked} onChange={(v) => setDraft((d) => ({ ...d, [cat.key]: v }))} />
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: "0.83rem", lineHeight: 1.55, color: DIM }}>{cat.desc}</p>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === cat.key ? null : cat.key)}
                      style={{ background: "none", border: "none", color: SAKURA, fontSize: "0.78rem", cursor: "pointer", padding: "8px 0 0", fontWeight: 600 }}
                    >
                      {expanded === cat.key ? "Hide disclosures" : "View disclosures"}
                    </button>
                    {expanded === cat.key && (
                      <div style={{ marginTop: 6, fontSize: "0.78rem", color: FAINT, lineHeight: 1.55, fontFamily: "var(--font-mono, monospace)" }}>
                        Cookies: {cat.cookies}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ position: "sticky", bottom: 0, background: CARD, display: "flex", gap: 8, flexWrap: "wrap", padding: "14px 20px 18px", borderTop: `1px solid ${BORDER}` }}>
              <button type="button" onClick={() => persist(draft)} style={btn(true)}>Save choices</button>
              <button type="button" onClick={acceptAll} style={btn(false)}>Accept all</button>
              <button type="button" onClick={rejectAll} style={btn(false)}>Reject non-essential</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function btn(primary: boolean): CSSProperties {
  return {
    flex: "1 1 auto", minWidth: 120, padding: "9px 14px", borderRadius: 999, cursor: "pointer",
    fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-sans, system-ui)",
    border: primary ? "none" : `1px solid ${BORDER}`,
    background: primary ? SAKURA : "transparent",
    color: primary ? "#1a1320" : INK,
  };
}
