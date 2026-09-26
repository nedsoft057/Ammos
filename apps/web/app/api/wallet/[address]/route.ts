import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { getLiveSnapshot } from "@/lib/live/snapshot";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  if (!isAddress(address)) return NextResponse.json({ ok: false, error: "Invalid Ethereum address." }, { status: 400 });

  try {
    const data = await getLiveSnapshot(address);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Wallet data unavailable." }, { status: 503 });
  }
}
