"use client";

/**
 * Aegyo Arena live chat — one global room, bottom-right of every page.
 *
 * States:
 *   pill  → the persistent launcher. Room name, a live count of who is here,
 *           an unread badge. It shows NO message content: history is revealed
 *           only after a tap. About 215x58 on a 375x812 phone, roughly 4% of
 *           the screen, well inside the 15% budget.
 *   mini  → what the pill collapses to when a visitor dismisses it (46px).
 *   open  → the full panel: header, history, reactions, composer.
 *
 * Anyone can read. Replying and reacting both need a verified email, collected
 * inline as a two-step code exchange; whatever the visitor was reaching for is
 * replayed once they are through, so a tapped heart is never lost.
 *
 * Reads poll /api/chat/messages with a `since` cursor (lib/chat-db.ts explains
 * why polling and not websockets). The loop pauses on a hidden tab and slows
 * right down while the panel is closed.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useT } from "@/components/LangProvider";

type Msg = { seq: number; id: string; userId: string; authorName: string; body: string; createdAt: string };
type Tally = { messageId: string; emoji: string; count: number; mine: boolean };
type Me = { id: string; displayName: string | null; canSend: boolean; canModerate: boolean } | null;
type Launcher = "pill" | "mini";
type Step = "chat" | "email" | "code";
type Pending = { kind: "send"; body: string } | { kind: "react"; messageId: string; emoji: string } | null;

const MAX_LEN = 240;
const POLL_OPEN_MS = 5_000;
const POLL_IDLE_MS = 45_000;
const LS_LAUNCHER = "aa-chat-launcher";
const LS_SEEN = "aa-chat-seen-seq";
const LS_DEVICE = "aa-chat-did";

const REACTIONS = ["💜", "🔥", "😭", "😂", "✨", "💖"];
const COMPOSER_EMOJI = ["💜", "🔥", "✨", "💖", "😭", "😂", "🥰", "👑", "🎀", "🎤", "🐰", "🙌"];

// Report reasons are duplicated here rather than imported from the moderation
// module, so the rule list itself never ships to the browser.
const REPORT_REASONS: { value: string; en: string; es: string }[] = [
  { value: "bullying", en: "Bullying someone", es: "Acoso a alguien" },
  { value: "violence", en: "Violence or threats", es: "Violencia o amenazas" },
  { value: "hate", en: "Hate speech", es: "Discurso de odio" },
  { value: "spam", en: "Spam", es: "Spam" },
];

function deviceId(): string {
  try {
    let id = localStorage.getItem(LS_DEVICE);
    if (!id) {
      id = (crypto.randomUUID?.() ?? String(Math.random()).slice(2)).replace(/[^a-zA-Z0-9-]/g, "");
      localStorage.setItem(LS_DEVICE, id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Deterministic accent per author, so a handle keeps the same colour all session. */
const HUES = ["#FF6FA8", "#C8F04A", "#4AC8F0", "#B8A0FF", "#FF8C42"];
function hueFor(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) % 997;
  return HUES[h % HUES.length];
}

function clockOf(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function LiveChatBubble() {
  const t = useT();
  const pathname = usePathname();

  const [launcher, setLauncher] = useState<Launcher>("pill");
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [present, setPresent] = useState(0);
  const [seenSeq, setSeenSeq] = useState(0);

  const [step, setStep] = useState<Step>("chat");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [pending, setPending] = useState<Pending>(null);

  const [draft, setDraft] = useState("");
  const [hasSent, setHasSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const sinceRef = useRef(0);
  const ticksRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_LAUNCHER) === "mini") setLauncher("mini");
      setSeenSeq(Number(localStorage.getItem(LS_SEEN) ?? 0) || 0);
    } catch { /* storage unavailable */ }
  }, []);

  const persistLauncher = useCallback((next: Launcher) => {
    setLauncher(next);
    try { localStorage.setItem(LS_LAUNCHER, next); } catch { /* ignore */ }
  }, []);

  const markSeen = useCallback((seq: number) => {
    setSeenSeq((prev) => {
      const next = Math.max(prev, seq);
      try { localStorage.setItem(LS_SEEN, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── Poll loop ──────────────────────────────────────────────────────────────
  /**
   * One poll. `cold` drops the cursor and refetches the whole window, which is
   * how a moderator's restore comes back: a hide is echoed to open clients, but
   * an un-hide sits behind a seq the client has already passed. A cold pass runs
   * whenever the panel opens and every few minutes in a tab left open.
   */
  const refresh = useCallback(async (cold = false) => {
    if (cold) sinceRef.current = 0;
    // Decided here, not inside the setMsgs updater: React runs that updater
    // during a later render, by which point sinceRef has already advanced — so
    // reading the ref in there turned every cold pass into a duplicate append.
    const isCold = sinceRef.current === 0;

    const qs = new URLSearchParams({ ref: deviceId() });
    if (sinceRef.current) qs.set("since", String(sinceRef.current));
    const res = await fetch(`/api/chat/messages?${qs}`, { cache: "no-store" });
    if (!res.ok) return;
    const d = (await res.json()) as {
      messages: Msg[]; reactions: Tally[]; hidden: string[]; present: number; me: Me;
    };
    setPresent(d.present ?? 0);
    setMe(d.me ?? null);
    setTallies(d.reactions ?? []);

    const gone = new Set(d.hidden ?? []);
    setMsgs((prev) => {
      // Keyed by id and sorted by seq, so the list stays deduped and ordered
      // however the merge arrives. `gone` carries the last half hour of hides,
      // which is how a moderator's hide leaves an already-open panel.
      const byId = new Map((isCold ? [] : prev).map((m) => [m.id, m]));
      for (const m of d.messages ?? []) byId.set(m.id, m);
      for (const id of gone) byId.delete(id);
      return [...byId.values()].sort((a, b) => a.seq - b.seq).slice(-120);
    });

    if (d.messages?.length) {
      sinceRef.current = Math.max(sinceRef.current, ...d.messages.map((m) => m.seq));
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick(cold = false) {
      if (stopped) return;
      if (typeof document !== "undefined" && document.hidden) return schedule();
      ticksRef.current += 1;
      const resync = cold || ticksRef.current % 60 === 0;
      try { await refresh(resync); } catch { /* offline — the next tick retries */ }
      schedule();
    }
    function schedule() {
      if (stopped) return;
      timer = setTimeout(tick, open ? POLL_OPEN_MS : POLL_IDLE_MS);
    }

    // Opening the panel is a cold pass, so the reader always sees the room as
    // it stands rather than whatever this tab happened to accumulate.
    tick(open);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [open, refresh]);

  // Autoscroll while the reader sits at the bottom; leave them be if they scrolled up.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !pinnedRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs, open, step]);

  // Reading the panel is what marks messages seen. The launcher never does.
  useEffect(() => {
    if (open && msgs.length) markSeen(msgs[msgs.length - 1].seq);
  }, [open, msgs, markSeen]);

  const unread = msgs.filter((m) => m.seq > seenSeq && m.userId !== me?.id).length;

  const reactionsFor = useMemo(() => {
    const map = new Map<string, Tally[]>();
    for (const r of tallies) {
      const list = map.get(r.messageId) ?? [];
      list.push(r);
      map.set(r.messageId, list);
    }
    for (const list of map.values()) list.sort((a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji));
    return map;
  }, [tallies]);

  // ── Gate ───────────────────────────────────────────────────────────────────
  /** Sends an unverified visitor into the email step, remembering what they wanted. */
  const gate = useCallback((action: Pending) => {
    setPending(action);
    setStep("email");
    setNote("");
    setPickerFor(null);
    setMenuFor(null);
  }, []);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setNote("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setNote(t("Enter a valid email address.", "Ingresa un email válido."));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setNote((d as { error?: string }).error ?? t("Couldn't send the code.", "No se pudo enviar el código."));
      } else {
        setStep("code");
        setNote(t("Code sent — check your inbox.", "Código enviado — revisa tu inbox."));
      }
    } catch {
      setNote(t("Network error — try again.", "Error de conexión — intenta de nuevo."));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e?: React.FormEvent) {
    e?.preventDefault();
    setNote("");
    if (!/^\d{6}$/.test(code.trim())) {
      setNote(t("Enter the 6-digit code.", "Ingresa el código de 6 dígitos."));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/email-code/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim(), subscribe }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote((d as { error?: string }).error ?? t("That code didn't work.", "Ese código no funcionó."));
        return;
      }
      const u = (d as { user?: { id: string; displayName: string | null } }).user;
      setMe(u ? { ...u, canSend: true, canModerate: false } : null);
      setStep("chat");
      setCode("");
      setNote(t("You're in. Say hi 👋", "¡Ya estás! Saluda 👋"));
      setTimeout(() => setNote(""), 4000);

      // Replay whatever they were reaching for when we interrupted them.
      const p = pending;
      setPending(null);
      if (p?.kind === "react") await react(p.messageId, p.emoji, true);
      if (p?.kind === "send") { setDraft(p.body); inputRef.current?.focus(); }
    } catch {
      setNote(t("Network error — try again.", "Error de conexión — intenta de nuevo."));
    } finally {
      setBusy(false);
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function send(text?: string) {
    const body = (text ?? draft).trim();
    if (!body || busy) return;
    if (!me?.canSend) return gate({ kind: "send", body });

    setBusy(true);
    setNote("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = (d as { error?: string }).error;
        if (err === "auth_required" || err === "verify_required") return gate({ kind: "send", body });
        setNote((d as { message?: string }).message ?? t("Couldn't send.", "No se pudo enviar."));
        return;
      }
      setDraft("");
      setHasSent(true);
      setEmojiOpen(false);
      pinnedRef.current = true;
      const m = (d as { message?: Msg }).message;
      if (m) {
        setMsgs((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m].slice(-120)));
        sinceRef.current = Math.max(sinceRef.current, m.seq);
      }
    } catch {
      setNote(t("Network error — try again.", "Error de conexión — intenta de nuevo."));
    } finally {
      setBusy(false);
    }
  }

  async function react(messageId: string, emoji: string, skipGate = false) {
    if (!skipGate && !me?.canSend) return gate({ kind: "react", messageId, emoji });
    setPickerFor(null);

    // Optimistic, so a tap feels instant; the next poll is the source of truth.
    setTallies((prev) => {
      const i = prev.findIndex((r) => r.messageId === messageId && r.emoji === emoji);
      if (i === -1) return [...prev, { messageId, emoji, count: 1, mine: true }];
      const row = prev[i];
      const next = row.mine
        ? { ...row, count: Math.max(0, row.count - 1), mine: false }
        : { ...row, count: row.count + 1, mine: true };
      const out = [...prev];
      if (next.count === 0) out.splice(i, 1);
      else out[i] = next;
      return out;
    });

    try {
      const res = await fetch("/api/chat/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const err = (d as { error?: string }).error;
        if (err === "auth_required" || err === "verify_required") return gate({ kind: "react", messageId, emoji });
        setNote((d as { message?: string }).message ?? t("Couldn't react.", "No se pudo reaccionar."));
      }
      await refresh();
    } catch { /* the next poll reconciles */ }
  }

  async function report(messageId: string, reason: string) {
    setMenuFor(null);
    if (!me?.canSend) return gate({ kind: "react", messageId, emoji: "💜" });
    try {
      const res = await fetch("/api/chat/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, reason }),
      });
      const d = await res.json().catch(() => ({}));
      setNote((d as { message?: string }).message ?? t("Thanks for flagging.", "Gracias por reportarlo."));
      setTimeout(() => setNote(""), 5000);
      await refresh();
    } catch {
      setNote(t("Couldn't send the report.", "No se pudo enviar el reporte."));
    }
  }

  async function hide(messageId: string) {
    setMenuFor(null);
    try {
      await fetch(`/api/chat/messages?id=${encodeURIComponent(messageId)}`, { method: "DELETE" });
      setMsgs((prev) => prev.filter((m) => m.id !== messageId));
      setNote(t("Message hidden.", "Mensaje oculto."));
      setTimeout(() => setNote(""), 4000);
    } catch {
      setNote(t("Couldn't hide it.", "No se pudo ocultar."));
    }
  }

  // Keep the admin console clear of a floating panel.
  if (pathname?.startsWith("/admin")) return null;

  const presenceLine =
    present > 1
      ? t(`${present} fans here now`, `${present} fans aquí ahora`)
      : t("Be the first one in", "Sé la primera en entrar");

  // ── Launcher: no history, ever ─────────────────────────────────────────────
  if (!open) {
    if (launcher === "mini") {
      return (
        <div className="aa-chat-root">
          <button
            type="button"
            className="aa-chat-mini"
            onClick={() => setOpen(true)}
            aria-label={t("Open the live chat", "Abrir el chat en vivo")}
          >
            <Image src="/images/aegyo-mark.png" alt="" width={28} height={28} />
            {unread > 0 && <span className="aa-chat-badge">{unread > 9 ? "9+" : unread}</span>}
          </button>
        </div>
      );
    }
    return (
      <div className="aa-chat-root">
        <div className="aa-chat-pill">
          <button
            type="button"
            className="aa-chat-pill-main"
            onClick={() => setOpen(true)}
            aria-label={t("Open the live chat", "Abrir el chat en vivo")}
          >
            <span className="aa-chat-ava">
              <Image src="/images/aegyo-mark.png" alt="" width={34} height={34} />
            </span>
            <span className="aa-chat-pill-text">
              <span className="aa-chat-pill-title">{t("Arena Live Chat", "Chat en Vivo")}</span>
              <span className="aa-chat-pill-sub">
                <span className="aa-chat-dot" aria-hidden />
                {presenceLine}
              </span>
            </span>
            {unread > 0 && <span className="aa-chat-badge aa-chat-badge-inline">{unread > 9 ? "9+" : unread}</span>}
          </button>
          <button
            type="button"
            className="aa-chat-pill-x"
            onClick={() => persistLauncher("mini")}
            aria-label={t("Minimise the chat launcher", "Minimizar el lanzador del chat")}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ── Panel ──────────────────────────────────────────────────────────────────
  const joining = step !== "chat";
  const showChips = !joining && !hasSent && draft.trim() === "";

  return (
    <div className="aa-chat-root aa-chat-root-open">
      <section className="aa-chat-panel" aria-label={t("Live chat", "Chat en vivo")}>
        <header className="aa-chat-head">
          <span className="aa-chat-ava aa-chat-ava-lg">
            <Image src="/images/aegyo-mark.png" alt="" width={40} height={40} />
          </span>
          <div className="aa-chat-head-text">
            <div className="aa-chat-head-title">{t("Arena Live Chat", "Chat en Vivo")}</div>
            <div className="aa-chat-head-sub">
              <span className="aa-chat-dot" aria-hidden />
              {presenceLine}
            </div>
          </div>
          <button
            type="button"
            className="aa-chat-head-x"
            onClick={() => setOpen(false)}
            aria-label={t("Close chat", "Cerrar chat")}
          >
            ✕
          </button>
        </header>

        <div
          className="aa-chat-history"
          ref={listRef}
          role="log"
          aria-live="polite"
          onScroll={(e) => {
            const el = e.currentTarget;
            pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          }}
        >
          <div className="aa-chat-intro">
            <span className="aa-chat-ava aa-chat-ava-xl">
              <Image src="/images/aegyo-mark.png" alt="" width={56} height={56} />
            </span>
            <div className="aa-chat-intro-title">{t("Arena Live Chat", "Chat en Vivo")}</div>
            <p className="aa-chat-intro-sub">
              {t(
                "One room, every fandom. Hype each other up — no dragging people.",
                "Una sala, todos los fandoms. Anímense entre ustedes, sin arrastrar a nadie.",
              )}
            </p>
          </div>

          {msgs.map((m, i) => {
            const prev = msgs[i - 1];
            const next = msgs[i + 1];
            const startsGroup = !prev || prev.userId !== m.userId;
            const endsGroup = !next || next.userId !== m.userId;
            const mine = m.userId === me?.id;
            const rs = reactionsFor.get(m.id) ?? [];
            return (
              <div key={m.id} className={`aa-chat-row ${mine ? "aa-chat-row-mine" : ""}`}>
                {startsGroup && !mine && (
                  <div className="aa-chat-author" style={{ color: hueFor(m.userId) }}>
                    {m.authorName}
                  </div>
                )}
                <div className="aa-chat-bubble-wrap">
                  <div className={`aa-chat-bubble ${mine ? "aa-chat-bubble-mine" : ""}`}>
                    <span className="aa-chat-text">{m.body}</span>
                    {endsGroup && <span className="aa-chat-time">{clockOf(m.createdAt)}</span>}
                  </div>
                  <div className="aa-chat-tools">
                    <button
                      type="button"
                      className="aa-chat-tool"
                      onClick={() => setPickerFor(pickerFor === m.id ? null : m.id)}
                      aria-label={t("React to this message", "Reaccionar a este mensaje")}
                    >
                      ☺
                    </button>
                    <button
                      type="button"
                      className="aa-chat-tool"
                      onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}
                      aria-label={t("More options", "Más opciones")}
                    >
                      ⋯
                    </button>
                  </div>
                </div>

                {rs.length > 0 && (
                  <div className="aa-chat-reacts">
                    {rs.map((r) => (
                      <button
                        key={r.emoji}
                        type="button"
                        className={`aa-chat-react ${r.mine ? "aa-chat-react-mine" : ""}`}
                        onClick={() => react(m.id, r.emoji)}
                      >
                        <span aria-hidden>{r.emoji}</span>
                        <span className="aa-chat-react-n">{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {pickerFor === m.id && (
                  <div className="aa-chat-picker" role="group" aria-label={t("Pick a reaction", "Elige una reacción")}>
                    {REACTIONS.map((e) => (
                      <button key={e} type="button" className="aa-chat-picker-btn" onClick={() => react(m.id, e)}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                {menuFor === m.id && (
                  <div className="aa-chat-menu" role="menu">
                    <div className="aa-chat-menu-head">{t("Report this message", "Reportar este mensaje")}</div>
                    {REPORT_REASONS.map((r) => (
                      <button key={r.value} type="button" className="aa-chat-menu-item" onClick={() => report(m.id, r.value)}>
                        {t(r.en, r.es)}
                      </button>
                    ))}
                    {me?.canModerate && (
                      <button type="button" className="aa-chat-menu-item aa-chat-menu-mod" onClick={() => hide(m.id)}>
                        {t("Hide as moderator", "Ocultar como moderador")}
                      </button>
                    )}
                    <button type="button" className="aa-chat-menu-item aa-chat-menu-cancel" onClick={() => setMenuFor(null)}>
                      {t("Cancel", "Cancelar")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {note && <p className="aa-chat-note">{note}</p>}

        {/* Quick prompts: positive openers that give a first-timer something to
            say. They scroll in one row rather than stacking, so the history
            above them keeps its height. Tapping one loads the composer rather
            than posting, so nobody sends by accident. */}
        {showChips && (
          <div className="aa-chat-chips">
            {[
              { en: "💜 Who are you streaming today?", es: "💜 ¿A quién estás escuchando hoy?" },
              { en: "🔥 Best comeback this year?", es: "🔥 ¿Mejor comeback del año?" },
              { en: "✨ Recommend me a B-side", es: "✨ Recomiéndame un B-side" },
            ].map((c) => (
              <button
                key={c.en}
                type="button"
                className="aa-chat-chip"
                onClick={() => { setDraft(t(c.en, c.es)); inputRef.current?.focus(); }}
              >
                {t(c.en, c.es)}
              </button>
            ))}
          </div>
        )}

        {step === "email" ? (
          <form className="aa-chat-gate" onSubmit={requestCode}>
            <p className="aa-chat-gate-copy">
              {pending?.kind === "react"
                ? t("Verify your email to react.", "Verifica tu email para reaccionar.")
                : t("Verify your email to join the conversation.", "Verifica tu email para unirte a la conversación.")}
            </p>
            <div className="aa-chat-row-inline">
              <input
                className="aa-chat-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("you@email.com", "tu@email.com")}
                aria-label={t("Email address", "Correo electrónico")}
              />
              <button type="submit" className="aa-chat-go" disabled={busy} aria-label={t("Send code", "Enviar código")}>
                {busy ? "…" : "➤"}
              </button>
            </div>
            <label className="aa-chat-check">
              <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} />
              <span>{t("Also send me the K-pop newsletter", "También quiero el newsletter de K-pop")}</span>
            </label>
            <button type="button" className="aa-chat-link" onClick={() => { setStep("chat"); setPending(null); setNote(""); }}>
              {t("Just reading, thanks", "Solo estoy leyendo, gracias")}
            </button>
          </form>
        ) : step === "code" ? (
          <form className="aa-chat-gate" onSubmit={verifyCode}>
            <p className="aa-chat-gate-copy">
              {t(`Enter the 6-digit code sent to ${email}.`, `Ingresa el código de 6 dígitos enviado a ${email}.`)}
            </p>
            <div className="aa-chat-row-inline">
              <input
                className="aa-chat-input aa-chat-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                aria-label={t("Verification code", "Código de verificación")}
              />
              <button type="submit" className="aa-chat-go" disabled={busy} aria-label={t("Verify", "Verificar")}>
                {busy ? "…" : "➤"}
              </button>
            </div>
            <button type="button" className="aa-chat-link" onClick={() => { setStep("email"); setCode(""); setNote(""); }}>
              {t("Use a different email", "Usar otro email")}
            </button>
          </form>
        ) : (
          <>
            {emojiOpen && (
              <div className="aa-chat-emoji-strip">
                {COMPOSER_EMOJI.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className="aa-chat-picker-btn"
                    onClick={() => { setDraft((d) => (d + e).slice(0, MAX_LEN)); inputRef.current?.focus(); }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
            <form className="aa-chat-compose" onSubmit={(e) => { e.preventDefault(); void send(); }}>
              <button
                type="button"
                className="aa-chat-emoji-btn"
                onClick={() => setEmojiOpen((v) => !v)}
                aria-label={t("Add an emoji", "Añadir un emoji")}
                aria-expanded={emojiOpen}
              >
                ☺
              </button>
              <input
                ref={inputRef}
                className="aa-chat-input aa-chat-input-flat"
                value={draft}
                maxLength={MAX_LEN}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("Message the arena…", "Escribe en la arena…")}
                aria-label={t("Your message", "Tu mensaje")}
              />
              <button type="submit" className="aa-chat-go" disabled={busy || !draft.trim()} aria-label={t("Send", "Enviar")}>
                ➤
              </button>
            </form>
            <p className="aa-chat-foot">
              {t(
                "Public room, moderated. Report anything cruel and it goes fast.",
                "Sala pública, moderada. Reporta cualquier crueldad y desaparece rápido.",
              )}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
