import { afterEach, test, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { chatClientIp, chatRegionDenial } from "../lib/chat-region-server";
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
test("unverified forwarding and client country headers cannot decide country", async()=>{
  vi.stubEnv("AEGYO_CHAT_RAILWAY_IP_VERIFIED","false");
  const transport=vi.fn();vi.stubGlobal("fetch",transport);
  const request=new Request("https://example.test/api/chat",{headers:{"x-real-ip":"192.0.2.1","x-vercel-ip-country":"GB"}});
  expect(chatClientIp(request.headers)).toBeNull();expect(await chatRegionDenial(request)).toBeNull();expect(transport).not.toHaveBeenCalled();
});
test("verified EU/UK addresses block reads and writes even with an allowed client header", async()=>{
  vi.stubEnv("AEGYO_CHAT_RAILWAY_IP_VERIFIED","true");vi.stubEnv("AEGYO_CHAT_ENABLED","true");
  const transport=vi.fn().mockResolvedValue(new Response(JSON.stringify({country:"GB"})));vi.stubGlobal("fetch",transport);
  const headers={"x-real-ip":"192.0.2.2","x-vercel-ip-country":"US"};
  const { GET, POST }=await import("../app/api/chat/route");
  for(const [method,handler] of [["GET",GET],["POST",POST]] as const){
    const response=await handler(new NextRequest("https://example.test/api/chat",{method,headers}));
    expect(response.status).toBe(403);expect(await response.json()).toMatchObject({code:"chat_region_restricted"});
  }
  expect(transport).toHaveBeenCalledTimes(1);
  expect(transport.mock.calls[0][0]).toBe("https://api.country.is/192.0.2.2");
});
test("lookup failure is allowed and private",async()=>{
  vi.stubEnv("AEGYO_CHAT_RAILWAY_IP_VERIFIED","true");vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new Error("offline")));
  expect(await chatRegionDenial(new Request("https://example.test",{headers:{"x-real-ip":"192.0.2.3"}}))).toBeNull();
});
