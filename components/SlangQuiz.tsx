"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { DeckTerm } from "@/lib/slang-terms";
import { useLang, useT } from "@/components/LangProvider";
import { readSaved, readReview, addToReview } from "@/lib/slang-review";

/**
 * The adaptive practice quiz for the Korean-slang deck. Unlike the fixed
 * /quiz/korean-slang set, every run is generated from the full pool of terms and
 * weighted toward the cards the user picked up — their saved deck first, and the
 * words they *missed last time* (the review set) ahead of that. Each question
 * asks which term matches a meaning; the stem is a cleaned gloss with the term
 * itself masked so it can't give away the answer.
 *
 * Close the loop: a wrong answer pushes that term into the review set
 * (localStorage, shared with SlangDeck), so it resurfaces in the deck's next
 * Review round — and in the next quiz. A perfect run claims a one-time +10 the
 * ledger records for the arcade to credit (login required).
 */

const QUIZ_SIZE = 10;
const ACCENT = "#4AC8F0"; // matches the korean-slang quiz identity

type Opt = { slug: string; label: string };
type Q = {
  slug: string;
  stem: string;
  stemEs?: string | null;
  options: Opt[];
  answer: number;
  def: string;
  defEs?: string | null;
  example?: string | null;
  exampleEs?: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Strip a house-style "<Korean> (hanja) — " lead-in so the stem never opens with
// the very word being quizzed. Only fires when the string actually starts with
// CJK/Hangul followed by a dash/colon/comma separator.
function stripLeadingTerm(s: string): string {
  return s.replace(
    /^[가-힣ᄀ-ᇿ㄰-㆏㐀-鿿（）()・·'"\s]+(\([^)]*\)\s*)?[—–\-:,]\s+/u,
    "",
  );
}

function firstSentence(s: string): string {
  const m = s.match(/^.*?[.!?](\s|$)/);
  let out = (m ? m[0] : s).trim();
  if (out.length > 190) out = out.slice(0, 187).trimEnd() + "…";
  return out;
}

// Blank out any lingering mention of the term (romanized or hangul) in the gloss.
function maskTerm(gloss: string, term: string, hangul?: string | null): string {
  let s = gloss;
  if (term) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    s = s.replace(re, "____");
  }
  if (hangul) s = s.split(hangul).join("____");
  return s;
}

function glossOf(def: string, term: string, hangul?: string | null): string {
  const g = maskTerm(firstSentence(stripLeadingTerm((def || "").trim())), term, hangul);
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function labelOf(t: DeckTerm): string {
  return t.hangul ? `${t.term} · ${t.hangul}` : t.term;
}

// Build one QUIZ_SIZE-question round: review terms first, then saved, then the
// rest of the pool, each group shuffled — "dynamic based on the cards you pick up."
function buildRound(terms: DeckTerm[]): Q[] {
  const bySlug = new Map(terms.map((t) => [t.slug, t]));
  const pool = terms.filter((t) => t.def && t.def.trim().length > 0);
  if (pool.length < 4) return [];

  const review = readReview().filter((s) => bySlug.has(s));
  const saved = readSaved().filter((s) => bySlug.has(s));

  const seen = new Set<string>();
  const ordered: DeckTerm[] = [];
  const pushSlugs = (slugs: string[]) => {
    for (const sl of shuffle(slugs)) {
      if (seen.has(sl)) continue;
      const t = bySlug.get(sl);
      if (t && t.def) { seen.add(sl); ordered.push(t); }
    }
  };
  pushSlugs(review);
  pushSlugs(saved);
  // Fill the rest from the whole pool.
  for (const t of shuffle(pool)) {
    if (seen.has(t.slug)) continue;
    seen.add(t.slug);
    ordered.push(t);
  }

  const targets = ordered.slice(0, Math.min(QUIZ_SIZE, ordered.length));
  return targets.map((t) => {
    const distractors = shuffle(pool.filter((p) => p.slug !== t.slug)).slice(0, 3);
    const opts = shuffle([t, ...distractors]).map((o) => ({ slug: o.slug, label: labelOf(o) }));
    return {
      slug: t.slug,
      stem: glossOf(t.def, t.term, t.hangul),
      stemEs: t.defEs ? glossOf(t.defEs, t.term, t.hangul) : null,
      options: opts,
      answer: opts.findIndex((o) => o.slug === t.slug),
      def: t.def,
      defEs: t.defEs,
      example: t.example,
      exampleEs: t.exampleEs,
    };
  });
}

type ClaimState = "idle" | "loading" | "awarded" | "already" | "guest" | "error";

export default function SlangQuiz({ terms, loggedIn }: { terms: DeckTerm[]; loggedIn: boolean }) {
  const { lang } = useLang();
  const es = lang === "es";
  const t = useT();

  const [round, setRound] = useState(0); // bump to rebuild on "play again"
  const [questions, setQuestions] = useState<Q[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [missed, setMissed] = useState<string[]>([]);
  const [claim, setClaim] = useState<ClaimState>("idle");

  // Build the round client-side (reads localStorage) to avoid SSR/hydration drift.
  useEffect(() => {
    setQuestions(buildRound(terms));
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setDone(false);
    setMissed([]);
    setClaim("idle");
  }, [terms, round]);

  const total = questions.length;
  const current = questions[qIndex];
  const pct = total ? Math.round((score / total) * 100) : 0;
  const perfect = done && total > 0 && score === total;

  function confirm() {
    if (selected === null || !current) return;
    if (selected === current.answer) setScore((s) => s + 1);
    else setMissed((m) => (m.includes(current.slug) ? m : [...m, current.slug]));
    setConfirmed(true);
  }
  function next() {
    if (qIndex + 1 < total) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setDone(true);
    }
  }

  // On finishing: persist misses into the shared review set (feeds the deck).
  useEffect(() => {
    if (done && missed.length) addToReview(missed);
  }, [done, missed]);

  // On a perfect run, claim the one-time daily +10 (login-gated).
  const claimed = useRef(false);
  useEffect(() => {
    if (!perfect || claimed.current) return;
    claimed.current = true;
    if (!loggedIn) { setClaim("guest"); return; }
    setClaim("loading");
    (async () => {
      try {
        const res = await fetch("/api/slang-quiz/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total, correctSlugs: questions.map((q) => q.slug) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setClaim("error"); return; }
        setClaim(data.awarded ? "awarded" : "already");
      } catch {
        setClaim("error");
      }
    })();
  }, [perfect, loggedIn, total, questions]);

  const playAgain = useCallback(() => {
    claimed.current = false;
    setRound((r) => r + 1);
  }, []);

  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 14, width: "100%", maxWidth: 620,
    margin: "0 auto", overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    border: "1px solid rgba(0,0,0,0.06)",
  };

  // ── Loading (first client tick) ─────────────────────────────────────────────
  if (!total) {
    return (
      <div style={{ ...card, padding: "48px 32px", textAlign: "center", color: "#888", fontWeight: 700 }}>
        {t("Shuffling your deck…", "Barajando tu mazo…")}
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────────
  if (done) {
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👏" : pct >= 40 ? "📖" : "💪";
    const msg =
      pct === 100 ? t("Perfect run. You actually know your slang.", "Ronda perfecta. De verdad te sabes tu slang.") :
      pct >= 80 ? t("So close to perfect — one more run.", "Casi perfecto — una ronda más.") :
      pct >= 60 ? t("Solid. The ones you missed are waiting in your deck.", "Bien. Las que fallaste te esperan en tu mazo.") :
      pct >= 40 ? t("Keep going — study your misses in the deck and try again.", "Sigue — estudia tus fallos en el mazo e inténtalo de nuevo.") :
      t("Rookie run. Pick these up in the deck and come back.", "Nivel rookie. Recoge estas en el mazo y vuelve.");

    return (
      <div style={card}>
        <div style={{ height: 5, background: ACCENT }} />
        <div style={{ padding: "40px 32px 34px", textAlign: "center" }}>
          <div style={{ fontSize: "3.4rem", marginBottom: 12 }}>{emoji}</div>
          <div style={{ fontWeight: 800, fontSize: "2.2rem", color: "#111", marginBottom: 10 }}>{score} / {total}</div>
          <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 999, marginBottom: 18, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, borderRadius: 999, transition: "width 0.6s ease" }} />
          </div>
          <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 20px" }}>{msg}</p>

          {/* Points state on a perfect run */}
          {perfect && (
            <div style={{ background: "#f0fbff", border: `1px solid ${ACCENT}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
              {claim === "loading" && <div style={{ fontWeight: 700, color: "#0b7285" }}>{t("Claiming your +10…", "Reclamando tus +10…")}</div>}
              {claim === "awarded" && (
                <div style={{ fontWeight: 800, color: "#0b7285", fontSize: "1.05rem" }}>
                  🎉 {t("+10 points locked in for today!", "¡+10 puntos asegurados por hoy!")}
                  <div style={{ fontWeight: 500, fontSize: "0.8rem", color: "#555", marginTop: 6 }}>
                    {t("Points are credited to your arcade balance after review.", "Los puntos se acreditan a tu saldo del arcade tras la revisión.")}
                  </div>
                </div>
              )}
              {claim === "already" && (
                <div style={{ fontWeight: 700, color: "#0b7285" }}>
                  ✅ {t("You already earned today's +10.", "Ya ganaste los +10 de hoy.")}
                  <div style={{ fontWeight: 500, fontSize: "0.8rem", color: "#555", marginTop: 6 }}>
                    {t("Come back tomorrow for another perfect-run bonus.", "Vuelve mañana por otro bono de ronda perfecta.")}
                  </div>
                </div>
              )}
              {claim === "guest" && (
                <div style={{ fontWeight: 700, color: "#0b7285" }}>
                  {t("Perfect run! ", "¡Ronda perfecta! ")}
                  <Link href="/login?next=/korean-slang/quiz" style={{ color: "#0b7285", fontWeight: 800, textDecoration: "underline" }}>
                    {t("Log in to claim your +10 →", "Inicia sesión para reclamar tus +10 →")}
                  </Link>
                </div>
              )}
              {claim === "error" && (
                <div style={{ fontWeight: 700, color: "#b91c1c" }}>{t("Couldn't reach the points server — your score still counts.", "No pudimos conectar al servidor de puntos — tu puntaje igual cuenta.")}</div>
              )}
            </div>
          )}

          {/* Misses → deck review loop */}
          {missed.length > 0 && (
            <Link href="/korean-slang" style={{ display: "block", background: "#fff4fa", border: "1px solid #FF6FA8", borderRadius: 12, padding: "14px 16px", marginBottom: 20, textDecoration: "none", color: "#b4005e", fontWeight: 700, fontSize: "0.9rem" }}>
              📌 {t(`${missed.length} ${missed.length === 1 ? "word" : "words"} saved to review — study them in the deck →`, `${missed.length} ${missed.length === 1 ? "palabra guardada" : "palabras guardadas"} para repasar — estúdialas en el mazo →`)}
            </Link>
          )}

          <button onClick={playAgain} style={{ background: ACCENT, color: "#06333f", border: "none", borderRadius: 9, padding: "13px 26px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", letterSpacing: "0.03em" }}>
            {t("Play again →", "Jugar de nuevo →")}
          </button>
          <div style={{ marginTop: 16 }}>
            <Link href="/korean-slang" style={{ color: "#888", fontWeight: 700, fontSize: "0.82rem", textDecoration: "underline" }}>
              {t("Back to the slang deck", "Volver al mazo de jerga")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Question ────────────────────────────────────────────────────────────────
  if (!current) return null;
  const stem = es && current.stemEs ? current.stemEs : current.stem;
  return (
    <div style={card}>
      <div style={{ height: 5, background: "#eee", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(qIndex / total) * 100}%`, background: ACCENT, transition: "width 0.3s" }} />
      </div>
      <div style={{ padding: "26px 28px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span style={{ fontSize: "1.4rem" }}>💬</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.8rem", color: "#111" }}>{t("Korean Slang · Practice", "Slang Coreano · Práctica")}</div>
            <div style={{ fontSize: "0.72rem", color: "#aaa" }}>{t(`Question ${qIndex + 1} of ${total}`, `Pregunta ${qIndex + 1} de ${total}`)}</div>
          </div>
          <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: "0.85rem", color: ACCENT }}>{score}/{qIndex}</div>
        </div>

        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#999", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("Which term means this?", "¿Qué término significa esto?")}
        </div>
        <div style={{ fontWeight: 800, fontSize: "1.08rem", lineHeight: 1.5, color: "#111", marginBottom: 20 }}>“{stem}”</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {current.options.map((opt, i) => {
            let bg = "#f7f7f8", border = "#ececec", color = "#111";
            if (confirmed) {
              if (i === current.answer) { bg = "#e6f9f0"; border = "#22c55e"; color = "#15803d"; }
              else if (i === selected) { bg = "#fef2f2"; border = "#ef4444"; color = "#b91c1c"; }
            } else if (i === selected) { bg = "#f0fbff"; border = ACCENT; }
            return (
              <button
                key={opt.slug}
                onClick={() => { if (!confirmed) setSelected(i); }}
                disabled={confirmed}
                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 9, padding: "14px 16px", textAlign: "left", cursor: confirmed ? "default" : "pointer", fontWeight: 700, fontSize: "0.95rem", color, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 12 }}
              >
                <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: border === "#ececec" ? "#e0e0e0" : border, color: border === "#ececec" ? "#666" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>
                  {confirmed && i === current.answer ? "✓" : confirmed && i === selected ? "✕" : String.fromCharCode(65 + i)}
                </span>
                <span lang="ko">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {confirmed && (
          <div style={{ marginTop: 16, background: "#f9f9f9", borderLeft: `4px solid ${ACCENT}`, borderRadius: "0 6px 6px 0", padding: "12px 16px", fontSize: "0.82rem", color: "#555", lineHeight: 1.6 }}>
            {es && current.defEs ? current.defEs : current.def}
            {(es && current.exampleEs ? current.exampleEs : current.example) && (
              <div style={{ marginTop: 8, fontStyle: "italic", color: "#777" }}>“{es && current.exampleEs ? current.exampleEs : current.example}”</div>
            )}
            <div style={{ marginTop: 10 }}>
              <Link href={`/korean-slang/${current.slug}`} style={{ color: ACCENT, fontWeight: 800, textDecoration: "none" }}>
                {t("Read the full definition →", "Lee la definición completa →")}
              </Link>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {!confirmed ? (
            <button onClick={confirm} disabled={selected === null}
              style={{ width: "100%", background: selected === null ? "#e5e5e5" : ACCENT, color: selected === null ? "#aaa" : "#06333f", border: "none", borderRadius: 9, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: selected === null ? "not-allowed" : "pointer", letterSpacing: "0.04em" }}>
              {t("CHECK ANSWER", "REVISAR RESPUESTA")}
            </button>
          ) : (
            <button onClick={next}
              style={{ width: "100%", background: ACCENT, color: "#06333f", border: "none", borderRadius: 9, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", letterSpacing: "0.04em" }}>
              {qIndex + 1 < total ? t("NEXT QUESTION →", "SIGUIENTE PREGUNTA →") : t("SEE RESULTS →", "VER RESULTADOS →")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
