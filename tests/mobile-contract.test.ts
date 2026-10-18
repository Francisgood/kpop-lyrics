// Contract test for the surfaces the Aegyo mobile app (Myosin-xyz/aegyo-mobile)
// consumes. If one of these fails, the change breaks the shipped app: keep the
// change backward compatible or version it, and follow docs/MOBILE_CONTRACT.md.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const MOBILE = "mobile app depends on this; see docs/MOBILE_CONTRACT.md";
const ORIGIN = "https://aegyo.example.test";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  chatSession: vi.fn(),
  classify: vi.fn(),
  authMode: vi.fn(),
  queryRawUnsafe: vi.fn(),
  queryRaw: vi.fn(),
  executeRaw: vi.fn(),
  chatFindMany: vi.fn(),
  participationFind: vi.fn(),
  participationUpsert: vi.fn(),
  attemptUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
  prisma: {
    $queryRawUnsafe: mocks.queryRawUnsafe,
    $queryRaw: mocks.queryRaw,
    $executeRaw: mocks.executeRaw,
    $executeRawUnsafe: mocks.executeRaw,
    $transaction: mocks.transaction,
    chatMessage: { findMany: mocks.chatFindMany },
    chatParticipation: { findUnique: mocks.participationFind, upsert: mocks.participationUpsert },
    chatPostAttempt: { update: mocks.attemptUpdate },
  },
}));
vi.mock("../lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("../lib/chat-auth", () => ({ getChatSession: mocks.chatSession }));
vi.mock("../lib/chat-policy", async (original) => ({
  ...(await original<typeof import("../lib/chat-policy")>()),
  classifyChatBody: mocks.classify,
}));
vi.mock("../lib/shared-auth/mode", async (original) => ({
  ...(await original<typeof import("../lib/shared-auth/mode")>()),
  resolveAuthMode: mocks.authMode,
}));

import { GET as newsGET } from "../app/api/news/route";
import { GET as pollGET } from "../app/api/polls/[slug]/route";
import { POST as votePOST } from "../app/api/polls/[slug]/vote/route";
import { GET as chatGET, POST as chatPOST } from "../app/api/chat/route";
import { GET as participationGET, POST as participationPOST } from "../app/api/chat/participation/route";
import { GET as sessionGET } from "../app/api/auth/shared/session/route";
import { chatReportReasons } from "../lib/chat-report-policy";
import { CHAT_RULES_VERSION } from "../lib/chat-participation";
import { chatHiddenCountries } from "../lib/chat-region";
import { POLL_SEEDS } from "../lib/polls";

// Lists the mobile app mirrors. Changing either side needs a web-parity issue.
const MOBILE_REPORT_REASONS = ["abuse", "sexual", "spam", "personal_info", "underage", "other"];
const MOBILE_HIDDEN_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB",
];

const NEWS_POST_KEYS = [
  "id", "slug", "headline", "subheadline", "body", "esHeadline", "esSubheadline",
  "imageUrl", "imageCredit", "category", "tag", "artistSlug", "artistName",
  "sourceName", "sourceUrl", "readMins", "publishedAt",
  // TODO(#26): add "bodyEs" once Francisgood/kpop-lyrics#26 is merged into main.
];

const chatSession = {
  userId: "fan-1",
  providerSessionId: "sid-1",
  user: { id: "fan-1", email: "fan@example.test", displayName: "Fan One" },
};

function sql(strings: unknown): string {
  return Array.isArray(strings) ? strings.join("?") : String(strings);
}

function postJson(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AEGYO_CHAT_ENABLED", "true");
  vi.stubEnv("AEGYO_APP_ORIGIN", ORIGIN);
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("AEGYO_AUTH_CUTOVER_FREEZE", "");
  delete process.env.AEGYO_CHAT_WRITE_ALLOWLIST;
  mocks.getSession.mockResolvedValue(null);
  mocks.chatSession.mockResolvedValue(chatSession);
  mocks.classify.mockResolvedValue("visible");
  mocks.executeRaw.mockResolvedValue(1);
  // Poll ledger reads, routed by the SQL text of the tagged template.
  mocks.queryRaw.mockImplementation((strings: unknown) => {
    const text = sql(strings);
    if (text.includes("GROUP BY")) return Promise.resolve([{ option: "a", c: 3 }, { option: "b", c: 1 }]);
    if (text.includes('SELECT "option" FROM "PollVote"')) return Promise.resolve([]);
    if (text.includes('FROM "Poll" WHERE')) return Promise.resolve([{ slug: "x", policy: "anonymous_allowed", closeAt: null }]);
    if (text.includes('"ipHash"')) return Promise.resolve([{ c: 0 }]);
    return Promise.resolve([]);
  });
});

describe("news feed (GET /api/news)", () => {
  it("returns {posts, nextOffset, hasMore} with every post field the app reads", async () => {
    const row = Object.fromEntries(NEWS_POST_KEYS.map((k) => [k, null]));
    mocks.queryRawUnsafe.mockResolvedValue([{ ...row, id: "p1", slug: "s1", category: "comeback", readMins: 2 }]);
    const res = await newsGET(new NextRequest(`${ORIGIN}/api/news?limit=1&offset=0`));
    expect(res.status, MOBILE).toBe(200);
    const json = await res.json();
    expect(Object.keys(json).sort(), `feed envelope: ${MOBILE}`).toEqual(["hasMore", "nextOffset", "posts"]);
    expect(Object.keys(json.posts[0]).sort(), `news post keys: ${MOBILE}`).toEqual([...NEWS_POST_KEYS].sort());
    expect(json.nextOffset, `nextOffset: ${MOBILE}`).toBe(1);
    expect(json.hasMore, `hasMore: ${MOBILE}`).toBe(true);
    // Rows pass through unchanged, so the SELECT list is what pins the post fields.
    const selectSql = String(mocks.queryRawUnsafe.mock.calls[0][0]);
    for (const key of NEWS_POST_KEYS) {
      expect(selectSql, `news SELECT includes "${key}": ${MOBILE}`).toContain(`"${key}"`);
    }
  });

  it("returns 200 with an empty list when the query fails", async () => {
    mocks.queryRawUnsafe.mockRejectedValue(new Error("db down"));
    const res = await newsGET(new NextRequest(`${ORIGIN}/api/news?offset=40`));
    expect(res.status, `empty feed on failure: ${MOBILE}`).toBe(200);
    expect(await res.json(), `empty feed on failure: ${MOBILE}`).toEqual({ posts: [], nextOffset: 40, hasMore: false });
  });
});

describe("polls", () => {
  const pollSlug = Object.keys(POLL_SEEDS)[0];
  const params = { params: Promise.resolve({ slug: pollSlug }) };

  it("GET /api/polls/[slug] returns {ok, poll, deviceToken} with the poll fields the app reads", async () => {
    const res = await pollGET(new NextRequest(`${ORIGIN}/api/polls/${pollSlug}?deviceId=d_mobile`), params);
    expect(res.status, MOBILE).toBe(200);
    const json = await res.json();
    expect(json.ok, `poll ok flag: ${MOBILE}`).toBe(true);
    expect(json.deviceToken, `deviceId query param is honored: ${MOBILE}`).toBe("d_mobile");
    for (const key of ["slug", "question", "questionEs", "options", "counts", "myVote", "closed", "policy", "voterName"]) {
      expect(json.poll, `poll.${key}: ${MOBILE}`).toHaveProperty(key);
    }
    expect(Object.keys(json.poll.options[0]).sort(), `poll option keys: ${MOBILE}`).toEqual(["key", "label", "labelEs"]);
    expect(Object.keys(json.poll.counts).sort(), `poll count keys: ${MOBILE}`).toEqual(["a", "b", "c", "d", "total"]);
    expect(json.poll.counts.total, `counts.total: ${MOBILE}`).toBe(4);
  });

  it("GET without a device id mints one and sets the aa_vid cookie", async () => {
    const res = await pollGET(new NextRequest(`${ORIGIN}/api/polls/${pollSlug}`), params);
    const json = await res.json();
    expect(typeof json.deviceToken, `deviceToken in body: ${MOBILE}`).toBe("string");
    expect(res.cookies.get("aa_vid")?.value, `aa_vid cookie: ${MOBILE}`).toBe(json.deviceToken);
  });

  it("POST /api/polls/[slug]/vote accepts {option, deviceId} without an Origin header and returns {ok, counts, myVote, deviceToken}", async () => {
    const res = await votePOST(postJson(`/api/polls/${pollSlug}/vote`, { option: "a", deviceId: "d_mobile" }), params);
    expect(res.status, `vote without Origin: ${MOBILE}`).toBe(200);
    const json = await res.json();
    expect(Object.keys(json).sort(), `vote response keys: ${MOBILE}`).toEqual(["counts", "deviceToken", "myVote", "ok"]);
    expect(json.ok, `vote ok flag: ${MOBILE}`).toBe(true);
    expect(json.myVote, `vote myVote: ${MOBILE}`).toBe("a");
    expect(json.deviceToken, `vote deviceToken: ${MOBILE}`).toBe("d_mobile");
  });
});

describe("fan chat", () => {
  it("GET /api/chat returns {messages[{id, body, createdAt, authorName}]}", async () => {
    mocks.chatFindMany.mockResolvedValue([{ id: "m1", body: "hello", createdAt: new Date("2026-10-01T00:00:00Z"), authorName: "abc123 · Fan" }]);
    const res = await chatGET();
    expect(res.status, MOBILE).toBe(200);
    const json = await res.json();
    expect(Object.keys(json), `chat GET envelope: ${MOBILE}`).toEqual(["messages"]);
    expect(Object.keys(json.messages[0]).sort(), `chat message keys: ${MOBILE}`).toEqual(["authorName", "body", "createdAt", "id"]);
    expect(json.messages[0].createdAt, `createdAt is ISO: ${MOBILE}`).toBe("2026-10-01T00:00:00.000Z");
  });

  it("GET /api/chat is 404 when chat is disabled", async () => {
    vi.stubEnv("AEGYO_CHAT_ENABLED", "false");
    expect((await chatGET()).status, `chat disabled is 404: ${MOBILE}`).toBe(404);
  });

  it("POST /api/chat with the app Origin returns 201 {status, message}", async () => {
    mocks.participationFind.mockResolvedValue({ rulesVersion: CHAT_RULES_VERSION, age16ConfirmedAt: new Date() });
    const created = { id: "m2", body: "annyeong", createdAt: new Date("2026-10-02T00:00:00Z"), authorName: "abc123 · Fan One" };
    mocks.transaction.mockImplementation((run: (tx: unknown) => Promise<unknown>) => run({
      $queryRaw: vi.fn().mockResolvedValue([]),
      chatMute: { findUnique: vi.fn().mockResolvedValue(null) },
      chatPostAttempt: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: "attempt-1" }),
        update: vi.fn().mockResolvedValue({}),
      },
      chatMessage: { create: vi.fn().mockResolvedValue(created) },
      chatModerationEvent: { create: vi.fn() },
    }));
    const res = await chatPOST(postJson("/api/chat", { body: "annyeong" }, { origin: ORIGIN }));
    expect(res.status, `chat POST success code: ${MOBILE}`).toBe(201);
    const json = await res.json();
    expect(Object.keys(json).sort(), `chat POST keys: ${MOBILE}`).toEqual(["message", "status"]);
    expect(json.status, `chat POST status value: ${MOBILE}`).toBe("visible");
    expect(Object.keys(json.message).sort(), `chat POST message keys: ${MOBILE}`).toEqual(["authorName", "body", "createdAt", "id"]);
  });

  it("POST /api/chat without an Origin header is 403", async () => {
    const res = await chatPOST(postJson("/api/chat", { body: "annyeong" }));
    expect(res.status, `chat mutations require Origin = AEGYO_APP_ORIGIN: ${MOBILE}`).toBe(403);
  });

  it("participation GET and POST return {accepted, rulesVersion}", async () => {
    mocks.participationFind.mockResolvedValue(null);
    const read = await participationGET();
    expect(await read.json(), `participation GET shape: ${MOBILE}`).toEqual({ accepted: false, rulesVersion: CHAT_RULES_VERSION });
    mocks.participationUpsert.mockResolvedValue({});
    const write = await participationPOST(postJson("/api/chat/participation", { acceptRules: true, confirmAge16: true }, { origin: ORIGIN }));
    expect(write.status, MOBILE).toBe(200);
    expect(await write.json(), `participation POST shape: ${MOBILE}`).toEqual({ accepted: true, rulesVersion: CHAT_RULES_VERSION });
  });

  it("CHAT_RULES_VERSION is a string", () => {
    expect(typeof CHAT_RULES_VERSION, `rules version: ${MOBILE}`).toBe("string");
  });

  it("report reasons equal the list the app offers", () => {
    expect([...chatReportReasons].sort(), `report reasons: ${MOBILE}`).toEqual([...MOBILE_REPORT_REASONS].sort());
  });

  it("the hidden-region list is the EU-27 plus GB", () => {
    expect(chatHiddenCountries.size, `EU-27 + GB count: ${MOBILE}`).toBe(28);
    expect([...chatHiddenCountries].sort(), `EU-27 + GB codes: ${MOBILE}`).toEqual([...MOBILE_HIDDEN_COUNTRIES].sort());
  });
});

describe("shared auth session (GET /api/auth/shared/session)", () => {
  it("returns 401 {authenticated:false} without a session cookie", async () => {
    mocks.authMode.mockResolvedValue({
      kind: "shared",
      config: {
        providerBaseUrl: "https://accounts.example.test",
        issuer: "https://accounts.example.test/api/auth",
        clientId: "a", clientSecret: "b", appOrigin: ORIGIN,
        transactionSecret: "x".repeat(32), stateReaderKey: "reader",
      },
    });
    const res = await sessionGET(new NextRequest(`${ORIGIN}/api/auth/shared/session`));
    expect(res.status, `signed-out status: ${MOBILE}`).toBe(401);
    expect(await res.json(), `signed-out body: ${MOBILE}`).toEqual({ authenticated: false });
  });
});
