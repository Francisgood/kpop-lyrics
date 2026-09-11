import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";
import ArcadeCTA from "@/components/ArcadeCTA";
import EventRegisterForm from "@/components/EventRegisterForm";
import { HOSTED_EVENTS, hostedEventBySlug, hostedEventUrl, type HostedEvent } from "@/lib/hosted-events";

export const revalidate = 3600;

export function generateStaticParams() {
  return HOSTED_EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = hostedEventBySlug(slug);
  if (!e) return { title: "Event not found — Aegyo Arena" };
  const title = `${e.title} — Aegyo Arena`;
  return {
    title,
    description: e.summary,
    alternates: { canonical: `/events/${e.slug}` },
    openGraph: { title, description: e.summary, url: hostedEventUrl(e), type: "website", images: [{ url: e.cover }] },
    twitter: { card: "summary_large_image", title, description: e.summary, images: [e.cover] },
  };
}

// Date strings are built by hand (not Intl) so the server and the client agree
// exactly, and read with the UTC getters because the stored time is local
// wall-clock parked in a UTC field.
const MON_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DOW_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DOW_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function longDate(iso: string, l: "en" | "es") {
  const d = new Date(iso);
  return l === "es"
    ? `${DOW_ES[d.getUTCDay()]} ${d.getUTCDate()} de ${MON_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
    : `${DOW_EN[d.getUTCDay()]}, ${MON_EN[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Google Calendar's "add event" template wants a naive UTC stamp. */
function gcalStamp(iso: string) {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function calendarUrl(e: HostedEvent) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${gcalStamp(e.startsAt)}/${gcalStamp(e.endsAt)}`,
    details: `${e.summary}\n\n${hostedEventUrl(e)}`,
    location: e.address,
    ctz: "America/New_York",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// A hosted listing for an event Aegyo Arena runs itself — this page IS the listing
// the /events feed links to, which is what keeps the "never invent an event" promise
// true for first-party meetups.
export default async function HostedEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = hostedEventBySlug(slug);
  if (!e) notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapQuery)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.startsAt,
    endDate: e.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: e.summary,
    image: [e.cover],
    url: hostedEventUrl(e),
    location: { "@type": "Place", name: e.venue, address: e.address },
    organizer: [{ "@type": "Organization", name: "Aegyo Arena", url: "https://www.aegyoarena.com" },
                { "@type": "Organization", name: e.host.name, url: e.host.url }],
    isAccessibleForFree: e.free,
    offers: e.free ? { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: hostedEventUrl(e) } : undefined,
  };

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        .ev-hero { position:relative; height:clamp(280px, 44vw, 460px); overflow:hidden; }
        .ev-hero img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .ev-body { display:grid; grid-template-columns: 1fr 330px; gap:38px; }
        @media (max-width: 900px) { .ev-body { grid-template-columns:1fr; gap:26px; } }
        .ev-btn { display:block; text-align:center; padding:14px 18px; border-radius:5px; font-weight:800; font-size:.92rem; text-decoration:none; }
        .ev-btn-primary { background:var(--sakura); color:#1B2027; }
        .ev-btn-primary:hover { filter:brightness(1.08); }
        .ev-btn-ghost { border:1px solid var(--border-strong); color:var(--ink); }
        .ev-btn-ghost:hover { border-color:var(--sakura); color:var(--sakura); }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="ev-hero">
        <img src={e.cover} alt={e.venue} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.12) 34%, rgba(20,18,26,.93) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end" }}>
          <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", padding: "0 24px 26px" }}>
            <div style={{ display: "inline-block", background: "var(--sakura)", color: "#1B2027", fontSize: ".58rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 9px", borderRadius: 3, marginBottom: 12 }}>
              <T en="An Aegyo Arena event" es="Un evento de Aegyo Arena" />
            </div>
            <h1 style={{ fontFamily: "var(--sans)", fontSize: "clamp(1.8rem, 4.6vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.028em", lineHeight: 1.05, color: "#fff", margin: 0, maxWidth: 880, textShadow: "0 2px 26px rgba(0,0,0,.5)" }}>
              <T en={e.title} es={e.titleEs} />
            </h1>
            {e.registration && (
              <a href="#register" className="ev-btn ev-btn-primary" style={{ display: "inline-block", marginTop: 16, padding: "12px 26px" }}>
                <T en="Register to attend" es="Regístrate para asistir" />
              </a>
            )}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 6, right: 12, fontSize: ".58rem", color: "rgba(255,255,255,.45)" }}>{e.coverCredit}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 24px 80px" }}>
        <LangToggle align="flex-start" marginBottom={18} />

        <div className="ev-body">
          {/* ── Main column ───────────────────────────────────────────── */}
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--sakura)", marginBottom: 6 }}>
              <T en={longDate(e.startsAt, "en")} es={longDate(e.startsAt, "es")} /> · <T en={e.timeText} es={e.timeTextEs} />
            </div>
            <div style={{ fontSize: ".95rem", color: "var(--ink-dim)", marginBottom: 26 }}>
              {e.venue} · {e.address}
            </div>

            {e.body.map((para, i) => (
              <p key={i} style={{ fontSize: "1.03rem", lineHeight: 1.72, color: "var(--ink-dim)", margin: "0 0 16px" }}>
                <T en={para} es={e.bodyEs[i]} />
              </p>
            ))}

            <h2 style={{ fontFamily: "var(--sans)", fontSize: ".84rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink)", margin: "30px 0 12px" }}>
              <T en="What to expect" es="Qué esperar" />
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {e.expect.map((x) => (
                <li key={x.en} style={{ display: "flex", gap: 11, fontSize: ".96rem", lineHeight: 1.6, color: "var(--ink-dim)" }}>
                  <span style={{ color: "var(--sakura)", fontWeight: 900 }}>→</span>
                  <span><T en={x.en} es={x.es} /></span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 30, border: "1px solid var(--border)", borderRadius: 8, padding: "18px 20px", background: "var(--bg-card)" }}>
              <div style={{ fontSize: ".62rem", fontWeight: 900, letterSpacing: ".13em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 7 }}>
                <T en="Hosted with" es="Con" />
              </div>
              <a href={e.host.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--ink)", textDecoration: "none" }}>
                {e.host.name} <span style={{ color: "var(--sakura)", fontSize: ".82rem" }}>↗</span>
              </a>
              <p style={{ fontSize: ".92rem", lineHeight: 1.62, color: "var(--ink-dim)", margin: "8px 0 0" }}>
                <T en={e.host.blurb} es={e.host.blurbEs} />
              </p>
            </div>

            <ArcadeCTA margin="30px 0 0" />
          </div>

          {/* ── Sticky detail rail ────────────────────────────────────── */}
          <aside>
            <div style={{ position: "sticky", top: 20, border: "1px solid var(--border)", borderRadius: 8, padding: 20, background: "var(--bg-card)" }}>
              <Detail label={<T en="When" es="Cuándo" />} value={<><T en={longDate(e.startsAt, "en")} es={longDate(e.startsAt, "es")} /><br /><T en={e.timeText} es={e.timeTextEs} /></>} />
              <Detail label={<T en="Where" es="Dónde" />} value={<>{e.venue}<br /><span style={{ color: "var(--ink-faint)" }}>{e.address}</span></>} />
              <Detail label={<T en="Price" es="Precio" />} value={e.free ? (e.registration ? <T en="Free — registration required" es="Gratis — registro obligatorio" /> : <T en="Free — no ticket needed" es="Gratis — sin entrada" />) : <T en="See listing" es="Ver listado" />} />
              <Detail label={<T en="City" es="Ciudad" />} value={<Link href={`/cities/${e.citySlug}`} style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>{e.city} <T en="city guide →" es="guía de la ciudad →" /></Link>} />

              {e.registration && (
                <div id="register" style={{ marginTop: 16, marginBottom: 4, scrollMarginTop: 20 }}>
                  <EventRegisterForm slug={e.slug} />
                </div>
              )}

              <div style={{ display: "grid", gap: 9, marginTop: 16 }}>
                <a className="ev-btn ev-btn-ghost" href={calendarUrl(e)} target="_blank" rel="noopener noreferrer">
                  <T en="Add to calendar" es="Añadir al calendario" />
                </a>
                <a className="ev-btn ev-btn-ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <T en="Get directions" es="Cómo llegar" />
                </a>
                <Link className="ev-btn ev-btn-ghost" href="/events">
                  <T en="All fan events" es="Todos los eventos" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: ".6rem", fontWeight: 900, letterSpacing: ".13em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: ".92rem", lineHeight: 1.55, color: "var(--ink)", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
