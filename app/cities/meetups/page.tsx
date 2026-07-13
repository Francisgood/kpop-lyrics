import Link from "next/link";
import type { Metadata } from "next";

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
type City = { slug: string; name: string; flag: string; teaser: string; isNew?: boolean };
type Region = { title: string; blurb: string; cities: City[] };

const REGIONS: Region[] = [
  {
    title: "Latin America",
    blurb: "Our fastest-growing region — huge random-play-dance turnouts and record-breaking fan drives.",
    cities: [
      { slug: "mexico-city", name: "Mexico City", flag: "🇲🇽", teaser: "CDMX Stan Network — Parque España, monthly." },
      { slug: "guadalajara", name: "Guadalajara", flag: "🇲🇽", teaser: "Downtown random play dance at Plaza de la Liberación.", isNew: true },
      { slug: "monterrey", name: "Monterrey", flag: "🇲🇽", teaser: "MTY K-pop Fans meet at Parque Fundidora.", isNew: true },
      { slug: "puebla", name: "Puebla", flag: "🇲🇽", teaser: "Zócalo meetups + Angelópolis dance crew.", isNew: true },
      { slug: "tijuana", name: "Tijuana", flag: "🇲🇽", teaser: "Cross-border scene — RPD at Plaza Río.", isNew: true },
      { slug: "chihuahua", name: "Chihuahua", flag: "🇲🇽", teaser: "Plaza del Ángel monthly meetup.", isNew: true },
      { slug: "sao-paulo", name: "São Paulo", flag: "🇧🇷", teaser: "Brazil's biggest fan gatherings and dance battles." },
      { slug: "rio-de-janeiro", name: "Rio de Janeiro", flag: "🇧🇷", teaser: "Open-air meetups at Aterro do Flamengo.", isNew: true },
      { slug: "buenos-aires", name: "Buenos Aires", flag: "🇦🇷", teaser: "Barrio Coreano meets and RPD circles." },
      { slug: "santiago", name: "Santiago", flag: "🇨🇱", teaser: "Parque Forestal meetups — one of LatAm's most devoted scenes.", isNew: true },
      { slug: "bogota", name: "Bogotá", flag: "🇨🇴", teaser: "RPD at Parque Simón Bolívar, monthly meets.", isNew: true },
      { slug: "medellin", name: "Medellín", flag: "🇨🇴", teaser: "Parque de los Deseos fan gatherings.", isNew: true },
    ],
  },
  {
    title: "North America",
    blurb: "From coast to coast — listening parties, dance covers, and Koreatown meets.",
    cities: [
      { slug: "new-york", name: "New York", flag: "🇺🇸", teaser: "NYC ARMY meetup — Central Park, monthly." },
      { slug: "los-angeles", name: "Los Angeles", flag: "🇺🇸", teaser: "Ktown meets and dance-cover crews." },
      { slug: "dallas", name: "Dallas", flag: "🇺🇸", teaser: "DFW K-pop Meet in Koreatown." },
      { slug: "toronto", name: "Toronto", flag: "🇨🇦", teaser: "Nathan Phillips Square meets + Bloor St Koreatown.", isNew: true },
    ],
  },
  {
    title: "Oceania",
    blurb: "New coverage down under — Fed Square to Darling Harbour.",
    cities: [
      { slug: "melbourne", name: "Melbourne", flag: "🇦🇺", teaser: "Federation Square meetups + RPD.", isNew: true },
      { slug: "sydney", name: "Sydney", flag: "🇦🇺", teaser: "Darling Harbour meets + Town Hall RPD.", isNew: true },
    ],
  },
  {
    title: "Europe, Asia & More",
    blurb: "Established scenes across the rest of the map.",
    cities: [
      { slug: "london", name: "London", flag: "🇬🇧", teaser: "UK fan meets and dance sessions." },
      { slug: "paris", name: "Paris", flag: "🇫🇷", teaser: "Trocadéro meetups and RPD." },
      { slug: "seoul", name: "Seoul", flag: "🇰🇷", teaser: "The home turf — Hongdae and Gangnam meets." },
      { slug: "tokyo", name: "Tokyo", flag: "🇯🇵", teaser: "Shin-Okubo Koreatown fan culture." },
      { slug: "manila", name: "Manila", flag: "🇵🇭", teaser: "One of Asia's most active fan scenes." },
      { slug: "bangkok", name: "Bangkok", flag: "🇹🇭", teaser: "Siam-area meets and dance covers." },
    ],
  },
];

export default function MeetupsPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 44px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>
            Cities · Update
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.06, margin: "0 0 14px" }}>Find a K-pop meetup near you</h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 620, fontSize: "1.02rem", lineHeight: 1.7 }}>
            Fan-organized meetups, random-play-dance circles, and community gatherings around the world — no ticket required.
            We just expanded coverage across <strong style={{ color: "#fff" }}>Latin America</strong> (Guadalajara, Monterrey, Puebla,
            Tijuana, Chihuahua, Rio, Santiago, Bogotá &amp; Medellín) plus Toronto, Melbourne &amp; Sydney.
          </p>
          <div style={{ marginTop: 20 }}>
            <Link href="/cities" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              Browse all city guides →
            </Link>
          </div>
        </div>
      </section>

      {/* Regions */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 24px 72px" }}>
        {REGIONS.map((region) => (
          <section key={region.title} style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>{region.title}</h2>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", margin: "0 0 18px" }}>{region.blurb}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {region.cities.map((c) => (
                <Link key={c.slug} href={`/cities/${c.slug}`} className="genius-card" style={{ textDecoration: "none", padding: 18, display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: "1.5rem" }}>{c.flag}</span>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)" }}>{c.name}</span>
                    {c.isNew && (
                      <span style={{ marginLeft: "auto", background: "var(--sakura)", color: "var(--on-accent)", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>New</span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)", lineHeight: 1.55 }}>{c.teaser}</div>
                  <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--sakura)", fontWeight: 700 }}>View {c.name} guide →</div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center", color: "var(--ink-faint)", fontSize: "0.82rem", lineHeight: 1.7 }}>
          Organizing a meetup in your city? Meetups shown are fan-run and community-organized.{" "}
          <Link href="/contribute" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>Tell us about yours →</Link>
        </div>
      </div>
    </main>
  );
}
