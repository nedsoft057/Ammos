import { NextResponse } from "next/server";
import { isAddress, type Address } from "viem";
import { fetchLivePrices, fetchLiveYieldPools } from "@/lib/live/defillama";
import { readWallet } from "@/lib/live/ethereum";
import { getMemoryStore } from "@/lib/memory";
import { chatWithGroq } from "@/lib/ai/groq";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body?.question === "string"
    ? body.question.trim()
    : typeof body?.message === "string"
      ? body.message.trim()
      : "";
  const address = typeof body?.address === "string" && isAddress(body.address)
    ? body.address as Address
    : undefined;

  if (!question) {
    return NextResponse.json({ ok: false, error: "Ask AMMOS a question." }, { status: 400 });
  }

  try {
    const [pools, prices, walletResult, memories] = await Promise.all([
      fetchLiveYieldPools(),
      fetchLivePrices(),
      address
        ? readWallet(address).catch(() => undefined)
        : Promise.resolve(undefined),
      getMemoryStore().recent("agent_run", 5),
    ]);
    const wallet = walletResult;

    const ranked = [...pools]
      .filter((pool) => pool.apy != null)
      .sort((a, b) => {
        const score = (p: typeof a) => {
          const liquidity = p.tvlUsd >= 1e9 ? 88 : p.tvlUsd >= 1e8 ? 76 : p.tvlUsd >= 1e7 ? 61 : 45;
          return Math.min(96, liquidity + Math.min(Math.max((p.apy ?? 0) * 1.7, 0), 16));
        };
        return score(b) - score(a);
      })
      .slice(0, 10);

    const context = {
      asOf: new Date().toISOString(),
      chain: "Ethereum mainnet",
      prices,
      marketCount: pools.length,
      wallet: wallet
        ? {
            address: wallet.address,
            ethBalance: wallet.ethBalance,
            wethBalance: wallet.wethBalance,
            usdcBalance: wallet.usdcBalance,
          }
        : null,
      rankedMarkets: ranked.map((p) => ({
        project: p.project,
        chain: p.chain,
        symbol: p.symbol,
        tvlUsd: p.tvlUsd,
        apy: p.apy,
        apyBase: p.apyBase,
        apyReward: p.apyReward,
        stablecoin: p.stablecoin,
        exposure: p.exposure,
      })),
      recentAgentRuns: memories.map((m) => ({
        key: m.key,
        createdAt: m.createdAt,
        assessment: m.payload.assessment,
      })),
    };

    const answer = await chatWithGroq({ question, context }).catch(() => null);

    if (answer) {
      return NextResponse.json({ ok: true, answer, source: "groq", context: { asOf: context.asOf, walletConnected: Boolean(wallet) } });
    }

    const lead = ranked[0];
    const fallback = lead
      ? `AMMOS is currently observing ${pools.length} Ethereum records. ${lead.project} / ${lead.symbol} leads the live signal with ${lead.apy?.toFixed(2)}% APY and $${lead.tvlUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} TVL. I can only infer from this snapshot; execution remains wallet-signed.`
      : "AMMOS is connected to the live feed, but there are no evaluated markets with a usable APY right now.";

    return NextResponse.json({
      ok: true,
      answer: fallback,
      source: "deterministic",
      context: { asOf: context.asOf, walletConnected: Boolean(wallet) },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Agent unavailable." },
      { status: 503 },
    );
  }
}
