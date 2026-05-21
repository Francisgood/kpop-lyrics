"use client";
import { useState, useEffect, useCallback } from "react";

// ── Quiz data ─────────────────────────────────────────────────────────────────

type Question = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Category = {
  id: string;
  label: string;
  emoji: string;
  accent: string;
  questions: Question[];
};

const CATEGORIES: Category[] = [
  {
    id: "slang",
    label: "K-pop Dictionary",
    emoji: "📖",
    accent: "#FFD700",
    questions: [
      {
        q: "What does 'bias wrecker' mean in K-pop fandom?",
        options: [
          "Your absolute favourite member in a group",
          "A member who keeps threatening to replace your bias",
          "An obsessive fan who follows idols everywhere",
          "A blogger who writes negative reviews of idols",
        ],
        answer: 1,
        explanation: "A bias wrecker is a member you didn't choose, but who constantly steals your attention — 'wrecking' your loyalty to your actual bias.",
      },
      {
        q: "A K-pop 'comeback' refers to...",
        options: [
          "A disbanded group permanently reuniting",
          "A group returning from a world tour",
          "Any new music release after a period of absence",
          "An idol returning from mandatory military service",
        ],
        answer: 2,
        explanation: "In K-pop, even a group releasing music just weeks after their last release calls it a 'comeback' — it's any new promotional cycle.",
      },
      {
        q: "'Daesang' (대상) at K-pop award shows means...",
        options: [
          "Best Choreography award",
          "Best Music Video award",
          "A special debut award",
          "The Grand Prize — the highest honour in K-pop",
        ],
        answer: 3,
        explanation: "Daesang (大賞) translates literally as 'grand prize' — winning one at MAMA or Melon Music Awards is the peak achievement in K-pop.",
      },
      {
        q: "The 'maknae' of a group is...",
        options: [
          "The leader who handles all press interviews",
          "The main dancer with the most fancam views",
          "The youngest member, often doted on by the group",
          "The member who writes all original songs",
        ],
        answer: 2,
        explanation: "막내 (maknae) means the youngest person. In idol groups, the maknae is often treated like the group's baby — babied by senior members and beloved by fans.",
      },
      {
        q: "A 'fancam' is...",
        options: [
          "A crowd-sourced voting app for idol polls",
          "An official fan club membership card",
          "A video focused on one specific member during a group performance",
          "The camera rig used during music video shoots",
        ],
        answer: 2,
        explanation: "Fancams track a single member throughout an entire performance. Lisa's MAMA 2019 fancam passed 400 million views — a record that helped introduce many fans to K-pop.",
      },
    ],
  },
  {
    id: "artist",
    label: "Artist Facts",
    emoji: "🎤",
    accent: "#FF6B9D",
    questions: [
      {
        q: "Lisa founded her own entertainment label in January 2024. What is it called?",
        options: ["Manoban Music", "Bangkok Records", "Lloud", "LALI Entertainment"],
        answer: 2,
        explanation: "Lloud Co., Ltd. is Lisa's independent label, backed by a global distribution deal with RCA Records (Sony Music) — making her the first K-pop idol of her generation to own her own company.",
      },
      {
        q: "How many members does SEVENTEEN have?",
        options: ["7", "9", "11", "13"],
        answer: 3,
        explanation: "SEVENTEEN has 13 members — hence the name '13 + teen'. They're split into three units: Hip-Hop, Vocal, and Performance.",
      },
      {
        q: "aespa's groundbreaking concept involves each member having...",
        options: [
          "A real-life twin who performs as a body double",
          "A virtual AI counterpart called an 'æ'",
          "A solo alter ego with a different stage name",
          "A holographic avatar used on stage",
        ],
        answer: 1,
        explanation: "Each aespa member has an 'æ' — a virtual AI version of themselves living in the digital world called KWANGYA. This dual-world concept is central to the SMCU (SM Culture Universe) lore.",
      },
      {
        q: "Which group was formed through the 2020 survival show 'I-Land'?",
        options: ["TXT", "Stray Kids", "ENHYPEN", "Zerobaseone"],
        answer: 2,
        explanation: "ENHYPEN was formed through 'I-Land', co-produced by HYBE and CJ ENM. Their vampire-inspired debut concept and coming-of-age themes quickly earned them a massive global fanbase.",
      },
      {
        q: "Which BLACKPINK member debuted as a solo artist first?",
        options: ["Jisoo", "Rosé", "Jennie", "Lisa"],
        answer: 2,
        explanation: "Jennie released 'SOLO' in November 2018, making her the first BLACKPINK member to go solo. The track topped Korean charts and announced her as a formidable solo force.",
      },
    ],
  },
  {
    id: "mukbang",
    label: "Mukbang & Food",
    emoji: "🍜",
    accent: "#FF6B35",
    questions: [
      {
        q: "Which BTS member is universally known as the group's biggest eater and the unofficial king of idol mukbang?",
        options: [
          "RM — he stress-eats before studio sessions",
          "Jin — earned the nickname 'Worldwide Handsome Eater'",
          "V — he eats black bean noodles every single day",
          "Jungkook — documented eating 3 full meals before sunrise",
        ],
        answer: 1,
        explanation: "Jin (Kim Seokjin) is BTS's legendary eater — nicknamed for his theatrical food reactions and ability to finish everyone else's leftovers. His mukbang content on Weverse consistently goes viral. He once ate an entire convenience store haul live on camera.",
      },
      {
        q: "In IVE's 'I AM' music video, Wonyoung is seen eating which iconic Korean street food that sent fans into a frenzy of fan cams?",
        options: [
          "Tteokbokki (spicy rice cakes)",
          "Hotteok (sweet pancake)",
          "Bungeoppang (fish-shaped pastry)",
          "Corn Dog (gamja hot dog)",
        ],
        answer: 2,
        explanation: "Bungeoppang — the fish-shaped red bean pastry — became a Wonyoung meme after she was spotted eating one on a winter schedule. Fans recreated photos holding bungeoppang trying to 'match her vibe.' The pastry briefly sold out near Starship Entertainment.",
      },
      {
        q: "Lisa went viral for her authentic Thai food content. Which dish does she consistently rank as her absolute comfort food from home?",
        options: [
          "Pad Thai — she calls it 'the standard'",
          "Som Tum (green papaya salad) — she claims it cures everything",
          "Khao Man Gai (chicken rice) — reminds her of her mum",
          "Mango sticky rice — she ships it to Paris on weekends",
        ],
        answer: 1,
        explanation: "Som Tum (ส้มตำ) — Thai green papaya salad — is Lisa's documented comfort food. In interviews she's said it's the first thing she craves when she misses Bangkok. She's been photographed at Thai restaurants in Seoul ordering it regardless of the season.",
      },
      {
        q: "The Korean word '먹방' (mukbang) is a portmanteau of which two Korean words?",
        options: [
          "먹다 (meokda, to eat) + 방송 (bangsong, broadcast)",
          "먹거리 (meokgeori, food) + 방문 (bangmun, visit)",
          "맛있다 (masitda, delicious) + 방 (bang, room)",
          "먹다 (meokda, to eat) + 방탄 (bangtan, bulletproof)",
        ],
        answer: 0,
        explanation: "먹방 = 먹다 (to eat) + 방송 (broadcast). The format originated in South Korea around 2010 and exploded globally through streaming platforms. K-pop idols doing mukbangs became a staple fan service genre — combining parasocial closeness with the deeply social Korean food culture.",
      },
      {
        q: "BLACKPINK's '24/365 with BLACKPINK' YouTube series featured the members eating together. Which member became an unexpected fan favourite for her dramatic food reactions?",
        options: [
          "Jennie — her 'it's giving main character energy' food takes",
          "Jisoo — her kimchi jjigae obsession became a running joke",
          "Rosé — her tiny bites vs enormous portions became iconic",
          "Lisa — she turned every meal into a dance performance",
        ],
        answer: 1,
        explanation: "Jisoo's kimchi jjigae obsession became a fan-beloved running joke throughout the series. She consistently ranked it above anything else, defended it passionately against other food opinions, and BLINKs began sending kimchi jjigae food trucks to BLACKPINK shoots in tribute.",
      },
    ],
  },
  {
    id: "lyrics",
    label: "Lyrics Challenge",
    emoji: "🎵",
    accent: "#4ECDC4",
    questions: [
      {
        q: "'내 독이 퍼지게 해줘' from BLACKPINK's Pink Venom translates to...",
        options: [
          "\"Let my love bloom everywhere\"",
          "\"Let my music play on\"",
          "\"Let my venom spread\"",
          "\"Let my tears fall free\"",
        ],
        answer: 2,
        explanation: "독 (dok) means venom or poison. BLACKPINK's 'Pink Venom' is built on the flower-with-thorns metaphor — beautiful but dangerous.",
      },
      {
        q: "Which song contains '나는 나야' (naneun naya — \"I am myself\")?",
        options: [
          "MONEY by Lisa",
          "LALISA by Lisa",
          "NEW WOMAN by Lisa feat. Rosalía",
          "ROCKSTAR by Lisa",
        ],
        answer: 1,
        explanation: "'나는 나야' closes LALISA, Lisa's debut single. It became a fan anthem — a manifesto of self-identity after years of being shaped by an entertainment system.",
      },
      {
        q: "'방콕에서 여기까지' (From Bangkok to here) appears in which song?",
        options: ["MONEY", "ROCKSTAR", "LALISA", "BORN AGAIN"],
        answer: 2,
        explanation: "LALISA is Lisa's autobiographical debut track. The line 'from Bangkok to here' traces her journey from Thailand to Seoul at 13, alone, to train at YG Entertainment.",
      },
      {
        q: "Complete this BTS Dynamite lyric: 'Shining through, I light up when ___'",
        options: [
          "\"...the night falls down\"",
          "\"...you call my name\"",
          "\"...ARMY calls for me\"",
          "\"...the stars align\"",
        ],
        answer: 1,
        explanation: "'Shining through, I light up when you call my name' — Dynamite was BTS's first all-English track and their first song to debut at #1 on the Billboard Hot 100.",
      },
      {
        q: "'심장이 자꾸 뛰어' (My heart keeps racing) is a lyric from...",
        options: [
          "Boy With Luv — BTS",
          "Hype Boy — NewJeans",
          "FANCY — TWICE",
          "Next Level — aespa",
        ],
        answer: 1,
        explanation: "From NewJeans' 'Hype Boy' — '나 요즘 왜 이러지 / 심장이 자꾸 뛰어' (Why am I like this lately / My heart keeps racing). The song became a massive all-kill on debut.",
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

type Phase = "pick" | "quiz" | "result";

interface QuizModalProps {
  onClose: () => void;
}

export default function QuizModal({ onClose }: QuizModalProps) {
  const [phase, setPhase]           = useState<Phase>("pick");
  const [category, setCategory]     = useState<Category | null>(null);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState<number | null>(null);
  const [confirmed, setConfirmed]   = useState(false);
  const [score, setScore]           = useState(0);

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function startCategory(cat: Category) {
    setCategory(cat);
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setPhase("quiz");
  }

  function handleSelect(i: number) {
    if (confirmed) return;
    setSelected(i);
  }

  function handleConfirm() {
    if (selected === null || !category) return;
    if (selected === category.questions[qIndex].answer) {
      setScore(s => s + 1);
    }
    setConfirmed(true);
  }

  function handleNext() {
    if (!category) return;
    if (qIndex + 1 < category.questions.length) {
      setQIndex(i => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setPhase("result");
    }
  }

  function handleRestart() {
    setPhase("pick");
    setCategory(null);
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
  }

  const questions = category?.questions ?? [];
  const current   = questions[qIndex];
  const accent    = category?.accent ?? "var(--genius-yellow)";
  const total     = questions.length;
  const pct       = Math.round((score / total) * 100);

  const resultEmoji =
    pct === 100 ? "🏆" :
    pct >= 80   ? "🌟" :
    pct >= 60   ? "👏" :
    pct >= 40   ? "📖" : "💪";

  const resultMsg =
    pct === 100 ? "Perfect score! You're a certified K-pop expert." :
    pct >= 80   ? "Impressive! You really know your K-pop." :
    pct >= 60   ? "Nice! You've got solid fandom knowledge." :
    pct >= 40   ? "Keep exploring — the K-pop dictionary is waiting." :
    "Time to deep-dive into Aegyo Annotate!";

  // ── Shared overlay & panel styles ──────────────────────────────────────────

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px",
    overflowY: "auto",
  };

  const panel: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 560,
    maxHeight: "calc(100dvh - 32px)",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
  };

  const closeBtn: React.CSSProperties = {
    position: "absolute", top: 14, right: 14,
    background: "none", border: "none", cursor: "pointer",
    fontSize: "1.4rem", color: "#888", lineHeight: 1, zIndex: 1,
    padding: 4,
  };

  // ── Pick category ──────────────────────────────────────────────────────────

  if (phase === "pick") {
    return (
      <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={panel}>
          <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <div style={{ padding: "36px 32px 32px" }}>
            <div style={{ fontSize: "0.65rem", color: "var(--genius-yellow)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Aegyo Annotate</div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 8px" }}>K-pop Quiz</h2>
            <p style={{ color: "#777", fontSize: "0.88rem", marginBottom: 28 }}>
              5 questions · Pick a category to start
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => startCategory(cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: "#f8f8f8", border: "2px solid #eee",
                    borderRadius: 10, padding: "18px 20px",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = cat.accent; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#eee"; (e.currentTarget as HTMLButtonElement).style.background = "#f8f8f8"; }}
                >
                  <span style={{ fontSize: "2rem", flexShrink: 0 }}>{cat.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#000" }}>{cat.label}</div>
                    <div style={{ fontSize: "0.78rem", color: "#777", marginTop: 2 }}>{cat.questions.length} questions</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: "#ccc", fontSize: "1.2rem" }}>›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────

  if (phase === "quiz" && current) {
    return (
      <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={panel}>
          <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>

          {/* Progress bar */}
          <div style={{ height: 4, background: "#eee", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((qIndex) / total) * 100}%`, background: accent, transition: "width 0.3s" }} />
          </div>

          <div style={{ padding: "28px 28px 32px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: "1.4rem" }}>{category!.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#000" }}>{category!.label}</div>
                <div style={{ fontSize: "0.72rem", color: "#aaa" }}>Question {qIndex + 1} of {total}</div>
              </div>
              <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: "0.85rem", color: accent }}>
                {score}/{qIndex}
              </div>
            </div>

            {/* Question */}
            <div style={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 20, color: "#000" }}>
              {current.q}
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {current.options.map((opt, i) => {
                let bg = "#f8f8f8", border = "#eee", color = "#000";
                if (confirmed) {
                  if (i === current.answer)              { bg = "#e6f9f0"; border = "#22c55e"; color = "#15803d"; }
                  else if (i === selected && i !== current.answer) { bg = "#fef2f2"; border = "#ef4444"; color = "#b91c1c"; }
                } else if (i === selected) {
                  bg = "#fffbeb"; border = accent; color = "#000";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={confirmed}
                    style={{
                      background: bg, border: `2px solid ${border}`, borderRadius: 8,
                      padding: "14px 16px", textAlign: "left", cursor: confirmed ? "default" : "pointer",
                      fontWeight: 600, fontSize: "0.9rem", color, lineHeight: 1.4,
                      transition: "all 0.12s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: border === "#eee" ? "#e5e5e5" : border, color: confirmed && i === current.answer ? "#fff" : (border === "#eee" ? "#666" : "#fff"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>
                      {confirmed && i === current.answer ? "✓" : confirmed && i === selected && i !== current.answer ? "✕" : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {confirmed && (
              <div style={{ marginTop: 18, background: "#f9f9f9", borderLeft: `4px solid ${accent}`, borderRadius: "0 6px 6px 0", padding: "12px 16px", fontSize: "0.82rem", color: "#555", lineHeight: 1.6 }}>
                {current.explanation}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              {!confirmed ? (
                <button
                  onClick={handleConfirm}
                  disabled={selected === null}
                  style={{ flex: 1, background: selected === null ? "#e5e5e5" : accent, color: selected === null ? "#aaa" : "#000", border: "none", borderRadius: 8, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: selected === null ? "not-allowed" : "pointer", letterSpacing: "0.04em" }}
                >
                  CHECK ANSWER
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  style={{ flex: 1, background: accent, color: "#000", border: "none", borderRadius: 8, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", letterSpacing: "0.04em" }}
                >
                  {qIndex + 1 < total ? "NEXT QUESTION →" : "SEE RESULTS →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={panel}>
        <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div style={{ padding: "40px 32px 36px", textAlign: "center" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>{resultEmoji}</div>
          <div style={{ fontWeight: 800, fontSize: "2rem", marginBottom: 8 }}>
            {score} / {total}
          </div>
          <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: 999, transition: "width 0.6s ease" }} />
          </div>
          <p style={{ color: "#555", fontSize: "0.95rem", marginBottom: 28, lineHeight: 1.6 }}>{resultMsg}</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={handleRestart}
              style={{ background: accent, color: "#000", border: "none", borderRadius: 8, padding: "14px 24px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", letterSpacing: "0.04em" }}
            >
              TRY ANOTHER CATEGORY
            </button>
            <button
              onClick={onClose}
              style={{ background: "#f0f0f0", color: "#000", border: "none", borderRadius: 8, padding: "14px 24px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
            >
              Back to Site
            </button>
          </div>

          {/* Category breakdown */}
          <div style={{ marginTop: 28, textAlign: "left" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>Your answers</div>
            {questions.map((q, i) => {
              // We don't track per-question answers in result phase — show the score tally
              return null;
            })}
            <div style={{ fontSize: "0.82rem", color: "#777" }}>
              {score === total ? "Every answer correct — phenomenal!" : `${total - score} question${total - score !== 1 ? "s" : ""} to revisit. Check the K-pop Dictionary for help.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
