Update CityEvent records for Aegyo Arena's 21 city guides. Run this weekly (or when K-pop tour announcements are made) to keep concert and meetup listings current.

## What to update

CityEvents live in the `CityEvent` table with fields: `cityId`, `artistId?`, `title`, `venue`, `eventDate`, `ticketUrl`, `type` (`"concert"` | `"meetup"` | `"festival"`).

## Steps

### 1. Audit stale events
List all CityEvents where `eventDate` is a past month (e.g., "2025-03") or explicitly past:
```typescript
const staleEvents = await prisma.cityEvent.findMany({
  where: { eventDate: { not: null } },
  include: { city: true },
});
// Flag events where eventDate looks like a past date
```

Delete confirmed past events (events from more than 2 months ago based on their `eventDate` string).

### 2. Check for new tour announcements
Search for K-pop tour announcements for the current season. Key sources to check:
- Songkick tour pages for major acts: BTS solo members, BLACKPINK, aespa, TWICE, Stray Kids, ATEEZ, NewJeans, IVE, (G)I-DLE
- Look for new city stops not yet in the DB

### 3. Update events per city
For each of the 21 cities, verify:
- Do the current concerts still make sense for the upcoming 3-6 months?
- Are there any major tours that have been announced that should be added?
- Are meetup events still accurate (recurring ones are usually fine)?

For each update:
```typescript
const city = await prisma.city.findUnique({ where: { slug: "city-slug" } });
await prisma.cityEvent.create({
  data: {
    cityId: city.id,
    title: "ARTIST NAME",
    venue: "Venue Name",
    eventDate: "2025-MM",
    ticketUrl: "https://seatgeek.com/search#?q=artist+city",
    type: "concert",
  }
});
```

### 4. Link events to artist records
When a CityEvent artist matches an existing `Artist` slug in the DB, set the `artistId` FK:
```typescript
const artist = await prisma.artist.findUnique({ where: { slug: "artist-slug" } });
if (artist) {
  await prisma.cityEvent.update({ where: { id: event.id }, data: { artistId: artist.id } });
}
```

This powers the future "Artists Touring Near You" feature on artist pages.

### 5. Generate a ContentSignal for new events
For each new concert event added, create a `ContentSignal`:
```typescript
await prisma.contentSignal.create({
  data: {
    entityType: "city",
    entityId: city.id,
    headline: `${title} announced at ${venue}`,
    body: `New K-pop concert announced in ${city.name}. ${title} will perform at ${venue} in ${eventDate}. Tickets available via the event link.`,
    category: "tour",
    publishedAt: new Date(),
  }
});
```

## Script location

`scripts/update-city-events.ts` — run with:
```
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/update-city-events.ts
```

## Output

Report per city:
- Events deleted (stale/past)
- Events added (new announcements)  
- Events unchanged

After updates, commit seed.ts changes and run `railway up --detach` to rebuild the Railway DB. The city pages use `revalidate = 3600` so they auto-refresh within an hour of the DB update.
