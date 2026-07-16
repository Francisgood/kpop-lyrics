"use client";

import { useLang } from "@/components/LangProvider";

/**
 * The search page's query form.
 *
 * This is a client leaf purely so the input's `placeholder` and `aria-label` can
 * follow the EN/ES toggle — <T> renders children, so it can't fill an attribute,
 * and the search page itself stays a server component.
 */
export default function SearchForm({ query }: { query: string }) {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <form action="/search" style={{ display: "flex", gap: 8, maxWidth: 520 }}>
      <input
        name="q"
        type="search"
        defaultValue={query}
        placeholder={es ? "Busca artistas, canciones, letras, jerga, noticias…" : "Search artists, songs, lyrics, slang, news…"}
        aria-label={es ? "Buscar" : "Search"}
        className="search-input"
        style={{ flex: 1 }}
      />
      <button type="submit" className="btn-yellow">{es ? "BUSCAR" : "SEARCH"}</button>
    </form>
  );
}
