import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../app/api/auth/recovery/route";
afterEach(() => { delete process.env.AEGYO_SHARED_AUTH_ENABLED; });
describe("password recovery cutover", () => {
 it("keeps the legacy recovery page while shared auth is off", () => { delete process.env.AEGYO_SHARED_AUTH_ENABLED; expect(GET(new NextRequest("https://aegyo.example.test/api/auth/recovery")).headers.get("location")).toBe("https://aegyo.example.test/forgot-password"); });
 it("enters the signed provider continuation while shared auth is on", () => {
  Object.assign(process.env, { AEGYO_SHARED_AUTH_ENABLED: "true", AEGYO_AUTH_BASE_URL: "https://accounts.example.test", AEGYO_APP_ORIGIN: "https://aegyo.example.test", AEGYO_AUTH_CLIENT_ID: "aegyo", AEGYO_AUTH_CLIENT_SECRET: "secret", AEGYO_AUTH_TRANSACTION_SECRET: "x".repeat(32), AEGYO_AUTH_STATE_READER_KEY: "reader" });
  expect(GET(new NextRequest("https://aegyo.example.test/api/auth/recovery")).headers.get("location")).toBe("https://aegyo.example.test/api/auth/shared/login");
 });
});
