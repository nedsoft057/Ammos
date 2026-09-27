import type { LiquidityPoolSnapshot, Opportunity } from "./domain";
import { clamp, opportunityScore } from "./scoring";

export function evaluateLiquidityPool(
  pool: LiquidityPoolSnapshot,
): Opportunity {
  const volumeTvl =
    pool.tvlUsd <= 0 ? 0 : pool.volume24hUsd / pool.tvlUsd;

  const feeYieldPct =
    volumeTvl * (pool.feeBps / 100) * 365;

  const estimatedGross = Math.max(pool.aprPct, feeYieldPct);

  const imbalance =
    Math.abs(pool.token0Weight - pool.token1Weight) * 100;

  const liquidityRisk = clamp(100 - Math.log10(Math.max(pool.tvlUsd, 1)) * 12);
  const imbalanceRisk = clamp(imbalance * 1.7);
  const volatilityRisk = clamp(
    ((pool.token0.volatility24h ?? 0) + (pool.token1.volatility24h ?? 0)) * 2.5,
  );

  const ilEstimate = clamp(
    Math.abs(
      (pool.token0.volatility24h ?? 0) -
        (pool.token1.volatility24h ?? 0),
    ) * 0.22,
    0,
    35,
  );

  const riskScore = Number(
    clamp(
      liquidityRisk * 0.3 +
        imbalanceRisk * 0.2 +
        volatilityRisk * 0.35 +
        ilEstimate * 1.2 * 0.15,
    ).toFixed(2),
  );

  const netApy = Number(
    (estimatedGross - ilEstimate).toFixed(3),
  );

  const confidence = pool.tvlUsd > 5_000_000 ? 0.88 : 0.68;

  const reasons = [
    `Pool TVL is $${pool.tvlUsd.toLocaleString()}.`,
    `24h volume/TVL is ${(volumeTvl * 100).toFixed(2)}%.`,
    `Estimated LP yield after a simplified IL allowance is ${netApy.toFixed(2)}%.`,
  ];

  const warnings: string[] = [];

  if (ilEstimate > 5) {
    warnings.push("Token volatility divergence creates meaningful IL sensitivity.");
  }

  if (pool.tvlUsd < 1_000_000) {
    warnings.push("Lower TVL increases liquidity and exit-risk sensitivity.");
  }

  return {
    id: `lp:${pool.id}`,
    type: "liquidity",
    protocol: pool.protocol,
    chain: pool.chain,
    title: `Provide liquidity to ${pool.token0.symbol}/${pool.token1.symbol}`,
    grossApyPct: estimatedGross,
    estimatedCostPct: ilEstimate,
    estimatedNetApyPct: netApy,
    riskScore,
    opportunityScore: opportunityScore(netApy, riskScore, confidence),
    confidence,
    reasons,
    warnings,
    evidence: [`normalized ${pool.id}`],
    unknowns: [],
  };
}
