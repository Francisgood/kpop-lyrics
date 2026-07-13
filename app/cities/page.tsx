import Link from "next/link";
import type { Metadata } from "next";

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
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Community Discovery
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>K-pop Around the World</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6 }}>
            Discover upcoming concerts, fan meetups, and local K-pop communities in 33 cities across 6 continents — with a growing focus on Latin America.
          </p>
          <div style={{ marginTop: 18 }}>
            <Link href="/cities/meetups" style={{ color: "var(--genius-yellow)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              🗓 Find a fan meetup near you →
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {CITIES.map((city) => (
            <Link key={city.slug} href={`/cities/${city.slug}`} style={{ textDecoration: "none" }}>
              <div className="genius-card" style={{ padding: "22px 20px", borderLeft: `4px solid ${city.color}` }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{city.flag}</div>
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "#000" }}>{city.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 4 }}>{city.country} · View events</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
