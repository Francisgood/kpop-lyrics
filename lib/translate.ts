/**
 * Translation utility — converts text to English using Claude Haiku.
 * Requires ANTHROPIC_API_KEY in environment.
 *
 * - Returns original text unchanged if the API key is missing or the call fails.
 * - Skips translation for short ASCII-only strings (already English).
 * - Uses Claude Haiku for minimal latency + cost.
 */

/** Returns true if the text is very likely already plain English (ASCII-only, no CJK/extended chars). */
function looksLikeEnglish(text: string): boolean {
  // If >85% of characters are plain ASCII printable, treat as English
  const ascii = (text.match(/[\x20-\x7E]/g) ?? []).length;
  return ascii / text.length > 0.85;
}

export async function translateToEnglish(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  // Skip if already looks English
  if (looksLikeEnglish(trimmed)) return text;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return text; // graceful degradation — no key, pass through

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content:
              "Translate the following text to English. " +
              "Return ONLY the translated text — no preamble, no quotes, no explanation. " +
              "If the text is already in English, return it exactly as-is.\n\n" +
              trimmed,
          },
        ],
      }),
    });

    if (!res.ok) return text; // API error — return original

    const data = (await res.json()) as {
      content?: Array<{ type: string; text: string }>;
    };
    const translated = data.content?.[0]?.text?.trim();
    return translated || text;
  } catch {
    return text; // Network failure — return original
  }
}
