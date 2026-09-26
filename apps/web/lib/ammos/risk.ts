import { clamp, riskLevel } from "./scoring";
import type { LendingMarket } from "../protocols/types";

export type LendingRisk = {
  score: number;
  level: ReturnType<typeof riskLevel>;
  liquidationDistance: number;
  utilizationRisk: number;
  liquidityRisk: number;
  borrowCostRisk: number;
  reasons: string[];
};

export function evaluateLendingRisk(
  market: LendingMarket,
): LendingRisk {
  const liquidationDistance =
    Math.max(
      0,
      (market.liquidationThreshold - market.utilization) * 100,
    );

  const utilizationRisk = clamp(
    market.utilization * 100,
  );

  const liquidityRisk = clamp(
    100 - (market.totalSupplyUsd / Math.max(market.totalBorrowUsd, 1)) * 25,
  );

  const borrowCostRisk = clamp(
    market.borrowApy * 4,
  );

  const score = Number(
    clamp(
      utilizationRisk * 0.35 +
        liquidityRisk * 0.3 +
        borrowCostRisk * 0.2 +
        (100 - liquidationDistance) * 0.15,
    ).toFixed(2),
  );

  const reasons: string[] = [];

  if (market.utilization > 0.8) {
    reasons.push("High utilization leaves less liquidity headroom.");
  }

  if (market.borrowApy > 0.1) {
    reasons.push("Borrow cost is materially reducing strategy efficiency.");
  }

  if (liquidationDistance < 0.15) {
    reasons.push("Liquidation conditions require tighter collateral management.");
  }

  if (market.totalBorrowUsd > market.totalSupplyUsd * 0.85) {
    reasons.push("Borrow demand is approaching available supply.");
  }

  if (reasons.length === 0) {
    reasons.push("Current lending conditions are relatively stable.");
  }

  return {
    score,
    level: riskLevel(score),
    liquidationDistance,
    utilizationRisk,
    liquidityRisk,
    borrowCostRisk,
    reasons,
  };
}
