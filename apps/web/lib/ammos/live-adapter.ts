import type { LiveMarketSnapshot, LiveYieldPool } from "../live/types";
import type { MarketSnapshot, Opportunity } from "./domain";
import { clamp, opportunityScore } from "./scoring";

function asset(symbol: string, chain: string, priceUsd: number) {
  return { symbol, chain, priceUsd };
}

export function poolToMarketSnapshot(pool: LiveYieldPool, prices: Record<string, number>): MarketSnapshot {
  const volume24hUsd = pool.volume24hUsd ?? 0;
  const tokenSymbols = pool.symbol.split(/[-/:]/).map((s) => s.trim()).filter(Boolean);
  const token0 = tokenSymbols[0] || pool.symbol || "TOKEN0";
  const token1 = tokenSymbols[1] || (pool.stablecoin ? "USDC" : "TOKEN1");

  if (pool.project.toLowerCase().includes("uniswap")) {
    return {
      asOf: new Date().toISOString(),
      source: "DeFiLlama",
      chain: pool.chain,
      liquidity: [{
        id: pool.pool,
        protocol: pool.project,
        chain: pool.chain,
        token0: asset(token0, pool.chain, prices[token0] ?? 0),
        token1: asset(token1, pool.chain, prices[token1] ?? (pool.stablecoin ? prices.USDC ?? 1 : 0)),
        tvlUsd: pool.tvlUsd,
        volume24hUsd,
        feeBps: 0,
        aprPct: pool.apy ?? 0,
        token0Weight: 0.5,
        token1Weight: 0.5,
        il7dPct: pool.il7dPct ?? undefined,
      }],
    };
  }

  return {
    asOf: new Date().toISOString(),
    source: "DeFiLlama",
    chain: pool.chain,
    lending: [{
      id: pool.pool,
      protocol: pool.project,
      chain: pool.chain,
      collateral: asset(token0, pool.chain, prices[token0] ?? 0),
      borrowAsset: asset(pool.stablecoin ? "USDC" : token1, pool.chain, pool.stablecoin ? prices.USDC ?? 1 : prices[token1] ?? 0),
      supplyApyPct: pool.apy ?? 0,
      borrowApyPct: 0,
      totalSupplyUsd: pool.tvlUsd,
      totalBorrowUsd: 0,
      liquidationThresholdPct: 80,
      liquidationPenaltyPct: 5,
    }],
  };
}

function observedPoolOpportunity(pool: LiveYieldPool, normalized?: MarketSnapshot): Opportunity {
  const normalizedLending = normalized?.lending?.[0];
  const normalizedLiquidity = normalized?.liquidity?.[0];
  const apy = Math.max(0, normalizedLending?.supplyApyPct ?? normalizedLiquidity?.aprPct ?? pool.apy ?? 0);
  const tvl = normalizedLending?.totalSupplyUsd ?? normalizedLiquidity?.tvlUsd ?? pool.tvlUsd;
  const volume24hUsd = normalizedLiquidity?.volume24hUsd ?? pool.volume24hUsd ?? 0;
  const tvlRisk = clamp(100 - Math.log10(Math.max(tvl, 1)) * 12);
  const rewardShare = apy > 0 ? clamp(((pool.apyReward ?? 0) / apy) * 100) : 0;
  const outlierPenalty = pool.apyMean30d && pool.apyMean30d > 0 ? clamp((apy / pool.apyMean30d - 1) * 80) : 0;
  const ilPenalty = pool.il7dPct == null ? 12 : clamp(Math.abs(pool.il7dPct) * 2.5);
  const exposurePenalty = pool.stablecoin ? 8 : 18;
  const riskScore = Number(clamp(tvlRisk * 0.28 + rewardShare * 0.12 + outlierPenalty * 0.18 + ilPenalty * 0.22 + exposurePenalty * 0.2).toFixed(2));
  const unknowns: string[] = [];
  if (pool.project.toLowerCase().includes("aave")) unknowns.push("borrow APY and wallet protocol debt are not present in the DeFiLlama yield record");
  if (pool.project.toLowerCase().includes("uniswap") && !pool.volume24hUsd) unknowns.push("24h pool volume is unavailable in this source record");
  if (pool.project.toLowerCase().includes("uniswap") && pool.il7dPct == null) unknowns.push("7d impermanent-loss observation is unavailable");
  if (rewardShare > 50) unknowns.push("a large share of headline APY comes from rewards rather than base yield");

  const confidence = Number(clamp(0.94 - unknowns.length * 0.12 - (pool.apyMean30d == null ? 0.06 : 0)).toFixed(2));
  const opportunity = opportunityScore(apy, riskScore, confidence);
  const warnings = [...unknowns];
  if (pool.tvlUsd < 1_000_000) warnings.push("lower TVL increases exit and liquidity sensitivity");
  if (outlierPenalty > 15) warnings.push("headline APY is materially above its observed 30-day mean");

  return {
    id: `live:${pool.pool}`,
    type: pool.project.toLowerCase().includes("uniswap") ? "liquidity" : "lending",
    protocol: pool.project,
    chain: pool.chain,
    title: `${pool.project} · ${pool.symbol}`,
    grossApyPct: apy,
    estimatedCostPct: 0,
    estimatedNetApyPct: apy,
    riskScore,
    opportunityScore: opportunity,
    confidence,
    reasons: [
      `Observed APY is ${apy.toFixed(2)}%.`,
      `Observed TVL is $${tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
      pool.apyMean30d ? `Current APY is ${((apy / pool.apyMean30d - 1) * 100).toFixed(1)}% versus the observed 30-day mean.` : "No 30-day APY baseline was available.",
      volume24hUsd ? `24h volume/TVL is ${((volume24hUsd / Math.max(tvl, 1)) * 100).toFixed(1)}%.` : "No live volume ratio was available.",
    ],
    warnings,
    evidence: [
      `DeFiLlama pool ${pool.pool}`,
      `${pool.project} on ${pool.chain}`,
      `observed at ${new Date().toISOString()}`,
    ],
    unknowns,
  };
}

export type NormalizedLiveMarket = {
  source: LiveYieldPool;
  market: MarketSnapshot;
};

export function normalizeLiveSnapshot(snapshot: LiveMarketSnapshot): NormalizedLiveMarket[] {
  return snapshot.pools.map((pool) => ({ source: pool, market: poolToMarketSnapshot(pool, snapshot.prices) }));
}

export function discoverLiveOpportunities(snapshot: LiveMarketSnapshot): Opportunity[] {
  return normalizeLiveSnapshot(snapshot)
    .map(({ source, market }) => {
      const normalized = market.lending?.[0] ?? market.liquidity?.[0];
      const opportunity = observedPoolOpportunity(source, market);
      if (normalized) {
        opportunity.evidence = [
          ...opportunity.evidence,
          `normalized domain record: ${normalized.protocol} / ${normalized.chain}`,
        ];
      }
      return opportunity;
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}
