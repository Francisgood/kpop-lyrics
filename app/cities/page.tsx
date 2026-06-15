import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "K-pop City Guides — Aegyo Arena",
  description: "Find K-pop concerts, meetups, and fan communities in cities around the world.",
};

const CITY_PHOTOS: Record<string, string> = {
  "new-york":     "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=60",
  "los-angeles":  "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=400&q=60",
  "seoul":        "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&w=400&q=60",
  "tokyo":        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=60",
  "london":       "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=60",
  "bangkok":      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=60",
  "paris":        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=60",
  "mexico-city":  "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=400&q=60",
  "chicago":      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=60",
  "dallas":       "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=400&q=60",
  "tampa":        "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=400&q=60",
  "boston":       "https://images.unsplash.com/photo-1501979376754-5ff17beec66f?auto=format&fit=crop&w=400&q=60",
  "scottsdale":   "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=60",
  "sao-paulo":    "https://images.unsplash.com/photo-1535918218879-ebf49283d7c0?auto=format&fit=crop&w=400&q=60",
  "buenos-aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=400&q=60",
  "madrid":       "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=60",
  "milan":        "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=400&q=60",
  "dubai":        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=60",
  "manila":       "https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=400&q=60",
  "kuala-lumpur": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=400&q=60",
  "shanghai":     "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=400&q=60",
};

const VAULT_ARTICLES = [
  {
    slug: "instagram-top-10-2026",
    label: "Instagram Top 10 (2026)",
    description: "Lisa hits 107M. BLACKPINK holds the global top 4.",
    src: "/scraped/images/instagram-followers-2026.jpg",
    color: "#e879f9",
    badge: "INSTAGRAM",
  },
  {
    slug: "most-streamed-spotify-2025",
    label: "Most-Streamed K-pop (Spotify 2025)",
    description: "HUNTR/X leads at 48.1M. JENNIE solo beats BLACKPINK as a group.",
    src: "/scraped/images/most-streamed-kpop-spotify-2025.jpg",
    color: "#ACFA52",
    badge: "SPOTIFY",
  },
  {
    slug: "jungkook-jimin-spotify",
    label: "Jungkook & Jimin Spotify Stats",
    description: "How BTS's soloists sustain streaming during military hiatus.",
    src: "/scraped/images/bts-jungkook-jimin-spotify-2026.jpg",
    color: "#FFFF64",
    badge: "BTS",
  },
  {
    slug: "groups-vs-soloists-breakdown",
    label: "Groups vs Soloists Breakdown",
    description: "Soloists are outstreaming their groups for the first time.",
    src: "/scraped/images/groups-vs-soloists-breakdown.jpg",
    color: "#fb923c",
    badge: "ANALYSIS",
  },
];

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true, country: true, flag: true, color: true },
  });

  return (
    <main>
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Community Discovery
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>K-pop Around the World</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6 }}>
            Discover upcoming concerts, fan meetups, and local K-pop communities in {cities.length} cities across 5 continents.
          </p>
        </div>
      </section>

      {/* City Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {cities.map((city) => {
            const photo = CITY_PHOTOS[city.slug];
            return (
              <Link key={city.slug} href={`/cities/${city.slug}`} style={{ textDecoration: "none" }}>
                <div
                  className="genius-card"
                  style={{
                    padding: "22px 20px",
                    borderLeft: `4px solid ${city.color ?? "#FFFF64"}`,
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 110,
                  }}
                >
                  {/* Background photo */}
                  {photo && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${photo})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.13,
                        zIndex: 0,
                      }}
                    />
                  )}
                  {/* Card content — sits above the photo */}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{city.flag}</div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)" }}>{city.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 4 }}>{city.country} · View events</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* From the Vault */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--ink)", margin: 0 }}>From the Vault</h2>
          <span style={{ fontSize: "0.65rem", background: "var(--genius-yellow)", color: "var(--on-accent)", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>4 ARTICLES</span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--genius-gray)", marginBottom: 32 }}>
          Deep dives on K-pop streaming, social media, and fandom — customized for each of the 21 cities above.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {VAULT_ARTICLES.map((article) => (
            <Link key={article.slug} href={`/news/${article.slug}`} style={{ textDecoration: "none" }}>
              <div
                className="genius-card"
                style={{
                  overflow: "hidden",
                  border: "1px solid var(--genius-border)",
                  borderTop: `4px solid ${article.color}`,
                }}
              >
                {/* Thumbnail */}
                <div style={{ height: 150, overflow: "hidden", background: "#0a0a1e", position: "relative" }}>
                  <img
                    src={article.src}
                    alt={article.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      opacity: 0.85,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      fontSize: "0.6rem",
                      background: article.color,
                      color: "var(--on-accent)",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {article.badge}
                  </div>
                </div>

                {/* Text */}
                <div style={{ padding: "16px 16px 18px" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--ink)", lineHeight: 1.4, marginBottom: 8 }}>
                    {article.label}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--ink-dim)", lineHeight: 1.6, marginBottom: 12 }}>
                    {article.description}
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: article.color === "#FFFF64" ? "var(--sakura)" : article.color,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Read for all 21 cities →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
