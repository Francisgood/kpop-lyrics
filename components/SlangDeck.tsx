"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

/**
 * The Tinder-style slang deck. Swipe right to save a term to *My Deck*, left to
 * discard; tap a card to flip it and read the full definition + linked songs.
 * A daily 10-card stack (date-seeded, so everyone gets the same 10 today) turns
 * learning slang into a memory game — come back tomorrow for the next stack.
 *
 * No auth: the saved deck + streak live in localStorage. GIFs come from Giphy
 * (populated by /api/admin/slang-media); until a term has one, it shows a branded
 * animated gradient card, which still reads as a clean flash-card.
 */

export type DeckTerm = {
  slug: string;
  term: string;
  hangul?: string | null;
  roman?: string | null;
  gifUrl?: string | null;
  imageUrl?: string | null;
  def: string;
  defEs?: string | null;
  example?: string | null;
  exampleEs?: string | null;
  songCount: number;
};

// ── tiny deterministic PRNG so "today's 10" is stable across devices + SSR ───────
function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededOrder(n: number, seedStr: string): number[] {
  const rand = mulberry32(xmur3(seedStr));
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// UTC date key — identical on the Railway server and the client (except the
// midnight-UTC edge, which just re-renders harmlessly).
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const GRADIENTS = [
  "linear-gradient(135deg,#FF6FA8 0%,#7B61FF 100%)",
  "linear-gradient(135deg,#00E0C6 0%,#0A84FF 100%)",
  "linear-gradient(135deg,#FFD166 0%,#FF6FA8 100%)",
  "linear-gradient(135deg,#A78BFA 0%,#EC4899 100%)",
  "linear-gradient(135deg,#22D3EE 0%,#818CF8 100%)",
  "linear-gradient(135deg,#FB7185 0%,#FBBF24 100%)",
];

const SAVED_KEY = "aegyo_slang_saved";
const STREAK_KEY = "aegyo_slang_streak";
const DONE_KEY = "aegyo_slang_done"; // { date, count }

const DAILY_SIZE = 10;
const SWIPE_THRESHOLD = 90; // px past which a release commits the swipe

type Anim = "left" | "right" | null;
type Mode = "daily" | "all" | "saved";

export default function SlangDeck({ terms }: { terms: DeckTerm[] }) {
  const { lang } = useLang();
  const es = lang === "es";
  const tr = (en: string, ess: string) => (es ? ess : en);

  const bySlug = useMemo(() => {
    const m = new Map<string, DeckTerm>();
    terms.forEach((t) => m.set(t.slug, t));
    return m;
  }, [terms]);

  // Deterministic queues (safe for SSR/hydration — no Math.random at render time).
  const dailyQueue = useMemo(() => {
    const order = seededOrder(terms.length, `daily-${todayKey()}`);
    return order.slice(0, Math.min(DAILY_SIZE, terms.length));
  }, [terms.length]);
  const allQueue = useMemo(() => seededOrder(terms.length, `all-${todayKey()}`), [terms.length]);

  const [mode, setMode] = useState<Mode>("daily");
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [anim, setAnim] = useState<Anim>(null);
  const [drag, setDrag] = useState({ dx: 0, dy: 0, active: false });
  const [saved, setSaved] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyDone, setDailyDone] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [savedQueue, setSavedQueue] = useState<number[]>([]);

  const history = useRef<{ pos: number; dir: "left" | "right"; slug: string }[]>([]);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  // ── load persisted state after mount (client-only) ─────────────────────────
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (Array.isArray(s)) setSaved(s.filter((x) => typeof x === "string"));
    } catch { /* ignore */ }
    try {
      const st = JSON.parse(localStorage.getItem(STREAK_KEY) || "null");
      if (st && typeof st.count === "number") setStreak(st.count);
    } catch { /* ignore */ }
    try {
      const d = JSON.parse(localStorage.getItem(DONE_KEY) || "null");
      if (d && d.date === todayKey() && d.count >= Math.min(DAILY_SIZE, terms.length)) setDailyDone(true);
    } catch { /* ignore */ }
  }, [terms.length]);

  const persistSaved = useCallback((next: string[]) => {
    setSaved(next);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  // Bump the streak when today's daily stack is completed (once per day).
  const completeDaily = useCallback(() => {
    setDailyDone(true);
    try {
      const prev = JSON.parse(localStorage.getItem(STREAK_KEY) || "null") as { count: number; date: string } | null;
      const yday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let count = 1;
      if (prev) {
        if (prev.date === todayKey()) count = prev.count; // already counted today
        else if (prev.date === yday) count = prev.count + 1; // consecutive day
      }
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count, date: todayKey() }));
      localStorage.setItem(DONE_KEY, JSON.stringify({ date: todayKey(), count: Math.min(DAILY_SIZE, terms.length) }));
      setStreak(count);
    } catch { /* ignore */ }
  }, [terms.length]);

  const queue = mode === "daily" ? dailyQueue : mode === "all" ? allQueue : savedQueue;
  const remaining = queue.length - pos;
  const current = pos < queue.length ? bySlug.get(terms[queue[pos]]?.slug) ?? terms[queue[pos]] : null;

  // ── swipe finalize ─────────────────────────────────────────────────────────
  const finalize = useCallback(
    (dir: "left" | "right") => {
      const idx = queue[pos];
      const t = terms[idx];
      if (t) history.current.push({ pos, dir, slug: t.slug });
      if (dir === "right" && t && !saved.includes(t.slug)) persistSaved([...saved, t.slug]);
      const wasLast = pos + 1 >= queue.length;
      setPos((p) => p + 1);
      setFlipped(false);
      setAnim(null);
      setDrag({ dx: 0, dy: 0, active: false });
      if (mode === "daily" && wasLast && !dailyDone) completeDaily();
    },
    [queue, pos, terms, saved, persistSaved, mode, dailyDone, completeDaily],
  );

  const commit = useCallback(
    (dir: "left" | "right") => {
      setAnim(dir);
      window.setTimeout(() => finalize(dir), 270);
    },
    [finalize],
  );

  const undo = useCallback(() => {
    const last = history.current.pop();
    if (!last) return;
    if (last.dir === "right") persistSaved(saved.filter((s) => s !== last.slug));
    setPos(last.pos);
    setFlipped(false);
    setAnim(null);
    setDrag({ dx: 0, dy: 0, active: false });
    setDailyDone(false);
  }, [saved, persistSaved]);

  // ── pointer (touch + mouse) ────────────────────────────────────────────────
  const onDown = (e: React.PointerEvent) => {
    if (anim) return;
    start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setDrag({ dx: 0, dy: 0, active: true });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current || !drag.active) return;
    setDrag({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y, active: true });
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    const { dx, dy } = drag;
    const dist = Math.hypot(dx, dy);
    const quick = s ? performance.now() - s.t < 350 : false;
    setDrag({ dx: 0, dy: 0, active: false });
    if (dist < 10 && quick) { setFlipped((f) => !f); return; } // tap → flip
    if (flipped) return; // reading; ignore stray drags
    if (dx > SWIPE_THRESHOLD) commit("right");
    else if (dx < -SWIPE_THRESHOLD) commit("left");
    // else: snaps back (drag reset above, transition handles it)
  };

  // Keyboard a11y
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || flipped) {
        if (e.key === " " || e.key === "Enter") { setFlipped((f) => !f); e.preventDefault(); }
        return;
      }
      if (e.key === "ArrowRight") commit("right");
      else if (e.key === "ArrowLeft") commit("left");
      else if (e.key === " " || e.key === "Enter") { setFlipped((f) => !f); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, commit]);

  function restart(nextMode: Mode) {
    if (nextMode === "saved") {
      const idxs = saved.map((sl) => terms.findIndex((t) => t.slug === sl)).filter((i) => i >= 0);
      setSavedQueue(idxs);
    }
    history.current = [];
    setMode(nextMode);
    setPos(0);
    setFlipped(false);
    setAnim(null);
    setDrawer(false);
  }

  const anyGif = useMemo(() => terms.some((t) => t.gifUrl || t.imageUrl), [terms]);
  const total = Math.min(DAILY_SIZE, terms.length);
  const doneCount = mode === "daily" ? Math.min(pos, total) : pos;

  // Transform for the top card
  const topTransform = () => {
    if (anim === "right") return { transform: "translate(130%,-24px) rotate(20deg)", opacity: 0, transition: "transform .28s ease-out, opacity .28s" };
    if (anim === "left") return { transform: "translate(-130%,-24px) rotate(-20deg)", opacity: 0, transition: "transform .28s ease-out, opacity .28s" };
    if (drag.active) return { transform: `translate(${drag.dx}px,${drag.dy}px) rotate(${drag.dx * 0.045}deg)`, transition: "none" };
    return { transform: "translate(0,0) rotate(0deg)", transition: "transform .25s cubic-bezier(.2,.8,.3,1)" };
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <style>{deckCss}</style>

      {/* mode + progress bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", background: "var(--bg-card,#141414)", border: "1px solid var(--border,#262626)", borderRadius: 100, padding: 3 }}>
          {([["daily", tr("Daily 10", "10 del día")], ["all", tr(`All ${terms.length}`, "Todas")]] as [Mode, string][]).map(([m, label]) => (
            <button key={m} type="button" onClick={() => restart(m)} aria-pressed={mode === m}
              style={{ padding: "7px 15px", borderRadius: 100, border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800, background: mode === m ? "#FF6FA8" : "transparent", color: mode === m ? "#0a0a0a" : "var(--ink-dim,#9aa)", transition: "all .15s" }}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setDrawer(true)} className="ghost-btn">
          ❤ {tr("My Deck", "Mi mazo")} · {saved.length}
        </button>
      </div>

      {mode === "daily" && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--ink-dim,#9aa)", fontWeight: 700, marginBottom: 6 }}>
            <span>{tr("Today's stack", "El mazo de hoy")}</span>
            <span>{Math.min(doneCount, total)} / {total}{streak > 0 ? `   ·   🔥 ${streak}` : ""}</span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: "var(--bg-card,#1c1c1c)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(Math.min(doneCount, total) / total) * 100}%`, background: "linear-gradient(90deg,#FF6FA8,#7B61FF)", transition: "width .3s" }} />
          </div>
        </div>
      )}

      {/* card stack */}
      <div className="deck-stage">
        {current ? (
          [pos + 2, pos + 1, pos].filter((i) => i < queue.length).map((i) => {
            const t = terms[queue[i]];
            const top = i === pos;
            const depth = i - pos; // 0 top, 1, 2
            const grad = GRADIENTS[hashStr(t.slug) % GRADIENTS.length];
            const media = t.gifUrl || t.imageUrl || null;
            return (
              <div
                key={t.slug + i}
                className="card-wrap"
                onPointerDown={top ? onDown : undefined}
                onPointerMove={top ? onMove : undefined}
                onPointerUp={top ? onUp : undefined}
                onPointerCancel={top ? onUp : undefined}
                style={{
                  zIndex: 10 - depth,
                  ...(top
                    ? topTransform()
                    : { transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.045})`, transition: "transform .25s" }),
                  pointerEvents: top ? "auto" : "none",
                }}
              >
                <div className={`card-flip${top && flipped ? " is-flipped" : ""}`} style={{ transform: top && flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  {/* FRONT */}
                  <div className={`face front${media ? "" : " front-grad"}`} style={{ background: media ? "#0a0a0a" : grad, backgroundSize: "200% 200%" }}>
                    {media && (
                      // Giphy/host GIFs: plain img (never run through the optimizer — keeps them animated)
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media} alt="" className="card-media" loading={depth === 0 ? "eager" : "lazy"} />
                    )}
                    {media && <div className="card-scrim" />}
                    {top && (
                      <>
                        <div className="stamp stamp-save" style={{ opacity: drag.dx > 20 ? Math.min((drag.dx - 20) / 80, 1) : 0 }}>{tr("SAVE", "GUARDAR")}</div>
                        <div className="stamp stamp-nope" style={{ opacity: drag.dx < -20 ? Math.min((-drag.dx - 20) / 80, 1) : 0 }}>{tr("SKIP", "PASAR")}</div>
                      </>
                    )}
                    <div className="card-meta">
                      {/* Romanized term, the Korean below it, then a pronunciation hint. */}
                      <div className="card-term">{t.term}</div>
                      {t.hangul && <div className="card-hangul" lang="ko">{t.hangul}</div>}
                      {t.roman && <div className="card-roman">{t.roman}</div>}
                      <div className="card-chips">
                        {t.songCount > 0 && <span className="chip chip-song">🎵 {t.songCount} {tr(t.songCount === 1 ? "song" : "songs", t.songCount === 1 ? "canción" : "canciones")}</span>}
                        <span className="chip chip-tap">{tr("tap to flip", "toca para girar")} ↻</span>
                      </div>
                    </div>
                  </div>
                  {/* BACK */}
                  <div className="face back">
                    <div className="back-scroll">
                      <div className="back-term">{t.term}{t.hangul ? <span className="back-hangul" lang="ko"> · {t.hangul}</span> : null}</div>
                      {t.roman && <div className="back-roman">{t.roman}</div>}
                      <p className="back-def">{es && t.defEs ? t.defEs : t.def}</p>
                      {(es && t.exampleEs ? t.exampleEs : t.example) && (
                        <p className="back-ex">“{es && t.exampleEs ? t.exampleEs : t.example}”</p>
                      )}
                      <div className="back-links">
                        <Link href={`/korean-slang/${t.slug}`} className="back-link primary" onPointerDown={(e) => e.stopPropagation()}>
                          {tr("Learn more", "Aprende más")} →
                        </Link>
                        <Link href={`/korean-slang/${t.slug}#songs`} className="back-link" onPointerDown={(e) => e.stopPropagation()}>
                          ＋ {tr("Link to a song / artist", "Vincular a canción / artista")}
                        </Link>
                      </div>
                      <div className="back-hint">{tr("tap to flip back", "toca para regresar")}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Empty / completion state
          <div className="card-wrap" style={{ pointerEvents: "auto" }}>
            <div className="face front done-face">
              <div style={{ fontSize: "3rem", marginBottom: 8 }}>{mode === "daily" ? "🎉" : "✨"}</div>
              <div className="done-title">
                {mode === "daily"
                  ? tr("You cleared today's 10!", "¡Completaste las 10 de hoy!")
                  : mode === "saved"
                  ? tr("That's your whole deck.", "Ese es todo tu mazo.")
                  : tr("You went through them all!", "¡Las revisaste todas!")}
              </div>
              {mode === "daily" && (
                <div className="done-streak">🔥 {tr("Streak", "Racha")}: {Math.max(streak, 1)} {tr(streak === 1 ? "day" : "days", streak === 1 ? "día" : "días")}</div>
              )}
              <div className="done-sub">
                {mode === "daily"
                  ? tr("Come back tomorrow for a fresh stack — or keep going.", "Vuelve mañana por un mazo nuevo — o sigue.")
                  : tr("Review the terms you saved, or start over.", "Repasa lo que guardaste, o empieza de nuevo.")}
              </div>
              <div className="done-actions">
                {saved.length > 0 && <button type="button" className="pill-btn" onClick={() => restart("saved")}>❤ {tr("Study my deck", "Estudiar mi mazo")} ({saved.length})</button>}
                {mode === "daily"
                  ? <button type="button" className="pill-btn ghost" onClick={() => restart("all")}>{tr(`Keep going — all ${terms.length} →`, `Seguir — las ${terms.length} →`)}</button>
                  : <button type="button" className="pill-btn ghost" onClick={() => restart(mode)}>{tr("Start over", "Empezar de nuevo")}</button>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* controls */}
      {current && (
        <div className="deck-controls">
          <button type="button" aria-label={tr("Skip", "Pasar")} className="rnd rnd-nope" onClick={() => commit("left")}>✕</button>
          <button type="button" aria-label={tr("Undo", "Deshacer")} className="rnd rnd-undo" onClick={undo} disabled={history.current.length === 0}>↩</button>
          <button type="button" aria-label={tr("Save", "Guardar")} className="rnd rnd-save" onClick={() => commit("right")}>❤</button>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 14, fontSize: "0.72rem", color: "var(--ink-faint,#6b7280)" }}>
        {tr("Swipe right to save · left to skip · tap to flip", "Desliza a la derecha para guardar · izquierda para pasar · toca para girar")}
        {anyGif ? <> · <span style={{ opacity: 0.7 }}>{tr("GIFs via GIPHY", "GIFs vía GIPHY")}</span></> : null}
      </div>

      {/* saved drawer */}
      {drawer && (
        <div className="drawer-overlay" onClick={() => setDrawer(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>❤ {tr("My Deck", "Mi mazo")} · {saved.length}</div>
              <button type="button" className="ghost-btn" onClick={() => setDrawer(false)}>✕</button>
            </div>
            {saved.length === 0 ? (
              <p style={{ color: "var(--ink-dim,#9aa)", fontSize: "0.9rem", padding: "24px 4px" }}>
                {tr("Swipe right on a card to start building your deck of slang to memorize.", "Desliza a la derecha una tarjeta para empezar tu mazo de jerga por memorizar.")}
              </p>
            ) : (
              <>
                <button type="button" className="pill-btn" style={{ width: "100%", marginBottom: 14 }} onClick={() => restart("saved")}>
                  ▶ {tr("Study these", "Estudiar estas")}
                </button>
                <div className="drawer-list">
                  {saved.map((sl) => {
                    const t = bySlug.get(sl);
                    if (!t) return null;
                    return (
                      <div key={sl} className="drawer-row">
                        <div style={{ minWidth: 0 }}>
                          <Link href={`/korean-slang/${sl}`} style={{ color: "#FF6FA8", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>{t.term}</Link>
                          <div style={{ color: "var(--ink-dim,#9aa)", fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{es && t.defEs ? t.defEs : t.def}</div>
                        </div>
                        <button type="button" className="ghost-btn" aria-label="remove" onClick={() => persistSaved(saved.filter((x) => x !== sl))}>✕</button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const deckCss = `
.deck-stage{position:relative;height:460px;perspective:1200px;margin:0 auto;max-width:360px;}
.card-wrap{position:absolute;inset:0;width:100%;height:100%;will-change:transform;touch-action:none;cursor:grab;}
.card-wrap:active{cursor:grabbing;}
.card-flip{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .5s ease-in-out;}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.08);}
/* backface-visibility is unreliable in mobile in-app WebViews (and the front's
   gradient animation defeats it), so we also hard-swap face opacity at the 90°
   midpoint: an instant change after a .25s delay = half of the .5s flip. This
   guarantees the outgoing face is gone before it can mirror through the other. */
.face.front{display:flex;align-items:flex-end;animation:gradShift 7s ease infinite;opacity:1;transition:opacity 0s linear .25s;}
.card-flip.is-flipped .face.front{opacity:0;}
.card-flip.is-flipped .face.back{opacity:1;}
.face.front-grad{align-items:center;justify-content:center;text-align:center;}
.face.back{transform:rotateY(180deg);background:#111114;display:flex;padding:22px;opacity:0;transition:opacity 0s linear .25s;}
.card-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none;pointer-events:none;}
.card-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.28) 42%,rgba(0,0,0,0) 68%);}
.card-meta{position:relative;padding:20px;width:100%;z-index:2;}
.card-term{color:#fff;font-weight:900;font-size:2rem;line-height:1.05;letter-spacing:-.02em;text-shadow:0 2px 14px rgba(0,0,0,.5);}
.card-hangul{color:rgba(255,255,255,.94);font-size:1.4rem;font-weight:700;line-height:1.2;margin-top:7px;letter-spacing:.01em;text-shadow:0 2px 14px rgba(0,0,0,.55);}
.card-roman{color:rgba(255,255,255,.66);font-size:.82rem;font-weight:500;letter-spacing:.05em;margin-top:5px;text-shadow:0 1px 8px rgba(0,0,0,.6);}
.front-grad .card-term{font-size:2.6rem;}
.front-grad .card-hangul{font-size:1.9rem;margin-top:10px;}
.front-grad .card-roman{font-size:.9rem;margin-top:7px;}
.front-grad .card-chips{justify-content:center;}
.back-roman{color:var(--ink-dim,#9aa);font-size:.82rem;letter-spacing:.05em;margin:-6px 0 14px;}
.card-chips{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap;}
.chip{font-size:.68rem;font-weight:800;padding:4px 10px;border-radius:999px;backdrop-filter:blur(4px);}
.chip-song{background:rgba(0,0,0,.55);color:#FFD166;}
.chip-tap{background:rgba(255,255,255,.16);color:#fff;}
.stamp{position:absolute;top:26px;font-weight:900;font-size:1.5rem;letter-spacing:.06em;padding:6px 14px;border-radius:10px;border:3px solid;z-index:3;pointer-events:none;transform:rotate(-14deg);}
.stamp-save{left:20px;color:#22e06b;border-color:#22e06b;}
.stamp-nope{right:20px;color:#ff5b7f;border-color:#ff5b7f;transform:rotate(14deg);}
.back-scroll{width:100%;overflow-y:auto;}
.back-term{color:#FF6FA8;font-weight:900;font-size:1.5rem;margin-bottom:12px;}
.back-hangul{color:var(--ink-dim,#9aa);font-weight:700;font-size:1rem;}
.back-def{color:#eee;font-size:1rem;line-height:1.6;margin:0 0 14px;}
.back-ex{color:var(--ink-dim,#9aa);font-style:italic;font-size:.9rem;line-height:1.5;margin:0 0 16px;padding-left:12px;border-left:2px solid #FF6FA8;}
.back-links{display:flex;flex-direction:column;gap:9px;}
.back-link{display:block;text-decoration:none;font-weight:800;font-size:.85rem;padding:11px 14px;border-radius:12px;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.1);}
.back-link.primary{background:#FF6FA8;color:#0a0a0a;border-color:#FF6FA8;}
.back-hint{text-align:center;color:var(--ink-faint,#6b7280);font-size:.72rem;margin-top:16px;}
.deck-controls{display:flex;align-items:center;justify-content:center;gap:20px;margin-top:22px;}
.rnd{width:60px;height:60px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:var(--bg-card,#161616);font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .12s,box-shadow .12s;color:#fff;}
.rnd:hover{transform:translateY(-2px);}
.rnd:disabled{opacity:.35;cursor:default;transform:none;}
.rnd-nope{color:#ff5b7f;box-shadow:0 6px 18px rgba(255,91,127,.18);}
.rnd-save{color:#22e06b;box-shadow:0 6px 18px rgba(34,224,107,.18);width:66px;height:66px;font-size:1.6rem;}
.rnd-undo{width:50px;height:50px;font-size:1.1rem;color:#FFD166;}
.done-face{flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px 24px;background:linear-gradient(160deg,#1a1130,#0d0d12);}
.done-title{font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:8px;}
.done-streak{color:#FFD166;font-weight:800;margin-bottom:10px;}
.done-sub{color:var(--ink-dim,#9aa);font-size:.9rem;line-height:1.5;margin-bottom:20px;max-width:260px;}
.done-actions{display:flex;flex-direction:column;gap:10px;width:100%;max-width:260px;}
.pill-btn{padding:12px 18px;border-radius:100px;border:none;background:#FF6FA8;color:#0a0a0a;font-weight:800;font-size:.9rem;cursor:pointer;}
.pill-btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.18);}
.ghost-btn{background:transparent;border:1px solid var(--border,#333);color:var(--ink-dim,#aaa);border-radius:100px;padding:7px 14px;font-weight:800;font-size:.78rem;cursor:pointer;}
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:80;display:flex;justify-content:flex-end;backdrop-filter:blur(2px);}
.drawer{width:min(420px,92vw);height:100%;background:#0f0f12;border-left:1px solid var(--border,#262626);padding:22px;overflow-y:auto;animation:slideIn .22s ease;}
.drawer-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.drawer-list{display:flex;flex-direction:column;gap:8px;}
.drawer-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border-radius:12px;background:var(--bg-card,#161616);border:1px solid var(--border,#222);}
@keyframes gradShift{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
@keyframes slideIn{from{transform:translateX(30px);opacity:.4;}to{transform:translateX(0);opacity:1;}}
@media (max-width:420px){.deck-stage{height:66vh;max-height:480px;}}
`;
