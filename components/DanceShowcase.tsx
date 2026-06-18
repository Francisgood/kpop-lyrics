import type { RichTopic, RightNowCard, Tutorial } from "@/app/culture/content";
import NewsletterCard from "@/components/NewsletterCard";

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const thumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

const LEVEL: Record<Tutorial["level"], { bg: string; fg: string }> = {
  BEGINNER: { bg: "#dcfce7", fg: "#15803d" },
  INTERMEDIATE: { bg: "#fef3c7", fg: "#b45309" },
  ADVANCED: { bg: "#fee2e2", fg: "#b91c1c" },
};

function PlayOverlay() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
      </div>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return <span style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "#15131f", color: "#fff", fontWeight: 800, fontSize: "0.72rem" }}>{initials}</span>;
}

function RightNow({ c }: { c: RightNowCard }) {
  const img = c.source === "youtube" ? thumb(c.youtubeId!) : c.thumb!;
  const href = c.source === "youtube" ? yt(c.youtubeId!) : c.href ?? "#";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={c.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <PlayOverlay />
          <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "#fff", fontWeight: 800, fontSize: "0.62rem", padding: "2px 7px", borderRadius: 6 }}>{c.rank}</span>
          <span style={{ position: "absolute", top: 8, right: 8, background: c.source === "youtube" ? "#ff0000" : "#fff", color: c.source === "youtube" ? "#fff" : "#15131f", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 999 }}>{c.source === "youtube" ? "YouTube" : "Reels"}</span>
          {c.views && <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.78)", color: "#fff", fontWeight: 700, fontSize: "0.66rem", padding: "2px 8px", borderRadius: 999 }}>▶ {c.views}</span>}
        </div>
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#15131f", lineHeight: 1.3, marginBottom: 8 }}>{c.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar initials={c.initials} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#15131f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.channel}</span>
              <span style={{ display: "block", fontSize: "0.7rem", color: "#9a9aa6" }}>{c.type}</span>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function DanceShowcase({ data }: { data: RichTopic }) {
  const f = data.featured;
  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Featured — Video of the Day */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#15131f", color: "#ffd35c", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, marginBottom: 14 }}>🔥 Video of the Day</div>
        <a href={yt(f.youtubeId)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ position: "relative", paddingBottom: "48%", height: 0, background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(f.youtubeId)} alt={f.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <PlayOverlay />
              <span style={{ position: "absolute", top: 12, left: 12, background: "#ff0000", color: "#fff", fontWeight: 800, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999 }}>{f.label}</span>
            </div>
            <div style={{ padding: "20px 22px 22px" }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 700, color: "#15131f", margin: "0 0 8px", lineHeight: 1.2 }}>{f.title}</h2>
              <p style={{ color: "#54545c", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 16px" }}>{f.desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar initials={f.initials} />
                  <span><span style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#15131f" }}>{f.channel}</span><span style={{ display: "block", fontSize: "0.72rem", color: "#9a9aa6" }}>{f.type}</span></span>
                </span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7, background: "#ff0000", color: "#fff", fontWeight: 800, fontSize: "0.82rem", padding: "10px 18px", borderRadius: 100 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> Watch on YouTube
                </span>
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* Right Now */}
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "#15131f", margin: "0 0 2px" }}>Right Now</h2>
      <p style={{ color: "#6b6b72", fontSize: "0.92rem", margin: "0 0 20px" }}>The covers, point choreo, and group routines racking up the most loops this week.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px,100%), 1fr))", gap: 18, marginBottom: 44 }}>
        {data.rightNow.map((c) => <RightNow key={c.rank} c={c} />)}
      </div>

      {/* Learn the Moves */}
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "#15131f", margin: "0 0 2px" }}>Learn the Moves</h2>
      <p style={{ color: "#6b6b72", fontSize: "0.92rem", margin: "0 0 20px" }}>Slow breakdowns, count-by-count, so you can actually nail the point choreo — not just admire it.</p>
      <div style={{ display: "grid", gap: 14, marginBottom: 44 }}>
        {data.tutorials.map((t) => (
          <a key={t.youtubeId} href={yt(t.youtubeId)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 14, padding: 12, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ position: "relative", width: 132, flexShrink: 0, borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(t.youtubeId)} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <PlayOverlay />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ background: LEVEL[t.level].bg, color: LEVEL[t.level].fg, fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 999 }}>{t.level}</span>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.tag}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#15131f", lineHeight: 1.3, marginBottom: 3 }}>{t.title}</div>
                <div style={{ fontSize: "0.76rem", color: "#9a9aa6" }}>{t.subtitle}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Join the Floor */}
      <div style={{ background: "linear-gradient(135deg,#15131f,#2a2540)", borderRadius: 20, padding: "32px 28px", textAlign: "center", color: "#fff", marginBottom: 36 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ff9ec4", fontWeight: 700, marginBottom: 10 }}>Join the Floor</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, marginBottom: 8 }}>Got moves? Show the fandom.</div>
        <p style={{ color: "#c9c7d6", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 16px" }}>
          Submit your cover, your point choreo, or your take on this week’s challenge — the best ones get featured right here on the Dance page. Creators verify they’re 18+ (or their country’s minimum age) with a quick{" "}
          <a href="https://didit.me/products/id-verification/" target="_blank" rel="noopener noreferrer" style={{ color: "#ff9ec4", fontWeight: 700, textDecoration: "none" }}>didit.me ID check</a>.
        </p>
        <span style={{ display: "inline-block", padding: "11px 22px", borderRadius: 100, background: "#ff6fa8", color: "#fff", fontWeight: 800, fontSize: "0.85rem" }}>Submit Your Video — coming soon</span>
      </div>

      {/* Stay in the Loop */}
      <NewsletterCard />
    </div>
  );
}
