import Link from "next/link";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";

const TITLE = "K-pop Fan Meetups Worldwide — Aegyo Arena";
const DESC =
  "Find local K-pop fan meetups, random-play-dance circles, and community gatherings near you — now with expanded coverage across Latin America, from Mexico City to Buenos Aires.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/cities/meetups" },
  openGraph: { title: TITLE, description: DESC, url: "https://www.aegyoarena.com/cities/meetups", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

// Curated meetup index — each city links to its full guide at /cities/[slug].
// `isNew` flags the latest expansion (a growing Latin America + Oceania focus).
type City = { slug: string; name: string; flag: string; teaser: string; teaserEs: string; isNew?: boolean };
type Region = { title: string; titleEs: string; blurb: string; blurbEs: string; cities: City[] };

const REGIONS: Region[] = [
  {
    title: "Latin America",
    titleEs: "América Latina",
    blurb: "Our fastest-growing region — huge random-play-dance turnouts and record-breaking fan drives.",
    blurbEs: "Nuestra región de mayor crecimiento — convocatorias enormes de random play dance y campañas de fans que rompen récords.",
    cities: [
      { slug: "mexico-city", name: "Mexico City", flag: "🇲🇽", teaser: "CDMX Stan Network — Parque España, monthly.", teaserEs: "CDMX Stan Network — Parque España, cada mes." },
      { slug: "guadalajara", name: "Guadalajara", flag: "🇲🇽", teaser: "Downtown random play dance at Plaza de la Liberación.", teaserEs: "Random play dance en el centro, en la Plaza de la Liberación.", isNew: true },
      { slug: "monterrey", name: "Monterrey", flag: "🇲🇽", teaser: "MTY K-pop Fans meet at Parque Fundidora.", teaserEs: "MTY K-pop Fans se reúnen en el Parque Fundidora.", isNew: true },
      { slug: "puebla", name: "Puebla", flag: "🇲🇽", teaser: "Zócalo meetups + Angelópolis dance crew.", teaserEs: "Meetups en el Zócalo + crew de baile en Angelópolis.", isNew: true },
      { slug: "tijuana", name: "Tijuana", flag: "🇲🇽", teaser: "Cross-border scene — RPD at Plaza Río.", teaserEs: "Escena fronteriza — RPD en Plaza Río.", isNew: true },
      { slug: "chihuahua", name: "Chihuahua", flag: "🇲🇽", teaser: "Plaza del Ángel monthly meetup.", teaserEs: "Meetup mensual en la Plaza del Ángel.", isNew: true },
      { slug: "sao-paulo", name: "São Paulo", flag: "🇧🇷", teaser: "Brazil's biggest fan gatherings and dance battles.", teaserEs: "Las reuniones de fans y batallas de baile más grandes de Brasil." },
      { slug: "rio-de-janeiro", name: "Rio de Janeiro", flag: "🇧🇷", teaser: "Open-air meetups at Aterro do Flamengo.", teaserEs: "Meetups al aire libre en el Aterro do Flamengo.", isNew: true },
      { slug: "buenos-aires", name: "Buenos Aires", flag: "🇦🇷", teaser: "Barrio Coreano meets and RPD circles.", teaserEs: "Encuentros en el Barrio Coreano y círculos de RPD." },
      { slug: "santiago", name: "Santiago", flag: "🇨🇱", teaser: "Parque Forestal meetups — one of LatAm's most devoted scenes.", teaserEs: "Meetups en el Parque Forestal — una de las escenas más fieles de LatAm.", isNew: true },
      { slug: "bogota", name: "Bogotá", flag: "🇨🇴", teaser: "RPD at Parque Simón Bolívar, monthly meets.", teaserEs: "RPD en el Parque Simón Bolívar, encuentros cada mes.", isNew: true },
      { slug: "medellin", name: "Medellín", flag: "🇨🇴", teaser: "Parque de los Deseos fan gatherings.", teaserEs: "Reuniones de fans en el Parque de los Deseos.", isNew: true },
    ],
  },
  {
    title: "North America",
    titleEs: "América del Norte",
    blurb: "From coast to coast — listening parties, dance covers, and Koreatown meets.",
    blurbEs: "De costa a costa — listening parties, dance covers y encuentros en los Koreatowns.",
    cities: [
      { slug: "new-york", name: "New York", flag: "🇺🇸", teaser: "NYC ARMY meetup — Central Park, monthly.", teaserEs: "Meetup de NYC ARMY — Central Park, cada mes." },
      { slug: "los-angeles", name: "Los Angeles", flag: "🇺🇸", teaser: "Ktown meets and dance-cover crews.", teaserEs: "Encuentros en Ktown y crews de dance cover." },
      { slug: "dallas", name: "Dallas", flag: "🇺🇸", teaser: "DFW K-pop Meet in Koreatown.", teaserEs: "DFW K-pop Meet en Koreatown." },
      { slug: "toronto", name: "Toronto", flag: "🇨🇦", teaser: "Nathan Phillips Square meets + Bloor St Koreatown.", teaserEs: "Encuentros en Nathan Phillips Square + el Koreatown de Bloor St.", isNew: true },
    ],
  },
  {
    title: "Oceania",
    titleEs: "Oceanía",
    blurb: "New coverage down under — Fed Square to Darling Harbour.",
    blurbEs: "Nueva cobertura en Oceanía — de Fed Square a Darling Harbour.",
    cities: [
      { slug: "melbourne", name: "Melbourne", flag: "🇦🇺", teaser: "Federation Square meetups + RPD.", teaserEs: "Meetups en Federation Square + RPD.", isNew: true },
      { slug: "sydney", name: "Sydney", flag: "🇦🇺", teaser: "Darling Harbour meets + Town Hall RPD.", teaserEs: "Encuentros en Darling Harbour + RPD en el Town Hall.", isNew: true },
    ],
  },
  {
    title: "Europe, Asia & More",
    titleEs: "Europa, Asia y Más",
    blurb: "Established scenes across the rest of the map.",
    blurbEs: "Escenas ya consolidadas en el resto del mapa.",
    cities: [
      { slug: "london", name: "London", flag: "🇬🇧", teaser: "UK fan meets and dance sessions.", teaserEs: "Encuentros de fans y sesiones de baile en el Reino Unido." },
      { slug: "paris", name: "Paris", flag: "🇫🇷", teaser: "Trocadéro meetups and RPD.", teaserEs: "Meetups en el Trocadéro y RPD." },
      { slug: "seoul", name: "Seoul", flag: "🇰🇷", teaser: "The home turf — Hongdae and Gangnam meets.", teaserEs: "La casa del K-pop — encuentros en Hongdae y Gangnam." },
      { slug: "tokyo", name: "Tokyo", flag: "🇯🇵", teaser: "Shin-Okubo Koreatown fan culture.", teaserEs: "Cultura fan en el Koreatown de Shin-Okubo." },
      { slug: "manila", name: "Manila", flag: "🇵🇭", teaser: "One of Asia's most active fan scenes.", teaserEs: "Una de las escenas de fans más activas de Asia." },
      { slug: "bangkok", name: "Bangkok", flag: "🇹🇭", teaser: "Siam-area meets and dance covers.", teaserEs: "Encuentros en la zona de Siam y dance covers." },
    ],
  },
];

export default function MeetupsPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 44px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>
            <T en="Cities · Update" es="Ciudades · Actualización" />
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.06, margin: "0 0 14px" }}>
            <T en="Find a K-pop meetup near you" es="Encuentra un meetup de K-pop cerca de ti" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 620, fontSize: "1.02rem", lineHeight: 1.7 }}>
            <T
              en="Fan-organized meetups, random-play-dance circles, and community gatherings around the world — no ticket required. We just expanded coverage across "
              es="Meetups organizados por fans, círculos de random play dance y reuniones comunitarias en todo el mundo — no se necesita boleto. Acabamos de ampliar la cobertura en "
            />
            <strong style={{ color: "#fff" }}><T en="Latin America" es="América Latina" /></strong>
            <T
              en=" (Guadalajara, Monterrey, Puebla, Tijuana, Chihuahua, Rio, Santiago, Bogotá & Medellín) plus Toronto, Melbourne & Sydney."
              es=" (Guadalajara, Monterrey, Puebla, Tijuana, Chihuahua, Rio, Santiago, Bogotá y Medellín) más Toronto, Melbourne y Sydney."
            />
          </p>
          <div style={{ marginTop: 20 }}>
            <Link href="/cities" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              <T en="Browse all city guides →" es="Explora todas las guías de ciudades →" />
            </Link>
          </div>
        </div>
      </section>

      {/* Regions */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 24px 72px" }}>
        {REGIONS.map((region) => (
          <section key={region.title} style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>
              <T en={region.title} es={region.titleEs} />
            </h2>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", margin: "0 0 18px" }}>
              <T en={region.blurb} es={region.blurbEs} />
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {region.cities.map((c) => (
                <Link key={c.slug} href={`/cities/${c.slug}`} className="genius-card" style={{ textDecoration: "none", padding: 18, display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: "1.5rem" }}>{c.flag}</span>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)" }}>{c.name}</span>
                    {c.isNew && (
                      <span style={{ marginLeft: "auto", background: "var(--sakura)", color: "var(--on-accent)", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                        <T en="New" es="Nuevo" />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)", lineHeight: 1.55 }}>
                    <T en={c.teaser} es={c.teaserEs} />
                  </div>
                  <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--sakura)", fontWeight: 700 }}>
                    <T en={`View ${c.name} guide →`} es={`Ver guía de ${c.name} →`} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center", color: "var(--ink-faint)", fontSize: "0.82rem", lineHeight: 1.7 }}>
          <T
            en="Organizing a meetup in your city? Meetups shown are fan-run and community-organized."
            es="¿Organizas un meetup en tu ciudad? Los meetups que aparecen aquí son organizados por fans y por la comunidad."
          />{" "}
          <Link href="/contribute" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
            <T en="Tell us about yours →" es="Cuéntanos sobre el tuyo →" />
          </Link>
        </div>
      </div>
    </main>
  );
}
