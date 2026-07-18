import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { T, LangToggle } from "@/components/LangProvider";

export const dynamic = "force-dynamic";

const TITLE = "K-pop Fan Events & Meetups Near You — Aegyo Arena";
const DESC =
  "A daily-updated feed of local K-pop fan meetups, K-beauty brand activations, dance meets, anime & comic cons, and K-pop store events around the world.";

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

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 44px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>
            <T en="Community · Live feed" es="Comunidad · Feed en vivo" />
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.06, margin: "0 0 14px" }}>
            <T en="Fan events near you" es="Eventos para fans cerca de ti" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 620, fontSize: "1.02rem", lineHeight: 1.7 }}>
            <T
              en="Local K-pop meetups, K-beauty pop-ups, dance meets, anime & comic cons, and K-pop store events — refreshed daily. Also see recurring "
              es="Encuentros locales de K-pop, pop-ups de K-beauty, sesiones de baile, convenciones de anime y cómics, y eventos en tiendas de K-pop — se actualiza a diario. También mira los "
            />
            <Link href="/cities/meetups" style={{ color: "var(--sakura)", fontWeight: 700 }}>
              <T en="fan meetups by city" es="encuentros recurrentes de fans por ciudad" />
            </Link>
            <T en=" and full " es=" y las " />
            <Link href="/cities" style={{ color: "var(--sakura)", fontWeight: 700 }}>
              <T en="city guides" es="guías completas de ciudades" />
            </Link>
            .
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 72px" }}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--ink-dim)", lineHeight: 1.8 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🗓</div>
            <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1.1rem", marginBottom: 6 }}>
              <T en="No events posted yet" es="Aún no hay eventos publicados" />
            </div>
            <div style={{ fontSize: "0.92rem", maxWidth: 460, margin: "0 auto" }}>
              <T
                en="Our scanner sweeps event platforms daily for local fan meetups and activations. Check back soon — or explore "
                es="Nuestro escáner revisa las plataformas de eventos a diario en busca de encuentros y activaciones locales. Vuelve pronto — o explora los "
              />
              <Link href="/cities/meetups" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
                <T en="recurring meetups by city" es="encuentros recurrentes por ciudad" />
              </Link>
              .
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {events.map((e) => {
              const cat = CAT[e.category] ?? CAT.other;
              const whenEn = fmtDate(e, "en-US");
              const whenEs = fmtDate(e, "es-419");
              const place = [e.venue, e.city].filter(Boolean).join(" · ");
              return (
                <div key={e.id} className="genius-card" style={{ padding: 18, display: "flex", flexDirection: "column", borderLeft: `3px solid ${cat.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ background: `${cat.color}22`, color: "var(--ink)", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase" }}>
                      {cat.emoji} <T en={cat.label} es={cat.labelEs} />
                    </span>
                    {e.country && <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--ink-faint)" }}>{e.country}</span>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)", lineHeight: 1.35, marginBottom: 6 }}><T en={e.title} es={e.titleEs} /></div>
                  {(place || whenEn) && (
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-dim)", marginBottom: 8 }}>
                      {place && <span>📍 {place}</span>}{place && whenEn ? " · " : ""}{whenEn && <span>🗓 <T en={whenEn} es={whenEs} /></span>}
                    </div>
                  )}
                  {e.description && <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)", lineHeight: 1.55, marginBottom: 12, flex: 1 }}><T en={e.description} es={e.descriptionEs} /></div>}
                  <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: "auto", fontSize: "0.78rem", color: cat.color, fontWeight: 800, textDecoration: "none" }}>
                    <T
                      en={e.source ? `Details on ${e.source}` : "Details"}
                      es={e.source ? `Detalles en ${e.source}` : "Detalles"}
                    /> →
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 32, paddingTop: 20, textAlign: "center", color: "var(--ink-faint)", fontSize: "0.78rem", lineHeight: 1.7 }}>
          <T
            en="Events are aggregated automatically from public event listings — always confirm details on the source page."
            es="Los eventos se recopilan automáticamente de listados públicos — confirma siempre los detalles en la página de origen."
          />
        </div>
      </div>
    </main>
  );
}
