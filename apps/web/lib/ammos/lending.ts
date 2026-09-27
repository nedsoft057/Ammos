import type { LendingMarketSnapshot, Opportunity } from "./domain";
import { clamp, opportunityScore } from "./scoring";

export function evaluateLendingMarket(
  market: LendingMarketSnapshot,
): Opportunity {
  const utilizationPct =
    market.totalSupplyUsd <= 0
      ? 100
      : (market.totalBorrowUsd / market.totalSupplyUsd) * 100;

  const utilizationRisk = clamp(
    utilizationPct > 85 ? 70 + (utilizationPct - 85) * 2 : utilizationPct * 0.55,
  );

  const borrowCostRisk = clamp(market.borrowApyPct * 2.8);

  const liquidityHeadroom =
    market.totalSupplyUsd - market.totalBorrowUsd;

  const liquidityRisk =
    liquidityHeadroom <= 0
      ? 100
      : clamp(100 - (liquidityHeadroom / Math.max(market.totalSupplyUsd, 1)) * 100);

  const riskScore = Number(
    clamp(
      utilizationRisk * 0.45 +
        borrowCostRisk * 0.25 +
        liquidityRisk * 0.2 +
        (100 - market.liquidationThresholdPct) * 0.1,
    ).toFixed(2),
  );

  const netApy = Number(
    (market.supplyApyPct - market.borrowApyPct).toFixed(3),
  );

  const confidence =
    utilizationPct < 75 && market.totalSupplyUsd > 1_000_000 ? 0.9 : 0.72;

  const reasons = [
    `Supply APY is ${market.supplyApyPct.toFixed(2)}% against ${market.borrowApyPct.toFixed(2)}% borrow APY.`,
    `Market utilization is ${utilizationPct.toFixed(1)}%.`,
    `Estimated net spread is ${netApy.toFixed(2)}%.`,
  ];

  const warnings: string[] = [];

  if (utilizationPct > 85) {
    warnings.push("High utilization can reduce withdrawal and borrow headroom.");
  }

  if (market.borrowApyPct > market.supplyApyPct) {
    warnings.push("Borrow cost currently exceeds supply yield.");
  }

  const score = opportunityScore(netApy, riskScore, confidence);

  return {
    id: `lend:${market.id}`,
    type: "lending",
    protocol: market.protocol,
    chain: market.chain,
    title: `Supply ${market.collateral.symbol} on ${market.protocol}`,
    grossApyPct: market.supplyApyPct,
    estimatedCostPct: market.borrowApyPct,
    estimatedNetApyPct: netApy,
    riskScore,
    opportunityScore: score,
    confidence,
    reasons,
    warnings,
    evidence: [`normalized ${market.id}`],
    unknowns: [],
  };
}
