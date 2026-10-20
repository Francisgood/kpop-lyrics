import { NextRequest, NextResponse } from "next/server";
import { chatCountry } from "@/lib/chat-region-server";
import { showChatForCountry } from "@/lib/chat-region";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const country = await chatCountry(request.headers);
  return NextResponse.json({ country, allowed: showChatForCountry(country) }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
