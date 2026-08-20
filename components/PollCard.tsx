"use client";

// One-tap poll → instant animated results → profile claim (the "One-Tap K-Pop
// Polls" PRD, 3-step flow). SSR-hydrated: `initial` comes from the server so the
// two option cards are tappable on first paint with no client fetch.
//
// Undo without a delete endpoint: a tap shows results optimistically but the
// server commit is DEFERRED 5s; "Undo" cancels the pending commit (nothing was
// written), and leaving the page flushes it — so a vote is still final after the
// window, satisfying "no confirm" + "votes are final" together.

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { trackEvent } from "@/lib/gtag";
import { LOW_VOLUME_FLOOR, type PollState, type PollCounts, type TimeBucket } from "@/lib/polls";

const DEVICE_KEY = "aa_vid";
const CLAIM_DISMISS_KEY = "aa_claim_dismissed";
const GREEN = "#22e06b";
const PINK = "#ff5b8a";

export default function PollCard({ initial, articlePath }: { initial: PollState; articlePath: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const t = (en: string, e: string) => (es ? e : en);

  const q = (es ? initial.questionEs : initial.question) || initial.question;
  const labelA = (es ? initial.optionAEs : initial.optionA) || initial.optionA;
  const labelB = (es ? initial.optionBEs : initial.optionB) || initial.optionB;

  const [pick, setPick] = useState<"a" | "b" | null>(initial.myVote);
  const [committed, setCommitted] = useState<boolean>(initial.myVote !== null);
  const [serverCounts, setServerCounts] = useState<PollCounts>(initial.counts);
  const [phase, setPhase] = useState<"vote" | "results">(initial.myVote !== null || initial.closed ? "results" : "vote");
  const [undoLeft, setUndoLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [buckets, setBuckets] = useState<TimeBucket[] | null>(null);
  const [chartWindow, setChartWindow] = useState<"24h" | "all">("all");
  const [claimDismissed, setClaimDismissed] = useState(false);

  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deviceId = useRef<string | null>(null);

  const commit = useCallback((opt: "a" | "b") => {
    fetch(`/api/polls/${initial.slug}/vote`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option: opt, deviceId: deviceId.current ?? undefined }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setServerCounts(d.counts); setPick(d.myVote); setCommitted(true); setError(null);
          if (d.deviceToken) { try { localStorage.setItem(DEVICE_KEY, d.deviceToken); } catch {} deviceId.current = d.deviceToken; }
        } else if (d?.closed) { setServerCounts(d.counts); setCommitted(true); }
        else setError(t("Couldn't save your vote — tap to retry.", "No se pudo guardar tu voto — toca para reintentar."));
      })
      .catch(() => setError(t("Couldn't save your vote — tap to retry.", "No se pudo guardar tu voto — toca para reintentar.")));
  }, [initial.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reconcile on mount when SSR didn't already recognize this voter. The GET
  // triggers claim re-parenting for a logged-in user with prior anonymous votes,
  // and recognizes a returning voter whose cookie was dropped (webview) via the
  // localStorage device id.
  useEffect(() => {
    try { deviceId.current = localStorage.getItem(DEVICE_KEY); } catch {}
    if (initial.myVote !== null) return;
    const qs = deviceId.current ? `?deviceId=${encodeURIComponent(deviceId.current)}` : "";
    fetch(`/api/polls/${initial.slug}${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d?.ok) return;
        if (d.deviceToken) { try { localStorage.setItem(DEVICE_KEY, d.deviceToken); } catch {} deviceId.current = d.deviceToken; }
        if (d.poll?.myVote === "a" || d.poll?.myVote === "b") { setPick(d.poll.myVote); setCommitted(true); setPhase("results"); }
        if (d.poll?.counts) setServerCounts(d.poll.counts);
      })
      .catch(() => {});
  }, [initial.slug, initial.myVote]);

  const vote = (opt: "a" | "b") => {
    if (pick || initial.closed) return;
    setPick(opt); setPhase("results"); setError(null);
    setUndoLeft(5);
    undoTimer.current = setInterval(() => setUndoLeft((s) => { if (s <= 1) { if (undoTimer.current) clearInterval(undoTimer.current); return 0; } return s - 1; }), 1000);
    commitTimer.current = setTimeout(() => commit(opt), 5000);
    trackEvent("poll_vote", { poll_id: initial.slug, option: opt });
  };

  const undo = () => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    if (undoTimer.current) clearInterval(undoTimer.current);
    setUndoLeft(0); setPick(null); setPhase("vote"); setError(null);
  };

  // Flush a still-pending vote if the reader navigates away inside the 5s window.
  useEffect(() => {
    const flush = () => { if (pick && !committed && commitTimer.current) { clearTimeout(commitTimer.current); commit(pick); } };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [pick, committed, commit]);

  // Reconcile totals every 12s on the results view (PRD: ~seconds-stale is fine).
  useEffect(() => {
    if (phase !== "results" || !committed) return;
    const id = setInterval(() => {
      fetch(`/api/polls/${initial.slug}`).then((r) => r.json()).then((d) => { if (d?.ok) setServerCounts(d.poll.counts); }).catch(() => {});
    }, 12000);
    return () => clearInterval(id);
  }, [phase, committed, initial.slug]);

  useEffect(() => {
    if (phase !== "results" || buckets) return;
    fetch(`/api/polls/${initial.slug}/timeseries`).then((r) => r.json()).then((d) => { if (d?.ok) setBuckets(d.buckets); }).catch(() => {});
  }, [phase, buckets, initial.slug]);

  useEffect(() => { try { setClaimDismissed(localStorage.getItem(CLAIM_DISMISS_KEY) === "1"); } catch {} }, []);

  // Optimistic display: server counts + a pending +1 on the not-yet-committed pick.
  const display: PollCounts = pick && !committed
    ? { a: serverCounts.a + (pick === "a" ? 1 : 0), b: serverCounts.b + (pick === "b" ? 1 : 0), total: serverCounts.total + 1 }
    : serverCounts;
  const total = display.total;
  const aPct = total ? Math.round((display.a / total) * 100) : 50;
  const bPct = 100 - aPct;
  const showPct = total >= LOW_VOLUME_FLOOR;

  const share = async () => {
    const url = `https://www.aegyoarena.com${articlePath}`;
    const text = showPct ? `${q}\n${aPct}% ${labelA} · ${bPct}% ${labelB}` : q;
    trackEvent("poll_share", { poll_id: initial.slug });
    try {
      if (typeof navigator !== "undefined" && navigator.share) await navigator.share({ title: q, text, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* user cancelled share sheet */ }
  };

  const nf = (n: number) => n.toLocaleString(es ? "es-MX" : "en-US");

  return (
    <div style={{ marginTop: 34 }}>
      <style>{`
        .aa-bar-fill{transition:width .9s cubic-bezier(.16,1,.3,1)}
        @media (prefers-reduced-motion: reduce){.aa-bar-fill{transition:none}}
        .aa-opt:active{transform:scale(.985)}
      `}</style>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 7 }}>
        {t("K-pop Poll", "Encuesta K-pop")} {initial.closed ? `· ${t("closed", "cerrada")}` : ""}
      </div>

      <div style={{ border: "1px solid #2a2333", borderRadius: 16, background: "var(--bg-card, #14101c)", padding: 18, overflow: "hidden" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.12rem", fontWeight: 700, color: "var(--ink,#fff)", lineHeight: 1.3, marginBottom: 14 }}>{q}</div>

        {phase === "vote" && !initial.closed ? (
          /* ── Step 1: one-tap vote ── */
          <>
            <div style={{ display: "flex", gap: 10 }}>
              {([["a", labelA, GREEN], ["b", labelB, PINK]] as const).map(([opt, label, color]) => (
                <button key={opt} onClick={() => vote(opt)} className="aa-opt"
                  style={{ flex: 1, minHeight: 92, borderRadius: 14, border: `1px solid ${color}55`, background: `${color}14`, color, fontWeight: 800, fontSize: "1.15rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, WebkitTapHighlightColor: "transparent" }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: "0.78rem", color: "var(--ink-faint,#8a8194)" }}>
              {total > 0 ? `${nf(total)} ${t("votes", "votos")} · ${t("tap to vote — no account needed", "toca para votar — sin cuenta")}` : t("Be the first to vote — one tap, no account", "Sé la primera en votar — un toque, sin cuenta")}
            </div>
          </>
        ) : (
          /* ── Step 2: results ── */
          <>
            {[["a", labelA, GREEN, display.a, aPct], ["b", labelB, PINK, display.b, bPct]].map((row) => {
              const [opt, label, color, count, pct] = row as [("a" | "b"), string, string, number, number];
              const mine = pick === opt;
              return (
                <div key={opt} style={{ position: "relative", marginBottom: 10, borderRadius: 12, overflow: "hidden", border: mine ? `1px solid ${color}` : "1px solid #241d30", background: "#1a1526", minHeight: 46 }}>
                  <div className="aa-bar-fill" style={{ position: "absolute", inset: 0, width: showPct ? `${pct}%` : "0%", background: `${color}${mine ? "33" : "1f"}` }} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", fontWeight: 700 }}>
                    <span style={{ color, display: "flex", alignItems: "center", gap: 7 }}>{mine && <span aria-label="your pick">✓</span>}{label}</span>
                    <span style={{ color: "var(--ink,#fff)", fontVariantNumeric: "tabular-nums" }}>{showPct ? `${pct}%` : nf(count)}</span>
                  </div>
                </div>
              );
            })}

            <div style={{ fontSize: "0.76rem", color: "var(--ink-faint,#8a8194)", margin: "4px 0 2px" }}>
              {showPct
                ? `${nf(total)} ${t("votes", "votos")}${total > 0 && display.a === display.b ? ` · ${t("dead even", "empate")}` : ""}`
                : `${t("Early voting…", "Votación temprana…")} · ${nf(total)} ${t("votes so far", "votos hasta ahora")}`}
            </div>

            {/* results-over-time sparkline */}
            {buckets && buckets.length >= 2 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint,#8a8194)" }}>{t("Split over time", "División en el tiempo")} · {labelA}</span>
                  <span style={{ display: "flex", gap: 4 }}>
                    {(["24h", "all"] as const).map((w) => (
                      <button key={w} onClick={() => setChartWindow(w)} style={{ fontSize: "0.6rem", padding: "2px 7px", borderRadius: 99, cursor: "pointer", border: "1px solid #2a2333", background: chartWindow === w ? "#2a2333" : "transparent", color: chartWindow === w ? "var(--ink,#fff)" : "var(--ink-faint,#8a8194)" }}>{w === "24h" ? "24h" : t("All", "Todo")}</button>
                    ))}
                  </span>
                </div>
                <Sparkline buckets={chartWindow === "24h" ? buckets.slice(-24) : buckets} />
              </div>
            )}

            {error && <button onClick={() => pick && commit(pick)} style={{ marginTop: 8, width: "100%", padding: "9px", borderRadius: 10, border: "1px solid #ff5b6e55", background: "#ff5b6e14", color: "#ff8a97", fontSize: "0.8rem", cursor: "pointer" }}>{error}</button>}

            {/* Share (above claim — sharing feeds acquisition) */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={share} style={{ flex: 1, padding: "11px", borderRadius: 99, border: "none", background: "#ff6fa8", color: "var(--on-accent,#1a0a12)", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
                {copied ? t("Link copied ✓", "Enlace copiado ✓") : t("Share this poll", "Compartir encuesta")}
              </button>
            </div>
            {initial.daebakUrl && (
              <a href={initial.daebakUrl} target="_blank" rel="noopener noreferrer nofollow" data-no-outbound="1"
                onClick={() => trackEvent("prediction_market_click", { promotion_id: "daebak-market", promotion_name: initial.question, link_url: initial.daebakUrl })}
                style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: "0.78rem", color: "var(--ink-faint,#8a8194)", textDecoration: "none" }}>
                {t("Want to put points on it? Wager on Daebak →", "¿Quieres apostar puntos? Apuesta en Daebak →")}
              </a>
            )}

            {/* Step 3: profile claim (the conversion moment) */}
            {initial.voterName ? (
              <div style={{ marginTop: 14, textAlign: "center", fontSize: "0.76rem", color: "var(--ink-faint,#8a8194)" }}>
                🗳 {t("Voting as", "Votando como")} <span style={{ color: "#ff6fa8", fontWeight: 700 }}>@{initial.voterName}</span>
              </div>
            ) : !claimDismissed ? (
              <div style={{ position: "relative", marginTop: 14, borderRadius: 12, border: "1px dashed #3a2f4a", background: "linear-gradient(180deg, rgba(255,111,168,.08), rgba(255,111,168,.02))", padding: "14px 16px" }}>
                <button onClick={() => { try { localStorage.setItem(CLAIM_DISMISS_KEY, "1"); } catch {} setClaimDismissed(true); }} aria-label="dismiss" style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "var(--ink-faint,#8a8194)", fontSize: "1rem", cursor: "pointer", lineHeight: 1 }}>×</button>
                <div style={{ fontWeight: 800, color: "var(--ink,#fff)", fontSize: "0.92rem" }}>{t("Claim your votes", "Reclama tus votos")}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-dim,#b9b1c6)", lineHeight: 1.55, margin: "3px 0 10px" }}>
                  {t("Keep your streak & history when voting goes members-only.", "Conserva tu racha e historial cuando la votación sea solo para miembros.")}
                </div>
                <Link href={`/signup?next=${encodeURIComponent(articlePath)}`} onClick={() => trackEvent("poll_claim_start", { poll_id: initial.slug })}
                  style={{ display: "inline-block", padding: "8px 16px", borderRadius: 99, background: "#000", color: "var(--genius-yellow,#ffec3d)", fontWeight: 800, fontSize: "0.8rem", textDecoration: "none" }}>
                  {t("Claim your votes →", "Reclamar mis votos →")}
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Undo toast — insurance for fat-fingers; the vote commits when it expires */}
      {undoLeft > 0 && (
        <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8, padding: "9px 14px", borderRadius: 99, background: "#000", border: "1px solid #2a2333" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--ink,#fff)" }}>{t("Voted", "Votaste")} <b style={{ color: pick === "a" ? GREEN : PINK }}>{pick === "a" ? labelA : labelB}</b></span>
          <button onClick={undo} style={{ background: "none", border: "none", color: "#ff6fa8", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}>{t("Undo", "Deshacer")} ({undoLeft})</button>
        </div>
      )}

      <a href="/how-we-count-votes" style={{ display: "block", textAlign: "center", marginTop: 8, fontSize: "0.66rem", color: "var(--ink-faint,#8a8194)", textDecoration: "none" }}>{t("How we count votes", "Cómo contamos los votos")}</a>
    </div>
  );
}

// Purpose-built ~1KB sparkline of the cumulative option-A share over time.
function Sparkline({ buckets }: { buckets: TimeBucket[] }) {
  if (buckets.length < 2) return null;
  let ca = 0, cb = 0;
  const pts = buckets.map((bk) => { ca += bk.a; cb += bk.b; const tot = ca + cb; return tot ? ca / tot : 0.5; });
  const W = 260, H = 44;
  const coords = pts.map((p, i) => `${((i / (pts.length - 1)) * W).toFixed(1)},${(H - p * H).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={44} preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#2a2333" strokeWidth="1" strokeDasharray="3 3" />
      <polyline points={coords} fill="none" stroke={GREEN} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
