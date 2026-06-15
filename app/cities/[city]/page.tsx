import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Hotel      = { name: string; stars: number; note: string; area: string };
type Community  = { name: string; platform: string; url: string; members: string };
type KpopSpot   = { name: string; type: string; description: string };

async function getCity(slug: string) {
  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      events: { orderBy: { type: "asc" } },
    },
  });
  return city;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = await getCity(slug);
  if (!city) return { title: "City not found — Aegyo Arena" };
  return {
    title: `K-pop in ${city.name} — Events, Meetups & Community | Aegyo Arena`,
    description: city.description ?? undefined,
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;

  const [city, allCities] = await Promise.all([
    getCity(slug),
    prisma.city.findMany({ select: { slug: true, name: true, flag: true }, orderBy: { name: "asc" } }),
  ]);

  if (!city) notFound();

  const meta = city.metadata ? (JSON.parse(city.metadata) as { hotels: Hotel[]; communities: Community[]; kpopSpots: KpopSpot[] }) : { hotels: [], communities: [], kpopSpots: [] };

  const concerts   = city.events.filter((e) => e.type === "concert" || e.type === "festival");
  const meetups    = city.events.filter((e) => e.type === "meetup");
  const fanEvents  = city.events.filter((e) => e.type === "fan-event");
  const color      = city.color ?? "#FFFF64";

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 48px", borderBottom: `4px solid ${color}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / "}
            <Link href="/cities" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Cities</Link>
            {" / "}
            {city.name}
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "3.5rem" }}>{city.flag}</span>
            <div>
              <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 8px" }}>K-pop in {city.name}</h1>
              <div style={{ display: "flex", gap: 16, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
                <span>{city.country}</span>
                {city.timezone && <span>{city.timezone}</span>}
                {city.currency && <span>{city.currency}</span>}
              </div>
            </div>
          </div>
          {city.description && (
            <p style={{ marginTop: 20, color: "rgba(255,255,255,0.75)", maxWidth: 700, lineHeight: 1.7, fontSize: "0.95rem" }}>
              {city.description}
            </p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="responsive-sidebar-grid">
          <div>
            {/* Upcoming Concerts */}
            <section style={{ marginBottom: 48 }}>
              <div className="section-header">Upcoming Concerts</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {concerts.map((c) => (
                  <div key={c.id} className="genius-card" style={{ padding: 20, borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)" }}>{c.title}</div>
                          {c.type === "festival" && (
                            <span style={{ fontSize: "0.6rem", background: "#7c3aed", color: "#fff", padding: "1px 7px", borderRadius: 999, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                              FESTIVAL
                            </span>
                          )}
                        </div>
                        {c.venue && <div style={{ fontSize: "0.85rem", color: "var(--genius-gray)" }}>📍 {c.venue}</div>}
                        {c.eventDate && <div style={{ fontSize: "0.82rem", color: "var(--genius-gray)", marginTop: 2 }}>📅 {c.eventDate}</div>}
                      </div>
                      {c.ticketUrl && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <a href={c.ticketUrl} target="_blank" rel="noopener noreferrer" className="btn-yellow" style={{ fontSize: "0.72rem", textAlign: "center" }}>
                            FIND TICKETS
                          </a>
                          <a href={`https://www.songkick.com/search?query=${encodeURIComponent(c.title + " " + city.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.68rem", color: "var(--genius-gray)", textAlign: "center", textDecoration: "none" }}>
                            Check Songkick →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {concerts.length === 0 && (
                  <p style={{ color: "var(--genius-gray)", fontSize: "0.88rem" }}>No upcoming concerts listed yet — check back soon.</p>
                )}
              </div>
            </section>

            {/* Fan Meetups */}
            <section style={{ marginBottom: 48 }}>
              <div className="section-header">Fan Meetups</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {meetups.map((m) => (
                  <div key={m.id} className="genius-card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)", marginBottom: 6 }}>{m.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--genius-gray)", marginBottom: 4 }}>
                      {m.venue && `📍 ${m.venue}`}{m.venue && m.eventDate && " · "}{m.eventDate && `🗓 ${m.eventDate}`}
                    </div>
                  </div>
                ))}
                {meetups.length === 0 && (
                  <p style={{ color: "var(--genius-gray)", fontSize: "0.88rem" }}>No meetups listed yet.</p>
                )}
              </div>
            </section>

            {/* Fan Events: cupsleeves, fansigns, pop-ups */}
            {fanEvents.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div className="section-header">Fansigns, Cupsleeves &amp; Pop-ups</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {fanEvents.map((e) => (
                    <div key={e.id} className="genius-card" style={{ padding: 20, borderLeft: `3px solid ${color}` }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)", marginBottom: 6 }}>{e.title}</div>
                          <div style={{ fontSize: "0.82rem", color: "var(--genius-gray)" }}>
                            {e.venue && `📍 ${e.venue}`}{e.venue && e.eventDate && " · "}{e.eventDate && `🗓 ${e.eventDate}`}
                          </div>
                        </div>
                        {e.ticketUrl && (
                          <a href={e.ticketUrl} target="_blank" rel="noopener noreferrer" className="btn-yellow" style={{ fontSize: "0.72rem", textAlign: "center", whiteSpace: "nowrap" }}>
                            DETAILS
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* K-pop Spots */}
            {meta.kpopSpots.length > 0 && (
              <section>
                <div className="section-header">K-pop Spots</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {meta.kpopSpots.map((s, i) => (
                    <div key={i} className="genius-card" style={{ padding: 18 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <span style={{ background: "var(--genius-yellow)", color: "var(--on-accent)", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>
                          {s.type.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: 6 }}>{s.name}</div>
                      <div style={{ fontSize: "0.82rem", color: "var(--ink-dim)", lineHeight: 1.6 }}>{s.description}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Hotel Recommendations */}
            {meta.hotels.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div className="section-header">Hotel Picks</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {meta.hotels.map((h, i) => (
                    <div key={i} className="genius-card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--ink)" }}>{h.name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--genius-yellow)", letterSpacing: "0.04em" }}>
                          {"★".repeat(h.stars)}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginBottom: 4 }}>📍 {h.area}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-dim)", fontStyle: "italic", lineHeight: 1.5 }}>{h.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communities */}
            {meta.communities.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div className="section-header">Online Communities</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {meta.communities.map((c, i) => (
                    <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div className="genius-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>{c.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>{c.platform} · {c.members} members</div>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div>
              <div className="section-header">Find Events</div>
              {[
                { label: "Songkick", href: `https://www.songkick.com/search?query=kpop+${encodeURIComponent(city.name)}`, bg: "#f80046" },
                { label: "Seatgeek",  href: `https://seatgeek.com/search#?q=kpop+${encodeURIComponent(city.name)}`,         bg: "#fa5252" },
              ].map(({ label, href, bg }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", background: bg, color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.78rem", padding: "10px", borderRadius: 4, textDecoration: "none", marginBottom: 8, letterSpacing: "0.04em" }}>
                  Search {label} for {city.name}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Other cities */}
      <section style={{ background: "var(--surface)", borderTop: "2px solid #000", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-header">Explore Other Cities</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {allCities.filter((c) => c.slug !== slug).slice(0, 10).map((c) => (
              <Link key={c.slug} href={`/cities/${c.slug}`} style={{ textDecoration: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface)", border: "1px solid var(--genius-border)", borderRadius: 999, padding: "5px 14px", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>
                  {c.flag} {c.name}
                </span>
              </Link>
            ))}
            <Link href="/cities" style={{ textDecoration: "none" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--genius-yellow)", border: "1px solid var(--genius-yellow)", borderRadius: 999, padding: "5px 14px", fontSize: "0.82rem", fontWeight: 700, color: "var(--on-accent)" }}>
                View all cities →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
