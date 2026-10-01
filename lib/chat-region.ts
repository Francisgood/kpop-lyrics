// This only controls whether the chat UI is shown. It is not access control.
const hiddenCountries = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB",
]);

export function showChatForCountry(country: unknown): boolean {
  return typeof country === "string" && /^[A-Z]{2}$/.test(country) && !hiddenCountries.has(country);
}
