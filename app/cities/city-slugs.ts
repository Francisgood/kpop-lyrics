// Slug set for cross-linking contributor cities → city guides (used by the profile
// and annotation pages). Kept in a non-route module because Next.js only permits
// specific named exports from a page.tsx file. Keep in sync with CITIES in ./page.tsx.
export const CITY_SLUG_SET = new Set<string>([
  "new-york", "los-angeles", "chicago", "dallas", "tampa", "boston", "scottsdale", "toronto",
  "mexico-city", "guadalajara", "monterrey", "puebla", "tijuana", "chihuahua", "sao-paulo",
  "rio-de-janeiro", "buenos-aires", "santiago", "bogota", "medellin", "london", "paris",
  "madrid", "milan", "seoul", "tokyo", "bangkok", "manila", "kuala-lumpur", "shanghai",
  "dubai", "melbourne", "sydney",
]);
