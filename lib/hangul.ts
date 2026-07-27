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
