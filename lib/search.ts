import { Client } from "@elastic/elasticsearch";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { prisma } from "@/lib/prisma";

const INDEX = "aegyo";

export type SearchHit = { type: string; title: string; subtitle: string; body: string; url: string };

let _client: Client | null = null;
export function esClient(): Client | null {
  if (!process.env.ELASTICSEARCH_URL) return null;
  if (!_client) {
    _client = new Client({
      node: process.env.ELASTICSEARCH_URL,
      auth: { username: process.env.ELASTICSEARCH_USER || "elastic", password: process.env.ELASTICSEARCH_PASSWORD || "" },
      tls: { rejectUnauthorized: false }, // harmless over http; tolerant if the cluster is https/self-signed
      requestTimeout: 10000,
    });
  }
  return _client;
}

/**
 * Full-text search across every indexed entity type, wrapped in an OpenTelemetry
 * span so query latency/volume/errors are auditable in OpenObserve.
 */
export async function searchAll(q: string): Promise<{ grouped: Record<string, SearchHit[]>; total: number }> {
  const c = esClient();
  if (!c || !q.trim()) return { grouped: {}, total: 0 };
  const tracer = trace.getTracer("aegyo-search");
  return tracer.startActiveSpan("elasticsearch.search", async (span) => {
    span.setAttribute("db.system", "elasticsearch");
    span.setAttribute("search.query", q);
    try {
      const res = await c.search<SearchHit>({
        index: INDEX,
        size: 50,
        query: {
          multi_match: { query: q, fields: ["title^5", "subtitle^2", "body"], type: "best_fields", fuzziness: "AUTO", operator: "or" },
        },
      });
      const grouped: Record<string, SearchHit[]> = {};
      for (const h of res.hits.hits) {
        const d = h._source;
        if (d) (grouped[d.type] ??= []).push(d);
      }
      const total = res.hits.hits.length;
      span.setAttribute("search.result_count", total);
      span.setStatus({ code: SpanStatusCode.OK });
      return { grouped, total };
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e instanceof Error ? e.message : String(e) });
      return { grouped: {}, total: 0 };
    } finally {
      span.end();
    }
  });
}

async function ensureFreshIndex(c: Client): Promise<void> {
  if (await c.indices.exists({ index: INDEX })) await c.indices.delete({ index: INDEX });
  await c.indices.create({
    index: INDEX,
    mappings: {
      properties: {
        type: { type: "keyword" },
        title: { type: "text" },
        subtitle: { type: "text" },
        body: { type: "text" },
        url: { type: "keyword" },
      },
    },
  });
}

/** Rebuild the whole search index from the DB. Idempotent (drops + recreates). */
export async function reindexAll(): Promise<{ indexed: number; byType: Record<string, number> }> {
  const c = esClient();
  if (!c) throw new Error("Elasticsearch not configured (ELASTICSEARCH_URL missing)");
  await ensureFreshIndex(c);

  const docs: (SearchHit & { id: string })[] = [];

  const artists = await prisma.artist.findMany({ include: { label: true } });
  for (const a of artists) docs.push({ id: `artist-${a.id}`, type: "artist", title: a.stageName, subtitle: [a.realName, a.label?.name].filter(Boolean).join(" · "), body: a.bio ?? "", url: `/artists/${a.slug}` });

  const albums = await prisma.album.findMany({ include: { artist: true } });
  for (const al of albums) docs.push({ id: `album-${al.id}`, type: "album", title: al.title, subtitle: al.artist?.stageName ?? "", body: "", url: `/artists/${al.artist?.slug ?? ""}` });

  const songs = await prisma.song.findMany({ include: { album: { include: { artist: true } } } });
  for (const s of songs) docs.push({ id: `song-${s.id}`, type: "song", title: s.title, subtitle: s.album?.artist?.stageName ?? "", body: [s.lyricsEn, s.lyricsKo, s.lyricsRomanized].filter(Boolean).join("\n"), url: `/songs/${s.slug}` });

  const terms = await prisma.codedTerm.findMany({ include: { definitions: { take: 1, orderBy: { votesUp: "desc" } } } });
  for (const t of terms) docs.push({ id: `slang-${t.id}`, type: "slang", title: t.term, subtitle: "Korean slang", body: t.definitions[0]?.body ?? "", url: `/korean-slang/${t.slug}` });

  const news = await prisma.artistNews.findMany({ include: { artist: true } });
  for (const n of news) docs.push({ id: `news-${n.id}`, type: "news", title: n.headline, subtitle: [n.artist?.stageName, n.category].filter(Boolean).join(" · "), body: n.body, url: `/news` });

  try {
    const anns = await prisma.$queryRawUnsafe<{ id: string; authorName: string; songTitle: string; word: string; note: string }[]>(
      `SELECT "id","authorName","songTitle","word","note" FROM "CommunityAnnotation" WHERE "status" = 'approved'`,
    );
    for (const an of anns) docs.push({ id: `ann-${an.id}`, type: "annotation", title: an.word || an.songTitle, subtitle: `${an.authorName} · ${an.songTitle}`, body: an.note, url: `/annotation/${an.id}` });
  } catch {
    /* CommunityAnnotation table may not exist in some envs */
  }

  const byType: Record<string, number> = {};
  for (const d of docs) byType[d.type] = (byType[d.type] ?? 0) + 1;

  const CHUNK = 400;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const slice = docs.slice(i, i + CHUNK);
    const operations = slice.flatMap((d) => [{ index: { _index: INDEX, _id: d.id } }, { type: d.type, title: d.title, subtitle: d.subtitle, body: d.body, url: d.url }]);
    await c.bulk({ operations, refresh: i + CHUNK >= docs.length ? "wait_for" : false });
  }

  return { indexed: docs.length, byType };
}
