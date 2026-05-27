"use client";

interface Props {
  activeLetters: string[]; // letters that have at least one artist
}

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function ArtistsAlphaIndex({ activeLetters }: Props) {
  const active = new Set(activeLetters);

  function scrollTo(letter: string) {
    const el = document.getElementById(`az-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Artist A–Z index"
      style={{
        position:   "fixed",
        right:      12,
        top:        "50%",
        transform:  "translateY(-50%)",
        zIndex:     50,
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        gap:        1,
        userSelect: "none",
      }}
    >
      {ALL_LETTERS.map((letter) => {
        const isActive = active.has(letter);
        return (
          <button
            key={letter}
            onClick={() => isActive && scrollTo(letter)}
            aria-label={`Jump to ${letter}`}
            aria-disabled={!isActive}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              width:          20,
              height:         18,
              background:     "transparent",
              border:         "none",
              borderRadius:   3,
              fontSize:       "0.6rem",
              fontWeight:     800,
              fontFamily:     "monospace",
              letterSpacing:  "0.05em",
              cursor:         isActive ? "pointer" : "default",
              color:          isActive ? "#111" : "#ccc",
              transition:     "background 0.1s, color 0.1s",
              padding:        0,
              lineHeight:     1,
            }}
            onMouseEnter={(e) => {
              if (isActive) {
                e.currentTarget.style.background = "var(--genius-yellow)";
                e.currentTarget.style.color = "#000";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = isActive ? "#111" : "#ccc";
            }}
          >
            {letter}
          </button>
        );
      })}
    </nav>
  );
}
