import { NextResponse } from "next/server";
import { getLiveSnapshot } from "@/lib/live/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await getLiveSnapshot() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Live data unavailable." }, { status: 503 });
  }
}
