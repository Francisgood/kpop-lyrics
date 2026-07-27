// Pull the Korean (Hangul) form of a slang term out of its definition, so the
// deck can show it beneath the romanized term for reading practice.
//
// Author-written definitions on this site conventionally lead with the Hangul
// ("킹받다 — extremely annoyed …"); we also catch the common
// "Korean word (막내) meaning …" parenthetical near the start. Conservative by
// design: when unsure we return null — better no Hangul than the wrong Hangul.
// Terms with no confident match are back-filled from the SlangMedia.hangul column.

const H = "가-힣"; // Hangul syllable block

// Leading run of Hangul, up to the first separator (dash / colon / paren / comma / slash).
const LEAD = new RegExp(`^\\s*([${H}][${H}\\s·ㆍ]*?)\\s*(?:[—–\\-:(,./]|$)`);
// "... (막내) ..." style parenthetical.
const PAREN = new RegExp(`[（(]([${H}][${H}\\s·ㆍ]{0,9})[）)]`);

export function hangulFromDefinition(body: string | null | undefined): string | null {
  if (!body) return null;
  const lead = body.match(LEAD);
  if (lead && lead[1].trim()) return lead[1].trim();
  const paren = body.slice(0, 70).match(PAREN);
  if (paren) return paren[1].trim();
  return null;
}

// Revised-Romanization (syllable-literal) of a Hangul string, with syllables
// joined by "·" — a pronunciation hint under the Korean word for beginners
// (e.g., 킹받다 → "king·bat·da", 최애 → "choe·ae"). It maps each syllable block's
// initial/medial/final jamo to their standard romaji; it is a reading aid, not a
// full phonological transcription (no cross-syllable assimilation).
const CHO = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const JUNG = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const JONG = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];

export function romanizeHangul(input: string | null | undefined): string | null {
  if (!input) return null;
  const words = input
    .split(/\s+/)
    .map((word) => {
      const sylls: string[] = [];
      for (const ch of word) {
        const code = ch.codePointAt(0) ?? 0;
        if (code >= 0xac00 && code <= 0xd7a3) {
          const i = code - 0xac00;
          sylls.push(CHO[Math.floor(i / 588)] + JUNG[Math.floor((i % 588) / 28)] + JONG[i % 28]);
        }
        // skip non-Hangul (·, /, punctuation)
      }
      return sylls.join("·");
    })
    .filter(Boolean);
  return words.length ? words.join(" ") : null;
}
