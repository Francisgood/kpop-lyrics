import { afterEach, test, expect, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks=vi.hoisted(()=>({query:vi.fn(),transaction:vi.fn()}));
vi.mock("../lib/prisma",()=>({prisma:{$queryRaw:mocks.query,$transaction:mocks.transaction}}));
import { GET, POST } from "../app/api/internal/account-deletion/route";
const origin="https://accounts.example.test";
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
test("deletion API rejects ordinary user cookies and wrong issuer without touching data",async()=>{
 vi.stubEnv("AEGYO_ACCOUNT_DELETION_KEY","s".repeat(40));vi.stubEnv("AEGYO_AUTH_BASE_URL",origin);
 expect((await GET(new NextRequest("https://example.test/api/internal/account-deletion",{headers:{cookie:"session=ordinary"}}))).status).toBe(401);
 const request=(body:string)=>new NextRequest("https://example.test/api/internal/account-deletion",{method:"POST",headers:{authorization:`Bearer ${"s".repeat(40)}`,"content-type":"application/json"},body});
 expect((await POST(request(JSON.stringify({requestId:"00000000-0000-4000-8000-000000000001",issuer:"https://wrong.example/api/auth",subject:"fan"})))).status).toBe(400);
 const oversized = await POST(request("x".repeat(3000)));
 expect(oversized.status).toBe(413);
 expect(mocks.transaction).not.toHaveBeenCalled();expect(mocks.query).not.toHaveBeenCalled();
});

test("a conflicting deletion request returns 409 instead of a retryable failure", async () => {
 vi.stubEnv("AEGYO_ACCOUNT_DELETION_KEY","s".repeat(40)); vi.stubEnv("AEGYO_AUTH_BASE_URL",origin);
 mocks.transaction.mockRejectedValue(new Error("request_conflict"));
 const response=await POST(new NextRequest("https://example.test/api/internal/account-deletion",{method:"POST",headers:{authorization:`Bearer ${"s".repeat(40)}`,"content-type":"application/json"},body:JSON.stringify({requestId:"00000000-0000-4000-8000-000000000001",issuer:`${origin}/api/auth`,subject:"fan"})}));
 expect(response.status).toBe(409); expect(await response.json()).toEqual({error:"request_conflict"});
});
