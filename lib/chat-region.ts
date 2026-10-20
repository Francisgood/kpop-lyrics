// Shared policy for API enforcement and UI. Unknown countries are allowed (Oct 20 decision).
const hiddenCountries = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB",
]);

// Read-only view for the mobile contract test; the app mirrors this list.
export const chatHiddenCountries: ReadonlySet<string> = hiddenCountries;

export function showChatForCountry(country: unknown): boolean {
  return !(typeof country === "string" && hiddenCountries.has(country.toUpperCase()));
}
