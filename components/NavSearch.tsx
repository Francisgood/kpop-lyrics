"use client";

import { useLang } from "@/components/LangProvider";

/**
 * The nav bar's search form.
 *
 * A client leaf purely so the input's `placeholder` and `aria-label` can follow the
 * EN/ES toggle — <T> renders children, so it can't fill an attribute, and the root
 * layout itself stays a server component. Mirrors app/search/SearchForm.tsx.
 */
export default function NavSearch() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <form action="/search" className="nav-search-form" style={{ flex: 1, maxWidth: 380 }}>
      <input
        name="q"
        type="search"
        placeholder={es ? "Busca canciones, artistas, términos…" : "Search songs, artists, terms..."}
        aria-label={es ? "Buscar" : "Search"}
        className="search-input"
      />
    </form>
  );
}
