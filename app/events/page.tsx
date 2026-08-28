import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { T, LangToggle } from "@/components/LangProvider";
import { cityImage } from "@/lib/city-images";
import ArcadeCTA from "@/components/ArcadeCTA";

export const dynamic = "force-dynamic";

const TITLE = "K-pop Fan Events & Meetups Near You — Aegyo Arena";
const DESC =
  "Find your people. A daily-updated feed of local K-pop fan meetups, dance meets, merch signings, K-fashion & K-beauty pop-ups, and karaoke nights around the world — bringing the community together under a shared love of K-pop and positivity.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/events" },
  openGraph: { title: TITLE, description: DESC, url: "https://www.aegyoarena.com/events", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

type Row = {
  id: string; title: string; titleEs: string | null; category: string; city: string | null; citySlug: string | null;
  country: string | null; venue: string | null; startsAt: Date | null; dateText: string | null;
  description: string | null; descriptionEs: string | null; source: string | null; sourceUrl: string;
};

const CAT: Record<string, { label: string; labelEs: string; emoji: string; color: string }> = {
  kpop:    { label: "K-pop",      labelEs: "K-pop",     emoji: "💜", color: "#C77DFF" },
  kbeauty: { label: "K-Beauty",   labelEs: "K-Beauty",  emoji: "💄", color: "#FF6FA8" },
  dance:   { label: "Dance",      labelEs: "Baile",     emoji: "🕺", color: "#4AC8F0" },
  anime:   { label: "Anime",      labelEs: "Anime",     emoji: "🎌", color: "#FF8C42" },
  comicon: { label: "Comic-Con",  labelEs: "Comic-Con", emoji: "🦸", color: "#C8F04A" },
  store:   { label: "Store",      labelEs: "Tienda",    emoji: "🛍", color: "#B8A0FF" },
  meetup:  { label: "Meetup",     labelEs: "Encuentro", emoji: "🗓", color: "#4ECDC4" },
  other:   { label: "Event",      labelEs: "Evento",    emoji: "✨", color: "#FFD700" },
};

async function getEvents(): Promise<Row[]> {
  try {
    // Idempotently ensure the table exists so the page never 500s before the first scan.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ScannedEvent" (
        "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "category" TEXT NOT NULL,
        "city" TEXT, "citySlug" TEXT, "country" TEXT, "venue" TEXT, "startsAt" TIMESTAMP,
        "dateText" TEXT, "description" TEXT, "source" TEXT, "sourceUrl" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'live', "createdAt" TIMESTAMP NOT NULL DEFAULT now())`);
    // Spanish columns are added additively (the migration may lag); safe + idempotent.
    await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "titleEs" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "descriptionEs" TEXT`);
    return await prisma.$queryRawUnsafe<Row[]>(
      `SELECT "id","title","titleEs","category","city","citySlug","country","venue","startsAt","dateText","description","descriptionEs","source","sourceUrl"
       FROM "ScannedEvent"
       WHERE "status" = 'live' AND ("startsAt" IS NULL OR "startsAt" >= now() - interval '1 day')
       ORDER BY ("startsAt" IS NULL), "startsAt" ASC, "createdAt" DESC
       LIMIT 200`
    );
  } catch {
    return [];
  }
}

// Rendered on the server, so both languages are formatted up front and <T> picks
// one at render time. `dateText` is free-text from the source listing — left as-is.
function fmtDate(r: Row, locale: string): string {
  if (r.startsAt) {
    try { return new Date(r.startsAt).toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric" }); } catch { /* fall through */ }
  }
  return r.dateText ?? "";
}

const ACTIVITY = [
  { e: "💜", en: "Fan meetups", es: "Meetups de fans" },
  { e: "🕺", en: "Dance meets", es: "Sesiones de baile" },
  { e: "🛍", en: "Merch signings", es: "Firmas de merch" },
  { e: "💄", en: "K-fashion & beauty", es: "K-fashion y beauty" },
  { e: "🎤", en: "Karaoke nights", es: "Noches de karaoke" },
];

// Editorial, image-forward events page (styled after Artsy's "Shows near you"):
// big postcard cover cards in a clean grid, serif titles, venue + date + city, and a
// browse-by-city bar — leaning into the "travel for the show, stay for the community"
// idea (fans crossing cities to make new friends).
export default async function EventsPage() {
  const events = await getEvents();

  // Distinct cities (with counts) for the browse bar — the "location" affordance.
  const cityMap = new Map<string, { city: string; slug: string; n: number }>();
  for (const e of events) {
    if (!e.citySlug) continue;
    const cur = cityMap.get(e.citySlug) ?? { city: e.city ?? e.citySlug, slug: e.citySlug, n: 0 };
    cur.n++; cityMap.set(e.citySlug, cur);
  }
  const cities = [...cityMap.values()].sort((a, b) => b.n - a.n);

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .evt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 34px 26px; }
        .evt-card { display: block; text-decoration: none; }
        .evt-cover { position: relative; aspect-ratio: 4 / 3; border-radius: 5px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.18); }
        .evt-fill { transition: transform .55s cubic-bezier(.2,.6,.2,1); }
        .evt-card:hover .evt-fill { transform: scale(1.05); }
        .evt-title { transition: color .18s ease; }
        .evt-card:hover .evt-title { color: var(--sakura); }
        .evt-city-chip { transition: border-color .18s, color .18s; }
        .evt-city-chip:hover { border-color: var(--sakura); color: var(--sakura); }
      `}</style>

      {/* ── Editorial header ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "46px 24px 10px" }}>
        <LangToggle align="flex-start" marginBottom={18} />
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 18 }}>
          <T en={`Community · ${events.length} events · ${cities.length} cities`} es={`Comunidad · ${events.length} eventos · ${cities.length} ciudades`} />
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem, 6.5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.02em", color: "var(--ink)", margin: "0 0 20px", maxWidth: 900 }}>
          <T en="Fan events near you" es="Eventos para fans cerca de ti" />
        </h1>
        <p style={{ fontSize: "1.12rem", lineHeight: 1.62, color: "var(--ink-dim)", maxWidth: 640, margin: "0 0 24px" }}>
          <T
            en="BTS fans travel for the show and stay for the community. Find the meetups, dance nights, cupsleeve cafés and karaoke in every city on the tour — and make new friends in a new city."
            es="Los fans de BTS viajan por el show y se quedan por la comunidad. Encuentra los meetups, noches de baile, cafés cupsleeve y karaoke en cada ciudad de la gira — y haz nuevos amigos en una nueva ciudad."
          />
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ACTIVITY.map((t) => (
            <span key={t.en} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: 999, padding: "6px 13px", fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-dim)" }}>
              {t.e} <T en={t.en} es={t.es} />
            </span>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "10px 24px 0" }}>
        <ArcadeCTA margin="8px 0 0" />
      </section>

      {/* ── Browse by city (the location bar) ────────────────────────────── */}
      {cities.length > 0 && (
        <section style={{ maxWidth: 1220, margin: "0 auto", padding: "26px 24px 4px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--border)", paddingTop: 20, marginBottom: 14 }}>
            <div style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
              <T en="Browse by city" es="Explora por ciudad" />
            </div>
            <Link href="/cities" style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--sakura)", textDecoration: "none" }}>
              <T en="All city guides →" es="Todas las guías de ciudades →" />
            </Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {cities.slice(0, 24).map((c) => (
              <Link key={c.slug} href={`/cities/${c.slug}`} className="evt-city-chip" style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--border)", borderRadius: 999, padding: "7px 14px", fontSize: "0.84rem", fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}>
                {c.city} <span style={{ color: "var(--ink-faint)", fontSize: "0.72rem", fontVariantNumeric: "tabular-nums" }}>{c.n}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Events grid ──────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "30px 24px 90px" }}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--ink-dim)", lineHeight: 1.8, border: "1px solid var(--border)", borderRadius: 12 }}>
            <div style={{ fontSize: "2.6rem", marginBottom: 12 }}>🗓</div>
            <div style={{ fontFamily: "var(--serif)", fontWeight: 800, color: "var(--ink)", fontSize: "1.3rem", marginBottom: 8 }}>
              <T en="No events posted yet" es="Aún no hay eventos publicados" />
            </div>
            <div style={{ fontSize: "0.94rem", maxWidth: 480, margin: "0 auto" }}>
              <T en="Our scanner sweeps event platforms daily for local fan gatherings. Check back soon — or explore " es="Nuestro escáner revisa las plataformas de eventos a diario en busca de encuentros locales. Vuelve pronto — o explora los " />
              <Link href="/cities/meetups" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
                <T en="recurring meetups by city" es="encuentros recurrentes por ciudad" />
              </Link>.
            </div>
          </div>
        ) : (
          <div className="evt-grid">
            {events.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 44, paddingTop: 20, textAlign: "center", color: "var(--ink-faint)", fontSize: "0.78rem", lineHeight: 1.7, maxWidth: 640, margin: "44px auto 0" }}>
          <T
            en="Every event links to a real listing — we aggregate from public pages and never invent an event. Always confirm details on the source page before you travel."
            es="Cada evento enlaza a un listado real — recopilamos de páginas públicas y nunca inventamos un evento. Confirma siempre los detalles en la página de origen antes de viajar."
          />
        </div>
      </section>
    </main>
  );
}

// Artsy-style show card: a postcard cover (city name over a category-tinted gradient),
// then venue (gallery-name style) · serif title · location + date · source link.
function EventCard({ e }: { e: Row }) {
  const cat = CAT[e.category] ?? CAT.other;
  const whenEn = fmtDate(e, "en-US");
  const whenEs = fmtDate(e, "es-419");
  const cityLabel = e.city ?? "";
  const cityImg = cityImage(e.citySlug);

  return (
    <a className="evt-card" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">
      <div className="evt-cover">
        {cityImg ? (
          <>
            {/* real city photo cover (free stock) + legibility overlay + category tint */}
            <img className="evt-fill" src={cityImg} alt={cityLabel || "city"} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 38%, rgba(10,8,16,0.86) 100%), linear-gradient(115deg, ${cat.color}40 0%, transparent 55%)` }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: 16 }}>
              <span style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: "clamp(1.5rem, 3.4vw, 2.15rem)", color: "#fff", lineHeight: 1.02, letterSpacing: "-0.015em", textShadow: "0 2px 22px rgba(0,0,0,0.55)" }}>{cityLabel}</span>
            </div>
          </>
        ) : (
          /* postcard fallback: category-tinted gradient + big city name */
          <div className="evt-fill" style={{ position: "absolute", inset: 0, background: `radial-gradient(125% 120% at 18% 12%, ${cat.color} 0%, ${cat.color}c0 42%, #16121f 116%)`, display: "flex", alignItems: "flex-end", padding: 16 }}>
            <span aria-hidden style={{ position: "absolute", top: -14, right: 4, fontSize: "6rem", opacity: 0.16, filter: "grayscale(0.1)" }}>{cat.emoji}</span>
            <span style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: "clamp(1.5rem, 3.4vw, 2.15rem)", color: "#fff", lineHeight: 1.02, letterSpacing: "-0.015em", textShadow: "0 2px 22px rgba(0,0,0,0.45)" }}>{cityLabel}</span>
          </div>
        )}
        <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.46)", backdropFilter: "blur(5px)", color: "#fff", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 999 }}>
          {cat.emoji} <T en={cat.label} es={cat.labelEs} />
        </span>
        {whenEn && (
          <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.94)", color: "#111", fontSize: "0.62rem", fontWeight: 800, padding: "4px 9px", borderRadius: 999, maxWidth: "62%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <T en={whenEn} es={whenEs} />
          </span>
        )}
      </div>

      <div style={{ padding: "14px 2px 0" }}>
        {e.venue && (
          <div style={{ fontSize: "0.66rem", letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.venue}</div>
        )}
        <div className="evt-title" style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1.22, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          <T en={e.title} es={e.titleEs} />
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--ink-dim)", marginBottom: e.description ? 8 : 10 }}>
          {[cityLabel, e.country].filter(Boolean).join(", ")}
        </div>
        {e.description && (
          <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            <T en={e.description} es={e.descriptionEs} />
          </div>
        )}
        <span style={{ fontSize: "0.72rem", color: cat.color, fontWeight: 800 }}>
          <T en={e.source ? `Details on ${e.source}` : "View details"} es={e.source ? `Detalles en ${e.source}` : "Ver detalles"} /> →
        </span>
      </div>
    </a>
  );
}
