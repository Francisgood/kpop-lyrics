import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "K-pop City Guides — Aegyo Arena",
  description: "Find K-pop concerts, meetups, and fan communities in cities around the world.",
};

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

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {cities.map((city) => (
            <Link key={city.slug} href={`/cities/${city.slug}`} style={{ textDecoration: "none" }}>
              <div className="genius-card" style={{ padding: "22px 20px", borderLeft: `4px solid ${city.color ?? "#FFFF64"}` }}>
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
