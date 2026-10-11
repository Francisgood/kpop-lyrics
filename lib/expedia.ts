// ─────────────────────────────────────────────────────────────────────────────
// Expedia affiliate links.
//
// HOW THIS EARNS: Expedia pays on click-through attribution, not on a sitewide
// pixel. A visitor must click one of OUR tagged links, then book on Expedia
// within the cookie window. Nothing here can claim credit for a booking the
// visitor made on their own — no tag can.
//
// TO TURN IT ON: set EXPEDIA_AFFILIATE_ID below. While it is null every travel
// CTA on the site renders nothing, so no untagged traffic is sent to Expedia
// for free. That is the only switch — nothing else needs editing.
// ─────────────────────────────────────────────────────────────────────────────

export const EXPEDIA_AFFILIATE_ID: string | null = null;

// Expedia tags links differently depending on which programme you are approved
// into, so the wrapper is a template rather than a fixed shape. Confirm the
// exact one in the partner dashboard before setting the id above — the wrong
// wrapper still clicks through to Expedia but earns nothing, which is the
// failure mode worth avoiding because it looks like it works.
//
//   Partnerize (Vrbo / several Expedia points of sale):
//     https://prf.hn/click/camref:{id}/destination:{url}
//   Direct or CJ Affiliate:
//     {url}?affcid={id}
//
// {url} is the Expedia destination; in the Partnerize form it is URL-encoded.
export const EXPEDIA_LINK_TEMPLATE = "https://prf.hn/click/camref:{id}/destination:{url}";

export const affiliateEnabled = (): boolean => !!EXPEDIA_AFFILIATE_ID;

/** Expedia hotel search for a destination, optionally date-bounded. */
export function expediaHotelSearch(opts: {
  destination: string;
  checkIn?: string | Date | null;   // ISO date or Date; check-out defaults to +1 night
  nights?: number;
}): string | null {
  if (!EXPEDIA_AFFILIATE_ID) return null;

  const url = new URL("https://www.expedia.com/Hotel-Search");
  url.searchParams.set("destination", opts.destination);

  const inDate = opts.checkIn ? new Date(opts.checkIn) : null;
  if (inDate && !Number.isNaN(inDate.getTime())) {
    // Concert-goers normally arrive the day of the show and leave the next day.
    const out = new Date(inDate);
    out.setDate(out.getDate() + Math.max(1, opts.nights ?? 1));
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    url.searchParams.set("startDate", iso(inDate));
    url.searchParams.set("endDate", iso(out));
  }

  return EXPEDIA_LINK_TEMPLATE
    .replace("{id}", encodeURIComponent(EXPEDIA_AFFILIATE_ID))
    .replace("{url}", encodeURIComponent(url.toString()));
}
