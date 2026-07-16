"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

/**
 * Site-wide language state (EN/ES). One provider in the root layout drives every
 * page, persists the choice to localStorage, and defaults Spanish-language
 * browsers to ES — so the toggle sticks as the user navigates around the site.
 *
 * Usage in a SERVER page: drop a <LangToggle /> and wrap strings in <T en="…" es="…" />.
 * Usage in a CLIENT component: const { lang } = useLang().
 */
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aegyo-lang");
      if (saved === "en" || saved === "es") setLangState(saved);
      else if ((navigator.language || "").toLowerCase().startsWith("es")) setLangState("es");
    } catch { /* localStorage/navigator unavailable */ }
  }, []);

  useEffect(() => {
    try { document.documentElement.lang = lang; } catch { /* ignore */ }
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("aegyo-lang", l); } catch { /* ignore */ }
  }

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

/** Inline translator: <T en="Artists" es="Artistas" />. Falls back to EN when es is missing. */
export function T({ en, es }: { en: string; es?: string | null }) {
  const { lang } = useLang();
  return <>{lang === "es" && es ? es : en}</>;
}

/** Pick a value by the current language, with EN fallback. For non-string values. */
export function useT() {
  const { lang } = useLang();
  return function pick<V>(en: V, es?: V | null): V {
    return lang === "es" && es != null ? es : en;
  };
}

/**
 * The EN/ES pill toggle — identical to the one on /bts-giveaway.
 * `align` controls the row alignment ("center" by default).
 */
export function LangToggle({ align = "center", marginBottom = 22 }: { align?: "center" | "flex-start" | "flex-end"; marginBottom?: number }) {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "flex", justifyContent: align, marginBottom }}>
      <div style={{ display: "inline-flex", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 100, padding: 3 }}>
        {(["en", "es"] as Lang[]).map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
            style={{ padding: "6px 16px", borderRadius: 100, border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.02em", background: lang === l ? "var(--sakura)" : "transparent", color: lang === l ? "var(--on-accent)" : "var(--ink-dim)", transition: "background 0.15s, color 0.15s" }}>
            {l === "en" ? "English" : "Español"}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * YouTube links/embeds in Spanish mode: request Spanish closed captions and a
 * Spanish player UI. YouTube honours these when a Spanish (or auto-translated)
 * caption track exists; the source audio stays as-is.
 */
export function youtubeWithLang(url: string, lang: Lang): string {
  if (!/(?:youtube\.com|youtu\.be)/i.test(url)) return url;
  try {
    const u = new URL(url);
    if (lang === "es") {
      u.searchParams.set("cc_load_policy", "1");
      u.searchParams.set("cc_lang_pref", "es");
      u.searchParams.set("hl", "es");
    }
    return u.toString();
  } catch {
    return url;
  }
}
