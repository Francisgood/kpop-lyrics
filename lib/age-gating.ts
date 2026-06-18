// Age-gating config for the (future) Culture Vulture creator-upload feature.
//
// User uploads will be gated: a creator must verify their age + identity via didit.me
// (ID verification + biometric liveness) through an email-prompted flow before they can
// post. Aegyo Arena's baseline policy is 18+ for user-generated video uploads. The
// per-country `digitalConsentAge` below is the statutory minimum age at which a person
// can give valid data-processing consent on their own (the "COPPA-equivalent" threshold)
// — provided here so the upload gate can be tuned per market by legal/product.
//
// NOTE: not legal advice. These values are an engineering starting point and MUST be
// reviewed by counsel before the upload feature ships. Sources are each country's main
// data-protection statute / regulator guidance.

export type CountryAge = {
  code: string;        // ISO 3166-1 alpha-2
  name: string;
  digitalConsentAge: number; // minimum age to self-consent to data processing
  majority: number;          // legal age of majority
  law: string;
};

export const TARGET_COUNTRIES: CountryAge[] = [
  { code: "MX", name: "Mexico",        digitalConsentAge: 18, majority: 18, law: "LFPDPPP (minors via parental consent)" },
  { code: "BR", name: "Brazil",        digitalConsentAge: 12, majority: 18, law: "LGPD (under-12 = child, parental consent)" },
  { code: "CO", name: "Colombia",      digitalConsentAge: 18, majority: 18, law: "Ley 1581 (minors' data, special protection)" },
  { code: "US", name: "United States", digitalConsentAge: 13, majority: 18, law: "COPPA (parental consent under 13)" },
  { code: "CA", name: "Canada",        digitalConsentAge: 13, majority: 18, law: "PIPEDA (meaningful consent; ~13 guidance)" },
  { code: "PT", name: "Portugal",      digitalConsentAge: 13, majority: 18, law: "GDPR Art.8 (PT set 13)" },
  { code: "FR", name: "France",        digitalConsentAge: 15, majority: 18, law: "GDPR Art.8 (FR set 15)" },
  { code: "EG", name: "Egypt",         digitalConsentAge: 18, majority: 21, law: "PDPL 151/2020 (guardian consent for minors)" },
  { code: "MA", name: "Morocco",       digitalConsentAge: 18, majority: 18, law: "Law 09-08 (guardian consent for minors)" },
  { code: "ZA", name: "South Africa",  digitalConsentAge: 18, majority: 18, law: "POPIA (child = under 18, parental consent)" },
  { code: "KE", name: "Kenya",         digitalConsentAge: 18, majority: 18, law: "Data Protection Act 2019 (child under 18)" },
  { code: "NG", name: "Nigeria",       digitalConsentAge: 18, majority: 18, law: "NDPA 2023 (child under 18)" },
  { code: "ID", name: "Indonesia",     digitalConsentAge: 17, majority: 17, law: "PDP Law 27/2022 (child consent via guardian)" },
  { code: "PH", name: "Philippines",   digitalConsentAge: 18, majority: 18, law: "Data Privacy Act 2012 (minors via guardian)" },
  { code: "TH", name: "Thailand",      digitalConsentAge: 20, majority: 20, law: "PDPA (minor consent; majority 20)" },
  { code: "MY", name: "Malaysia",      digitalConsentAge: 18, majority: 18, law: "PDPA 2010 (minor under 18)" },
  { code: "CN", name: "China",         digitalConsentAge: 14, majority: 18, law: "PIPL (under-14 data = sensitive, guardian consent)" },
  { code: "SG", name: "Singapore",     digitalConsentAge: 13, majority: 21, law: "PDPA (PDPC guidance ~13 to self-consent)" },
  { code: "AU", name: "Australia",     digitalConsentAge: 15, majority: 18, law: "Privacy Act (OAIC guidance ~15)" },
  { code: "NZ", name: "New Zealand",   digitalConsentAge: 16, majority: 18, law: "Privacy Act 2020 (~16 guidance)" },
];

// Baseline policy: 18+ for creator video uploads. Never gate BELOW the local statutory
// minimum; the country data lets legal raise/lower the gate per market later.
export const DEFAULT_UPLOAD_MIN_AGE = 18;

export function uploadMinAge(countryCode?: string): number {
  const c = TARGET_COUNTRIES.find((x) => x.code === (countryCode ?? "").toUpperCase());
  // Default 18; if a market's statutory minimum is somehow higher (e.g., Thailand majority 20), respect it.
  return Math.max(DEFAULT_UPLOAD_MIN_AGE, c?.majority ?? 0);
}

export function isTargetCountry(countryCode?: string): boolean {
  return TARGET_COUNTRIES.some((x) => x.code === (countryCode ?? "").toUpperCase());
}
