import { NextResponse } from "next/server";
import { fetchAllImages } from "@/scripts/fetch-images";

export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await fetchAllImages();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
