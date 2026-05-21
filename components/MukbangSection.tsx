// ── Mukbang Section — curated K-pop eating content for stans ──────────────────
// YouTube links point to official channel search results; thumbnails use artist images.

const MUKBANG_CLIPS = [
  {
    id: "bp-mukbang",
    artistSlug: "blackpink",
    artistName: "BLACKPINK",
    title: "24/365 with BLACKPINK — Pizza & Ramyeon Night",
    description: "All four members rank their go-to comfort foods after a concert. Jisoo insists kimchi jjigae beats everything.",
    foods: ["Kimchi Jjigae", "Pizza", "Ramyeon"],
    ytSearch: "https://www.youtube.com/results?search_query=BLACKPINK+24+365+eating",
    artistImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/221022_BLACKPINK_at_Coachella.jpg/480px-221022_BLACKPINK_at_Coachella.jpg",
    color: "#e879f9",
    badge: "CROSSOVER QUEENS",
  },
  {
    id: "bts-mukbang",
    artistSlug: "bts",
    artistName: "BTS",
    title: "BTS Bon Voyage — Street Food Mukbang Special",
    description: "Jin's legendary appetite on full display. Jin personally eats for all seven members combined.",
    foods: ["Tteokbokki", "Kimbap", "Corn Dogs"],
    ytSearch: "https://www.youtube.com/results?search_query=BTS+mukbang+eating+show",
    artistImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/BTS_at_the_White_House_51579231098_%28cropped%29.jpg/480px-BTS_at_the_White_House_51579231098_%28cropped%29.jpg",
    color: "#FFFF64",
    badge: "WORLD APPETITE",
  },
  {
    id: "stray-kids-mukbang",
    artistSlug: "stray-kids",
    artistName: "Stray Kids",
    title: "SKZ-TALKER GO! — Late Night Fried Chicken Edition",
    description: "Chan calls it 'fuel'. Felix calls it therapy. Eight grown men destroy a 12-piece bucket in record time.",
    foods: ["Fried Chicken", "Beer Cheese", "Tteok"],
    ytSearch: "https://www.youtube.com/results?search_query=Stray+Kids+mukbang+eating",
    artistImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Stray_Kids_at_KCON_2023_LA_%28cropped%29.jpg/480px-Stray_Kids_at_KCON_2023_LA_%28cropped%29.jpg",
    color: "#fb923c",
    badge: "STAY APPROVED",
  },
  {
    id: "twice-mukbang",
    artistSlug: "twice",
    artistName: "TWICE",
    title: "TWICE TV — Nayeon's Sushi Challenge",
    description: "Nine members, one conveyor belt sushi restaurant, zero restraint. Nayeon sets an unofficial record.",
    foods: ["Sushi", "Matcha Ice Cream", "Karaage"],
    ytSearch: "https://www.youtube.com/results?search_query=TWICE+mukbang+eating+show",
    artistImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Twice_in_2023_%28cropped%29.jpg/480px-Twice_in_2023_%28cropped%29.jpg",
    color: "#ACFA52",
    badge: "ONCE TESTED",
  },
  {
    id: "lisa-mukbang",
    artistSlug: "lisa",
    artistName: "Lisa",
    title: "Lisa's Bangkok Kitchen — Pad Thai Mukbang",
    description: "Lisa makes her mum's pad thai recipe on camera. Thai chilli level: actual tears.",
    foods: ["Pad Thai", "Som Tum", "Mango Sticky Rice"],
    ytSearch: "https://www.youtube.com/results?search_query=Lisa+BLACKPINK+mukbang+thai+food",
    artistImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Lisa_-_Coachella_2023_%28cropped%29.jpg/480px-Lisa_-_Coachella_2023_%28cropped%29.jpg",
    color: "#FFFF64",
    badge: "BLINK CONTENT",
  },
  {
    id: "ive-mukbang",
    artistSlug: "ive",
    artistName: "IVE",
    title: "IVE Dispatch — Convenience Store Haul Mukbang",
    description: "Wonyoung's 11pm snack run becomes a 90-minute saga. The ramen ranking debate ends in chaos.",
    foods: ["Cup Ramen", "Onigiri", "Hotteok"],
    ytSearch: "https://www.youtube.com/results?search_query=IVE+mukbang+eating",
    artistImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/IVE_at_the_2023_MAMA_Awards.jpg/480px-IVE_at_the_2023_MAMA_Awards.jpg",
    color: "#4ECDC4",
    badge: "DIVE CONTENT",
  },
];

export default function MukbangSection() {
  return (
    <section style={{ marginTop: 56, paddingTop: 40, borderTop: "2px solid #000" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6 }}>
        <div className="section-header" style={{ margin: 0 }}>Mukbang Corner</div>
        <span style={{ fontSize: "0.68rem", background: "#000", color: "#FFFF64", padding: "2px 9px", borderRadius: 999, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Stan Food Cam
        </span>
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--genius-gray)", marginBottom: 24, lineHeight: 1.6 }}>
        K-pop idols eating on camera — the original fan service. Tap any clip to find it on YouTube.
      </p>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {MUKBANG_CLIPS.map((clip) => (
          <a
            key={clip.id}
            href={clip.ytSearch}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              className="mukbang-card genius-card"
              style={{
                padding: 0,
                overflow: "hidden",
                border: "1px solid var(--genius-border)",
              }}
            >
              {/* Thumbnail row */}
              <div style={{ position: "relative", height: 120, background: "#f0f0f0", overflow: "hidden" }}>
                <img
                  src={clip.artistImg}
                  alt={clip.artistName}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: 0.85 }}
                />
                {/* YouTube play overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "#ff0000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Badge */}
                <div style={{
                  position: "absolute", top: 8, left: 8,
                  background: clip.color, color: "#000",
                  fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.08em",
                  padding: "2px 7px", borderRadius: 999, textTransform: "uppercase",
                }}>
                  {clip.badge}
                </div>
                {/* Food tags */}
                <div style={{
                  position: "absolute", bottom: 6, right: 6,
                  display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end",
                }}>
                  {clip.foods.slice(0, 2).map((f) => (
                    <span key={f} style={{
                      background: "rgba(0,0,0,0.75)", color: "#fff",
                      fontSize: "0.58rem", fontWeight: 600,
                      padding: "2px 6px", borderRadius: 999,
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "12px 14px 14px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                  {clip.artistName}
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#000", lineHeight: 1.3, marginBottom: 7 }}>
                  {clip.title}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.55, marginBottom: 10 }}>
                  {clip.description}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700, color: "#ff0000",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.79a4.85 4.85 0 01-1.02-.1z" />
                    </svg>
                    Find on YouTube
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#bbb", marginLeft: "auto" }}>
                    {clip.foods.join(" · ")}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Stan culture note */}
      <div style={{
        marginTop: 20, padding: "12px 16px",
        background: "#fffbeb", border: "1px solid #fde68a",
        borderRadius: 6, fontSize: "0.78rem", color: "#92400e", lineHeight: 1.6,
      }}>
        <strong>Fan tip:</strong> In Korean stan culture, watching your bias eat on camera (먹방, mukbang) is considered the highest form of comfort content.
        Jin from BTS is widely considered the godfather of idol mukbang. Wonyoung's convenience store runs have their own dedicated subreddit thread.
      </div>
    </section>
  );
}
