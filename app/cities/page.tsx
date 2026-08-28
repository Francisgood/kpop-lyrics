import Link from "next/link";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";
import { cityImage } from "@/lib/city-images";

export const metadata: Metadata = {
  title: "K-pop City Guides — Aegyo Arena",
  description: "Find K-pop concerts, meetups, and fan communities in cities around the world.",
};

const CITIES = [
  // North America
  { slug: "new-york",    name: "New York",       country: "US", flag: "🇺🇸", color: "#e32636" },
  { slug: "los-angeles", name: "Los Angeles",    country: "US", flag: "🇺🇸", color: "#003594" },
  { slug: "chicago",     name: "Chicago",        country: "US", flag: "🇺🇸", color: "#00b5e2" },
  { slug: "dallas",      name: "Dallas",         country: "US", flag: "🇺🇸", color: "#003594" },
  { slug: "tampa",       name: "Tampa",          country: "US", flag: "🇺🇸", color: "#d50032" },
  { slug: "boston",      name: "Boston",         country: "US", flag: "🇺🇸", color: "#00a0dc" },
  { slug: "scottsdale",  name: "Scottsdale",     country: "US", flag: "🇺🇸", color: "#f5a623" },
  { slug: "toronto",     name: "Toronto",        country: "CA", flag: "🇨🇦", color: "#C8102E" },
  // Latin America
  { slug: "mexico-city", name: "Mexico City",    country: "MX", flag: "🇲🇽", color: "#006847" },
  { slug: "guadalajara", name: "Guadalajara",    country: "MX", flag: "🇲🇽", color: "#A31621" },
  { slug: "monterrey",   name: "Monterrey",      country: "MX", flag: "🇲🇽", color: "#1F6FB2" },
  { slug: "puebla",      name: "Puebla",         country: "MX", flag: "🇲🇽", color: "#B0323C" },
  { slug: "tijuana",     name: "Tijuana",        country: "MX", flag: "🇲🇽", color: "#E4572E" },
  { slug: "chihuahua",   name: "Chihuahua",      country: "MX", flag: "🇲🇽", color: "#8B5E3C" },
  { slug: "sao-paulo",   name: "São Paulo",      country: "BR", flag: "🇧🇷", color: "#009c3b" },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "BR", flag: "🇧🇷", color: "#00A859" },
  { slug: "buenos-aires",name: "Buenos Aires",   country: "AR", flag: "🇦🇷", color: "#74acdf" },
  { slug: "santiago",    name: "Santiago",       country: "CL", flag: "🇨🇱", color: "#0F52BA" },
  { slug: "bogota",      name: "Bogotá",         country: "CO", flag: "🇨🇴", color: "#00489E" },
  { slug: "medellin",    name: "Medellín",       country: "CO", flag: "🇨🇴", color: "#E4002B" },
  // Europe
  { slug: "london",      name: "London",         country: "UK", flag: "🇬🇧", color: "#012169" },
  { slug: "paris",       name: "Paris",          country: "FR", flag: "🇫🇷", color: "#002395" },
  { slug: "madrid",      name: "Madrid",         country: "ES", flag: "🇪🇸", color: "#aa151b" },
  { slug: "milan",       name: "Milan",          country: "IT", flag: "🇮🇹", color: "#009246" },
  // Asia
  { slug: "seoul",       name: "Seoul",          country: "KR", flag: "🇰🇷", color: "#003478" },
  { slug: "tokyo",       name: "Tokyo",          country: "JP", flag: "🇯🇵", color: "#bc002d" },
  { slug: "bangkok",     name: "Bangkok",        country: "TH", flag: "🇹🇭", color: "#a51931" },
  { slug: "manila",      name: "Manila",         country: "PH", flag: "🇵🇭", color: "#0038a8" },
  { slug: "kuala-lumpur",name: "Kuala Lumpur",   country: "MY", flag: "🇲🇾", color: "#cc0001" },
  { slug: "shanghai",    name: "Shanghai",       country: "CN", flag: "🇨🇳", color: "#de2910" },
  // Middle East
  { slug: "dubai",       name: "Dubai",          country: "AE", flag: "🇦🇪", color: "#009a44" },
  // Oceania
  { slug: "melbourne",   name: "Melbourne",      country: "AU", flag: "🇦🇺", color: "#1B3A6B" },
  { slug: "sydney",      name: "Sydney",         country: "AU", flag: "🇦🇺", color: "#0057B8" },
];

export default function CitiesPage() {
  return (
    <main>
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            <T en="Community Discovery" es="Descubre la Comunidad" />
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>
            <T en="K-pop Around the World" es="K-pop en Todo el Mundo" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6 }}>
            <T
              en={`Discover upcoming concerts, fan meetups, and local K-pop communities in ${CITIES.length} cities across 6 continents — with a growing focus on Latin America.`}
              es={`Descubre próximos conciertos, encuentros de fans y comunidades locales de K-pop en ${CITIES.length} ciudades de 6 continentes — con un enfoque cada vez mayor en América Latina.`}
            />
          </p>
          <div style={{ marginTop: 18 }}>
            <Link href="/cities/meetups" style={{ color: "var(--genius-yellow)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              <T en="🗓 Find a fan meetup near you →" es="🗓 Encuentra un meetup cerca de ti →" />
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <style>{`
          .city-card { display: block; text-decoration: none; }
          .city-cover { position: relative; aspect-ratio: 3 / 2; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.18); }
          .city-fill { transition: transform .5s cubic-bezier(.2,.6,.2,1); }
          .city-card:hover .city-fill { transform: scale(1.06); }
        `}</style>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(228px, 1fr))", gap: 20 }}>
          {CITIES.map((city) => {
            const img = cityImage(city.slug);
            return (
              <Link key={city.slug} href={`/cities/${city.slug}`} className="city-card">
                <div className="city-cover">
                  {img ? (
                    <img className="city-fill" src={img} alt={`${city.name}, ${city.country}`} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="city-fill" style={{ position: "absolute", inset: 0, background: `linear-gradient(140deg, ${city.color} 0%, #16121f 125%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.6rem" }}>{city.flag}</div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0) 42%, rgba(10,8,16,0.85) 100%)" }} />
                  <span style={{ position: "absolute", top: 11, left: 11, width: 9, height: 9, borderRadius: 2, background: city.color, boxShadow: "0 0 0 3px rgba(0,0,0,0.22)" }} />
                  <div style={{ position: "absolute", left: 14, right: 14, bottom: 11 }}>
                    <span style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: "1.42rem", color: "#fff", lineHeight: 1.04, letterSpacing: "-0.01em", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>{city.name}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 4px 0", fontSize: "0.74rem" }}>
                  <span style={{ color: "var(--ink-faint)", letterSpacing: "0.04em" }}>{city.country}</span>
                  <span style={{ color: "var(--sakura)", fontWeight: 700 }}><T en="View events →" es="Ver eventos →" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
