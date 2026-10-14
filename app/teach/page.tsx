"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { T, LangToggle, useT } from "@/components/LangProvider";

type Clip = {
  id: string; videoId: string; title: string; artist: string | null; city: string | null;
  userName: string | null; upvotes: number; mine: boolean; upvotedByMe: boolean;
};

export default function TeachPage() {
  const t = useT();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [uploadPts, setUploadPts] = useState(10);
  const [bonusPts, setBonusPts] = useState(100);
  const [loaded, setLoaded] = useState(false);

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/teach");
      const d = await r.json();
      setClips(d.clips ?? []);
      setLoggedIn(!!d.loggedIn);
      if (d.threshold) setThreshold(d.threshold);
      if (d.uploadPoints) setUploadPts(d.uploadPoints);
      if (d.bonusPoints) setBonusPts(d.bonusPoints);
    } catch { /* leave empty */ }
    setLoaded(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "saving") return;
    setState("saving"); setMsg(null);
    try {
      const r = await fetch("/api/teach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, artist, city }),
      });
      const d = await r.json();
      if (r.ok) {
        setState("done"); setUrl(""); setTitle(""); setArtist(""); setCity("");
        load();
      } else {
        setState("error"); setMsg(d.error ?? t("Something went wrong — try again.", "Algo salió mal — intenta de nuevo."));
      }
    } catch {
      setState("error"); setMsg(t("Something went wrong — try again.", "Algo salió mal — intenta de nuevo."));
    }
  }

  async function upvote(clip: Clip) {
    if (!loggedIn) { window.location.href = "/login?next=/teach"; return; }
    if (clip.upvotedByMe || clip.mine) return;
    // optimistic
    setClips((cs) => cs.map((c) => c.id === clip.id ? { ...c, upvotes: c.upvotes + 1, upvotedByMe: true } : c));
    try {
      const r = await fetch("/api/teach/upvote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clipId: clip.id }),
      });
      const d = await r.json();
      if (r.ok) setClips((cs) => cs.map((c) => c.id === clip.id ? { ...c, upvotes: d.upvotes, upvotedByMe: true } : c));
      else { load(); } // revert to server truth
    } catch { load(); }
  }

  const field: React.CSSProperties = { width: "100%", padding: "12px 15px", border: "1px solid var(--border-strong)", borderRadius: 9, fontSize: "0.95rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 };

  return (
    <main style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 24px 80px" }}>
      <LangToggle align="center" marginBottom={16} />

      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 10px" }}>
        <div style={{ fontSize: "2.4rem", marginBottom: 6 }}>🪩</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 800, color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.08 }}>
          <T en="Teach choreography" es="Enseña coreografía" />
        </h1>
        <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6, margin: "0 0 14px" }}>
          <T
            en="Film yourself breaking down a K-pop dance, upload the YouTube clip here, and earn points when fans love it."
            es="Grábate explicando un baile de K-pop, sube el clip de YouTube aquí y gana puntos cuando a las fans les encante."
          />
        </p>
        <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center", fontSize: "0.82rem" }}>
          <span style={{ background: "rgba(255,111,168,0.14)", border: "1px solid var(--sakura)", borderRadius: 999, padding: "6px 14px", color: "var(--ink)", fontWeight: 700 }}>
            <T en={`+${uploadPts} for uploading`} es={`+${uploadPts} por subir`} />
          </span>
          <span style={{ background: "rgba(255,111,168,0.14)", border: "1px solid var(--sakura)", borderRadius: 999, padding: "6px 14px", color: "var(--ink)", fontWeight: 700 }}>
            <T en={`+${bonusPts} when ${threshold}+ fans upvote it`} es={`+${bonusPts} cuando ${threshold}+ fans lo votan`} />
          </span>
        </div>
      </div>

      {/* Submit */}
      <div style={{ maxWidth: 480, margin: "26px auto 40px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "24px 24px 28px", boxShadow: "0 18px 50px rgba(0,0,0,0.3)" }}>
        {!loggedIn ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.95rem", lineHeight: 1.55, margin: "0 0 16px" }}>
              <T en="Log in to upload your clip and start earning points." es="Inicia sesión para subir tu clip y empezar a ganar puntos." />
            </p>
            <Link href="/login?next=/teach" className="btn-yellow" style={{ display: "inline-block", padding: "12px 26px", fontSize: "0.88rem", textDecoration: "none" }}>
              <T en="Log in to upload" es="Inicia sesión para subir" />
            </Link>
          </div>
        ) : state === "done" ? (
          <div style={{ textAlign: "center", padding: "6px" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
              <T en="Clip submitted!" es="¡Clip enviado!" />
            </div>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.9rem", lineHeight: 1.55, margin: "0 0 16px" }}>
              <T en={`Your +${uploadPts} points are on the way. Share it so fans can upvote you to +${bonusPts}.`} es={`Tus +${uploadPts} puntos están en camino. Compártelo para que las fans te suban a +${bonusPts}.`} />
            </p>
            <button onClick={() => setState("idle")} className="btn-yellow" style={{ padding: "10px 20px", fontSize: "0.82rem" }}>
              <T en="Upload another" es="Subir otro" />
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {msg && <div style={{ background: "rgba(255,90,90,0.1)", border: "1px solid rgba(255,90,90,0.35)", borderRadius: 9, padding: "10px 14px", fontSize: "0.85rem", color: "#ff9a9a" }}>{msg}</div>}
            <div>
              <label style={labelStyle}><T en="YouTube link" es="Enlace de YouTube" /></label>
              <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" style={field} />
            </div>
            <div>
              <label style={labelStyle}><T en="Title" es="Título" /></label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("e.g. 'Spaghetti' chorus — slow + mirrored", "ej. coro de 'Spaghetti' — lento y en espejo")} style={field} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}><T en="Song / artist (optional)" es="Canción / artista (opcional)" /></label>
                <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder={t("e.g. LE SSERAFIM", "ej. LE SSERAFIM")} style={field} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}><T en="Your city (optional)" es="Tu ciudad (opcional)" /></label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("e.g. Seoul", "ej. Seúl")} style={field} />
              </div>
            </div>
            <button type="submit" disabled={state === "saving"} className="btn-yellow" style={{ width: "100%", padding: "14px", fontSize: "0.9rem", opacity: state === "saving" ? 0.6 : 1 }}>
              {state === "saving" ? <T en="Uploading…" es="Subiendo…" /> : <T en="UPLOAD CLIP" es="SUBIR CLIP" />}
            </button>
            <p style={{ fontSize: "0.72rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
              <T
                en="Submit your own dance-teaching clips only. Points are credited through the Arcade after review."
                es="Sube solo tus propios clips enseñando a bailar. Los puntos se acreditan vía el Arcade tras revisión."
              />
            </p>
          </form>
        )}
      </div>

      {/* Gallery */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 0 16px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          <T en="Top dance lessons" es="Mejores lecciones de baile" />
        </h2>
        <span style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>
          {loaded ? <T en={`${clips.length} clips`} es={`${clips.length} clips`} /> : ""}
        </span>
      </div>

      {loaded && clips.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--ink-dim)", padding: "40px 10px", border: "1px dashed var(--border)", borderRadius: 14 }}>
          <T en="No clips yet — be the first to teach a dance." es="Aún no hay clips — sé la primera en enseñar un baile." />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {clips.map((c) => (
            <div key={c.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <a href={`https://www.youtube.com/watch?v=${c.videoId}`} target="_blank" rel="noopener noreferrer"
                 style={{ position: "relative", display: "block", aspectRatio: "16 / 9", background: "#000" }}>
                <img src={`https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg`} alt={c.title} loading="lazy"
                     style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <span aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.6rem", color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>▶</span>
              </a>
              <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem", lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>
                  {[c.artist, c.city].filter(Boolean).join(" · ")}
                  {(c.artist || c.city) && c.userName ? " · " : ""}
                  {c.userName ? <T en={`by ${c.userName}`} es={`por ${c.userName}`} /> : null}
                </div>
                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  {c.mine ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--ink-faint)", fontWeight: 700 }}>
                      ▲ {c.upvotes} · <T en="your clip" es="tu clip" />
                    </span>
                  ) : (
                    <button onClick={() => upvote(c)} disabled={c.upvotedByMe}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, cursor: c.upvotedByMe ? "default" : "pointer", fontWeight: 800, fontSize: "0.82rem",
                        border: c.upvotedByMe ? "1px solid var(--sakura)" : "1px solid var(--border-strong)",
                        background: c.upvotedByMe ? "var(--sakura)" : "transparent",
                        color: c.upvotedByMe ? "var(--on-accent)" : "var(--ink)" }}>
                      ▲ {c.upvotes} {c.upvotedByMe ? <T en="upvoted" es="votado" /> : <T en="upvote" es="votar" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
