"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { cityImage } from "@/lib/city-images";

/* ------------------------------------------------------------------ types */

export type EventRow = {
  id: string; title: string; titleEs: string | null; category: string;
  city: string | null; citySlug: string | null; country: string | null;
  venue: string | null; startsAt: string | null; dateText: string | null;
  description: string | null; descriptionEs: string | null;
  source: string | null; sourceUrl: string;
  /** Set on events we host ourselves — they get the featured slot and open in-tab. */
  featured?: boolean;
  cover?: string | null;
};

export const CAT: Record<string, { en: string; es: string; emoji: string; color: string }> = {
  kpop:    { en: "K-pop",     es: "K-pop",     emoji: "💜", color: "#C77DFF" },
  kbeauty: { en: "K-Beauty",  es: "K-Beauty",  emoji: "💄", color: "#FF6FA8" },
  dance:   { en: "Dance",     es: "Baile",     emoji: "🕺", color: "#4AC8F0" },
  anime:   { en: "Anime",     es: "Anime",     emoji: "🎌", color: "#FF8C42" },
  comicon: { en: "Comic-Con", es: "Comic-Con", emoji: "🦸", color: "#C8F04A" },
  store:   { en: "Store",     es: "Tienda",    emoji: "🛍", color: "#B8A0FF" },
  meetup:  { en: "Meetup",    es: "Encuentro", emoji: "🗓", color: "#4ECDC4" },
  other:   { en: "Event",     es: "Evento",    emoji: "✨", color: "#FFD700" },
};

/* ------------------------------------------------------- date formatting */
// Hand-rolled instead of Intl so server and client render byte-identical strings
// (no hydration mismatch) and so both languages come from one place. Timestamps are
// stored as local wall-clock in a UTC column, so every read uses the UTC getters.

const DOW = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] };
const MON = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
};

function parts(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}
function dowOf(d: Date, l: "en" | "es") { return DOW[l][d.getUTCDay()]; }
function monDayOf(d: Date, l: "en" | "es") { return `${MON[l][d.getUTCMonth()]} ${d.getUTCDate()}`; }
function timeOf(d: Date): string | null {
  const h = d.getUTCHours(), m = d.getUTCMinutes();
  if (h === 0 && m === 0) return null; // midnight = "date only" in the source listing
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
/** Days from today (UTC date arithmetic, so it can't be knocked off by an hour). */
function daysOut(d: Date): number {
  const now = new Date();
  const a = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const b = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((a - b) / 86400000);
}
function proximity(d: Date | null, l: "en" | "es"): string | null {
  if (!d) return null;
  const n = daysOut(d);
  if (n < 0) return null;
  if (n === 0) return l === "es" ? "Hoy" : "Today";
  if (n === 1) return l === "es" ? "Mañana" : "Tomorrow";
  if (n <= 7) return l === "es" ? "Esta semana" : "This week";
  return null;
}

/* --------------------------------------------------------------- helpers */

const isInternal = (u: string) => u.startsWith("/") || u.startsWith("https://www.aegyoarena.com/");
const coverFor = (e: EventRow) => e.cover || cityImage(e.citySlug) || null;

/* ============================================================== component */

export default function EventsBrowser({ events, topBar, cta }: { events: EventRow[]; topBar?: React.ReactNode; cta?: React.ReactNode }) {
  const { lang } = useLang();
  const l: "en" | "es" = lang === "es" ? "es" : "en";
  const t = (en: string, es: string) => (l === "es" ? es : en);

  const [city, setCity] = useState("");
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(14);

  const cities = useMemo(() => {
    const m = new Map<string, { city: string; slug: string; n: number }>();
    for (const e of events) {
      if (!e.citySlug) continue;
      const cur = m.get(e.citySlug) ?? { city: e.city ?? e.citySlug, slug: e.citySlug, n: 0 };
      cur.n++; m.set(e.citySlug, cur);
    }
    return [...m.values()].sort((a, b) => b.n - a.n || a.city.localeCompare(b.city));
  }, [events]);

  const cats = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [events]);

  const filtering = !!(city || cat || q.trim());

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return events.filter((e) => {
      if (city && e.citySlug !== city) return false;
      if (cat && e.category !== cat) return false;
      if (!needle) return true;
      return [e.title, e.venue, e.city, e.country, e.description, e.source]
        .filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [events, city, cat, q]);

  // Highlights: our own events first, then the soonest dated ones.
  const highlights = useMemo(() => {
    const feat = events.filter((e) => e.featured);
    const rest = events.filter((e) => !e.featured && e.startsAt);
    return [...feat, ...rest].slice(0, 5);
  }, [events]);

  const reset = () => { setCity(""); setCat(""); setQ(""); };

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .tm-pill { display:grid; grid-template-columns: 1.1fr 1fr 1.6fr auto; gap:0; background:#fff; border-radius:6px; overflow:hidden; }
        .tm-field { padding:9px 16px; border-right:1px solid rgba(0,0,0,0.12); min-width:0; }
        .tm-field:last-of-type { border-right:0; }
        .tm-label { font-size:.6rem; font-weight:800; letter-spacing:.13em; text-transform:uppercase; color:rgba(0,0,0,.5); display:block; margin-bottom:2px; }
        .tm-input { width:100%; border:0; outline:0; background:transparent; font-size:.95rem; font-weight:600; color:#14171c; font-family:inherit; padding:0; }
        .tm-input option { color:#14171c; }
        .tm-go { border:0; background:#21262F; color:#fff; font-weight:800; font-size:.92rem; padding:0 30px; cursor:pointer; font-family:inherit; letter-spacing:.01em; }
        .tm-go:hover { background:#0f1216; }
        @media (max-width: 760px) { .tm-pill { grid-template-columns:1fr; } .tm-field { border-right:0; border-bottom:1px solid rgba(0,0,0,.12); } .tm-go { padding:14px; } }

        .tm-mosaic { display:grid; grid-template-columns: 1.7fr 1fr 1fr; grid-auto-rows: 216px; gap:12px; }
        .tm-mosaic > a:first-child { grid-row: span 2; }
        @media (max-width: 900px) { .tm-mosaic { grid-template-columns:1fr 1fr; grid-auto-rows:180px; } .tm-mosaic > a:first-child { grid-column: span 2; grid-row: span 1; } }
        @media (max-width: 560px) { .tm-mosaic { grid-template-columns:1fr; } .tm-mosaic > a:first-child { grid-column: span 1; } }

        .tm-tile { position:relative; overflow:hidden; border-radius:6px; text-decoration:none; display:block; background:#1b1f27; }
        .tm-tile img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.2,.6,.2,1); }
        .tm-tile:hover img { transform:scale(1.06); }
        .tm-tile-body { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; padding:16px; }

        .tm-rail { display:flex; gap:12px; overflow-x:auto; scroll-behavior:smooth; padding-bottom:6px; scrollbar-width:none; }
        .tm-rail::-webkit-scrollbar { display:none; }
        .tm-arrow { width:32px; height:32px; border-radius:999px; border:1px solid var(--border-strong); background:var(--surface); color:var(--ink); cursor:pointer; font-size:.9rem; line-height:1; display:inline-flex; align-items:center; justify-content:center; }
        .tm-arrow:hover { background:var(--sakura); color:#1B2027; border-color:var(--sakura); }

        .tm-row { display:grid; grid-template-columns: 92px 1fr auto; gap:18px; align-items:center; padding:16px 14px; border-bottom:1px solid var(--border); text-decoration:none; transition:background .15s ease; }
        .tm-row:hover { background:var(--surface); }
        .tm-row:hover .tm-row-title { color:var(--sakura); }
        .tm-cta { border:1px solid var(--border-strong); border-radius:4px; padding:9px 18px; font-size:.78rem; font-weight:800; color:var(--ink); white-space:nowrap; }
        .tm-row:hover .tm-cta { background:var(--sakura); border-color:var(--sakura); color:#1B2027; }
        @media (max-width: 680px) { .tm-row { grid-template-columns: 72px 1fr; gap:14px; } .tm-row .tm-cta { display:none; } }

        .tm-card { flex:0 0 236px; text-decoration:none; }
        .tm-card-cover { position:relative; aspect-ratio:4/3; border-radius:6px; overflow:hidden; background:#1b1f27; }
        .tm-card-cover img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.2,.6,.2,1); }
        .tm-card:hover .tm-card-cover img { transform:scale(1.06); }
        .tm-card:hover .tm-card-title { color:var(--sakura); }
        .tm-chip { border:1px solid var(--border-strong); border-radius:999px; padding:7px 15px; font-size:.82rem; font-weight:700; color:var(--ink); text-decoration:none; white-space:nowrap; background:transparent; cursor:pointer; font-family:inherit; }
        .tm-chip:hover { border-color:var(--sakura); color:var(--sakura); }
        .tm-chip[data-on="1"] { background:var(--sakura); border-color:var(--sakura); color:#1B2027; }
      `}</style>

      {topBar}

      {/* ── Brand search band ─────────────────────────────────────────── */}
      <div style={{ background: "var(--sakura)", padding: "26px 0 26px" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontFamily: "var(--sans)", fontSize: "clamp(1.7rem, 3.6vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.05, color: "#1B2027", margin: "0 0 8px" }}>
            {t("Fan events near you", "Eventos para fans cerca de ti")}
          </h1>
          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "rgba(27,32,39,0.74)", margin: "0 0 16px", maxWidth: 640, lineHeight: 1.5 }}>
            {t(
              "Meetups, random play dance nights, cupsleeve cafés, K-beauty pop-ups and karaoke — in every city on the tour.",
              "Meetups, noches de random play dance, cafés cupsleeve, pop-ups de K-beauty y karaoke — en cada ciudad de la gira."
            )}
          </p>
          <form className="tm-pill" onSubmit={(ev) => { ev.preventDefault(); document.getElementById("tm-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <label className="tm-field">
              <span className="tm-label">{t("Location", "Ubicación")}</span>
              <select className="tm-input" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">{t("All cities", "Todas las ciudades")}</option>
                {cities.map((c) => <option key={c.slug} value={c.slug}>{c.city} ({c.n})</option>)}
              </select>
            </label>
            <label className="tm-field">
              <span className="tm-label">{t("Category", "Categoría")}</span>
              <select className="tm-input" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">{t("All categories", "Todas las categorías")}</option>
                {cats.map(([k, n]) => <option key={k} value={k}>{(CAT[k] ?? CAT.other)[l]} ({n})</option>)}
              </select>
            </label>
            <label className="tm-field">
              <span className="tm-label">{t("Search", "Buscar")}</span>
              <input className="tm-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Event, venue or city", "Evento, lugar o ciudad")} />
            </label>
            <button className="tm-go" type="submit">{t("Search", "Buscar")}</button>
          </form>
        </div>
      </div>

      {/* ── Highlights mosaic ─────────────────────────────────────────── */}
      {!filtering && highlights.length > 0 && (
        <Section>
          <RailHeader title={t("Highlights", "Destacados")} />
          <div className="tm-mosaic">
            {highlights.map((e, i) => <Tile key={e.id} e={e} big={i === 0} l={l} />)}
          </div>
        </Section>
      )}

      {/* ── Browse by city ────────────────────────────────────────────── */}
      {!filtering && cities.length > 1 && (
        <Section>
          <RailHeader
            title={t("Browse by city", "Explora por ciudad")}
            right={<Link href="/cities" style={{ fontSize: ".78rem", fontWeight: 800, color: "var(--sakura)", textDecoration: "none" }}>{t("All city guides →", "Todas las guías →")}</Link>}
          />
          <Rail>
            {cities.map((c) => {
              const img = cityImage(c.slug);
              return (
                <button key={c.slug} type="button" onClick={() => { setCity(c.slug); document.getElementById("tm-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  style={{ flex: "0 0 auto", width: 116, background: "none", border: 0, padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                  <div style={{ width: 108, height: 108, margin: "0 auto 9px", borderRadius: 999, overflow: "hidden", background: "#1b1f27", border: "2px solid var(--border)" }}>
                    {img
                      ? <img src={img} alt={c.city} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,var(--sakura),var(--lavender))" }} />}
                  </div>
                  <div style={{ fontSize: ".82rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1.2 }}>{c.city}</div>
                  <div style={{ fontSize: ".7rem", color: "var(--ink-faint)", fontVariantNumeric: "tabular-nums" }}>
                    {c.n} {c.n === 1 ? t("event", "evento") : t("events", "eventos")}
                  </div>
                </button>
              );
            })}
          </Rail>
        </Section>
      )}

      {/* ── Results list ──────────────────────────────────────────────── */}
      <Section id="tm-results">
        <RailHeader
          title={filtering ? t("Results", "Resultados") : t("Happening soon", "Próximamente")}
          right={
            filtering ? (
              <button type="button" onClick={reset} className="tm-chip">{t("Clear filters", "Limpiar filtros")}</button>
            ) : (
              <span style={{ fontSize: ".78rem", color: "var(--ink-faint)", fontWeight: 700 }}>
                {events.length} {t("events", "eventos")} · {cities.length} {t("cities", "ciudades")}
              </span>
            )
          }
        />

        {/* quick category chips, mirroring the nav row on a ticketing homepage */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <button type="button" className="tm-chip" data-on={cat === "" ? "1" : "0"} onClick={() => setCat("")}>{t("All", "Todos")}</button>
          {cats.map(([k, n]) => (
            <button key={k} type="button" className="tm-chip" data-on={cat === k ? "1" : "0"} onClick={() => setCat(cat === k ? "" : k)}>
              {(CAT[k] ?? CAT.other).emoji} {(CAT[k] ?? CAT.other)[l]} <span style={{ color: "var(--ink-faint)", fontWeight: 600 }}>{n}</span>
            </button>
          ))}
        </div>

        {results.length === 0 ? (
          <Empty l={l} onReset={reset} />
        ) : (
          <>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 14 }}>
              {results.slice(0, limit).map((e) => <Row key={e.id} e={e} l={l} />)}
            </div>
            {results.length > limit && (
              <div style={{ textAlign: "center", marginTop: 22 }}>
                <button type="button" className="tm-chip" onClick={() => setLimit(limit + 20)} style={{ padding: "11px 26px" }}>
                  {t(`See more events (${results.length - limit})`, `Ver más eventos (${results.length - limit})`)}
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      {/* ── Category rails ────────────────────────────────────────────── */}
      {!filtering && cats.filter(([, n]) => n >= 3).map(([k]) => {
        const list = events.filter((e) => e.category === k).slice(0, 12);
        const meta = CAT[k] ?? CAT.other;
        return (
          <Section key={k}>
            <RailHeader
              title={meta[l]}
              right={<button type="button" onClick={() => { setCat(k); document.getElementById("tm-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ background: "none", border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: ".78rem", fontWeight: 800, color: "var(--sakura)" }}>
                {t(`See all ${meta.en}`, `Ver todo: ${meta.es}`)} →
              </button>}
            />
            <Rail>
              {list.map((e) => <Card key={e.id} e={e} l={l} />)}
            </Rail>
          </Section>
        );
      })}

      {cta && <Section>{cta}</Section>}

      <div style={{ maxWidth: 640, margin: "10px auto 90px", padding: "22px 24px 0", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--ink-faint)", fontSize: ".78rem", lineHeight: 1.7 }}>
        {t(
          "Every event links to a real listing — we aggregate from public pages and host our own meetups here. We never invent an event. Always confirm details on the listing before you travel.",
          "Cada evento enlaza a un listado real — recopilamos de páginas públicas y publicamos aquí nuestros propios encuentros. Nunca inventamos un evento. Confirma los detalles antes de viajar."
        )}
      </div>
    </main>
  );
}

/* ---------------------------------------------------------- sub-elements */

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return <section id={id} style={{ maxWidth: 1220, margin: "0 auto", padding: "30px 24px 6px", scrollMarginTop: 12 }}>{children}</section>;
}

function RailHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
      <h2 style={{ fontFamily: "var(--sans)", fontSize: "0.9rem", fontWeight: 900, letterSpacing: "0.11em", textTransform: "uppercase", color: "var(--ink)", margin: 0 }}>{title}</h2>
      {right}
    </div>
  );
}

/** Horizontal rail with the prev/next arrows a ticketing homepage uses. */
function Rail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (n: number) => ref.current?.scrollBy({ left: n, behavior: "smooth" });
  return (
    <div style={{ position: "relative" }}>
      <div className="tm-rail" ref={ref}>{children}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
        <button className="tm-arrow" type="button" aria-label="Previous" onClick={() => by(-680)}>‹</button>
        <button className="tm-arrow" type="button" aria-label="Next" onClick={() => by(680)}>›</button>
      </div>
    </div>
  );
}

function linkProps(e: EventRow) {
  return isInternal(e.sourceUrl) ? {} : { target: "_blank" as const, rel: "noopener noreferrer" };
}

function Tile({ e, big, l }: { e: EventRow; big: boolean; l: "en" | "es" }) {
  const meta = CAT[e.category] ?? CAT.other;
  const img = coverFor(e);
  const d = parts(e.startsAt);
  const when = d ? `${dowOf(d, l)} · ${monDayOf(d, l)}${timeOf(d) ? ` · ${timeOf(d)}` : ""}` : e.dateText ?? "";
  const eyebrow = e.featured ? (l === "es" ? "Evento de Aegyo Arena" : "An Aegyo Arena event") : meta[l];
  const title = l === "es" && e.titleEs ? e.titleEs : e.title;

  return (
    <a className="tm-tile" href={e.sourceUrl} {...linkProps(e)}>
      {img
        ? <img src={img} alt="" loading="lazy" decoding="async" />
        : <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 120% at 20% 10%, ${meta.color} 0%, #16121f 110%)` }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 34%, rgba(8,9,12,.92) 100%)" }} />
      <div className="tm-tile-body">
        <div style={{ fontSize: big ? ".68rem" : ".6rem", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: e.featured ? "var(--sakura)" : "rgba(255,255,255,.8)", marginBottom: 7 }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: big ? "clamp(1.5rem, 2.6vw, 2.3rem)" : "1.02rem", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.015em", display: "-webkit-box", WebkitLineClamp: big ? 3 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {title}
        </div>
        {big && <div style={{ width: 118, height: 5, background: "var(--sakura)", margin: "12px 0 10px", borderRadius: 2 }} />}
        <div style={{ fontSize: big ? ".84rem" : ".72rem", color: "rgba(255,255,255,.78)", fontWeight: 600, marginTop: big ? 0 : 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {[when, e.venue || e.city].filter(Boolean).join(" · ")}
        </div>
      </div>
    </a>
  );
}

function Row({ e, l }: { e: EventRow; l: "en" | "es" }) {
  const meta = CAT[e.category] ?? CAT.other;
  const d = parts(e.startsAt);
  const near = proximity(d, l);
  const time = d ? timeOf(d) : null;
  const title = l === "es" && e.titleEs ? e.titleEs : e.title;
  const where = [e.venue, [e.city, e.country].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

  const dateBlock: CSSProperties = { textAlign: "center", lineHeight: 1.18, fontVariantNumeric: "tabular-nums" };

  return (
    <a className="tm-row" href={e.sourceUrl} {...linkProps(e)}>
      <div style={dateBlock}>
        {near && <div style={{ fontSize: ".56rem", fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 4 }}>{near}</div>}
        {d ? (
          <>
            <div style={{ fontSize: ".74rem", fontWeight: 800, color: "var(--ink-dim)", textTransform: "uppercase" }}>{dowOf(d, l)}</div>
            <div style={{ fontSize: "1.02rem", fontWeight: 900, color: "var(--ink)" }}>{monDayOf(d, l)}</div>
            <div style={{ fontSize: ".7rem", color: "var(--ink-faint)", fontWeight: 700 }}>{time ?? ""}</div>
          </>
        ) : (
          <div style={{ fontSize: ".74rem", fontWeight: 800, color: "var(--ink-dim)" }}>{e.dateText || (l === "es" ? "Ver fecha" : "See listing")}</div>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        {e.featured && (
          <span style={{ display: "inline-block", background: "var(--sakura)", color: "#1B2027", fontSize: ".54rem", fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 7px", borderRadius: 3, marginBottom: 7 }}>
            {l === "es" ? "Nuestro evento" : "Our event"}
          </span>
        )}
        <div className="tm-row-title" style={{ fontSize: "1.04rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1.28, marginBottom: 5, transition: "color .15s ease" }}>{title}</div>
        <div style={{ fontSize: ".82rem", color: "var(--ink-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{where}</div>
        <div style={{ fontSize: ".7rem", color: meta.color, fontWeight: 800, marginTop: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>
          {meta.emoji} {meta[l]}{e.source ? ` · ${e.source}` : ""}
        </div>
      </div>

      <span className="tm-cta">{l === "es" ? "Ver evento" : "See event"}</span>
    </a>
  );
}

function Card({ e, l }: { e: EventRow; l: "en" | "es" }) {
  const meta = CAT[e.category] ?? CAT.other;
  const img = coverFor(e);
  const d = parts(e.startsAt);
  const when = d ? `${dowOf(d, l)}, ${monDayOf(d, l)}${timeOf(d) ? ` · ${timeOf(d)}` : ""}` : e.dateText ?? "";
  const title = l === "es" && e.titleEs ? e.titleEs : e.title;

  return (
    <a className="tm-card" href={e.sourceUrl} {...linkProps(e)}>
      <div className="tm-card-cover">
        {img
          ? <img src={img} alt="" loading="lazy" decoding="async" />
          : <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 120% at 20% 10%, ${meta.color} 0%, #16121f 110%)` }} />}
        <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", color: "#fff", fontSize: ".56rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 8px", borderRadius: 3 }}>
          {meta[l]}
        </span>
      </div>
      <div style={{ paddingTop: 11 }}>
        <div style={{ fontSize: ".66rem", fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 5 }}>{when}</div>
        <div className="tm-card-title" style={{ fontSize: ".95rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1.28, marginBottom: 5, transition: "color .15s ease", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</div>
        <div style={{ fontSize: ".78rem", color: "var(--ink-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {[e.venue, e.city].filter(Boolean).join(" · ")}
        </div>
      </div>
    </a>
  );
}

function Empty({ l, onReset }: { l: "en" | "es"; onReset: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "58px 20px", border: "1px solid var(--border)", borderRadius: 10, marginTop: 14 }}>
      <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🗓</div>
      <div style={{ fontWeight: 900, color: "var(--ink)", fontSize: "1.1rem", marginBottom: 8 }}>
        {l === "es" ? "Ningún evento coincide" : "No events match that"}
      </div>
      <div style={{ fontSize: ".9rem", color: "var(--ink-dim)", maxWidth: 460, margin: "0 auto 18px", lineHeight: 1.7 }}>
        {l === "es"
          ? "Prueba con otra ciudad o categoría — o mira las guías de encuentros recurrentes por ciudad."
          : "Try a different city or category — or browse the recurring meetups we keep for every city."}
      </div>
      <button type="button" className="tm-chip" onClick={onReset} style={{ padding: "10px 22px", marginRight: 8 }}>
        {l === "es" ? "Limpiar filtros" : "Clear filters"}
      </button>
      <Link href="/cities/meetups" className="tm-chip" style={{ padding: "10px 22px", display: "inline-block" }}>
        {l === "es" ? "Encuentros por ciudad" : "Meetups by city"}
      </Link>
    </div>
  );
}
