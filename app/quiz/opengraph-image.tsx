import { ImageResponse } from "next/og";

export const alt = "Aegyo Arena — K-pop Quizzes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const accent = "#FF6FA8";
  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", background: "#2C3340", padding: "70px 80px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 16, background: accent, display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, letterSpacing: 8, color: accent, fontWeight: 700 }}>
          AEGYO ARENA
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: "auto" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, color: "#FAFAF8", lineHeight: 1.03, maxWidth: 960 }}>
            How well do you really know K-pop?
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 34, color: "rgba(250,250,248,0.62)" }}>
            Five quizzes · From aegyo to lyrics · Beat your score
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {["#C77DFF", "#FFD700", "#FF6B9D", "#FF6B35", "#4ECDC4"].map((c) => (
              <div key={c} style={{ display: "flex", width: 46, height: 12, borderRadius: 999, background: c }} />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(250,250,248,0.45)" }}>aegyoarena.com/quiz</div>
        </div>
      </div>
    ),
    size,
  );
}
