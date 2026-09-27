import type { Opportunity, PositionSnapshot, StressResult } from "./domain";
import { clamp } from "./scoring";
import { evaluatePositionRisk } from "./position-risk";

export type PositionStressScenario = {
  name: string;
  shockPct: number;
  resultingCollateralUsd: number;
  resultingLtvPct: number;
  liquidationDistancePct: number;
  status: "survives" | "warning" | "liquidatable";
};

export function stressOpportunity(opportunity: Opportunity, shocks = [-15, -30, -50]): StressResult[] {
  return shocks.map((shockPct) => {
    const yieldAfterShock = opportunity.estimatedNetApyPct * (1 + shockPct / 100);
    const riskAfterShock = clamp(opportunity.riskScore + Math.abs(shockPct) * 0.7);
    const score = Number(clamp(opportunity.opportunityScore - Math.abs(shockPct) * 0.75 - Math.max(0, riskAfterShock - opportunity.riskScore) * 0.35).toFixed(2));
    const survives = riskAfterShock < 85 && yieldAfterShock > -5;
    return {
      scenario: `${Math.abs(shockPct)}% yield/liquidity shock`,
      shockPct,
      score,
      survives,
      consequence: survives
        ? `modeled opportunity remains viable at ${yieldAfterShock.toFixed(2)}% net APY-equivalent`
        : "modeled assumptions break the deterministic risk gate",
    };
  });
}

export function stressPosition(position: PositionSnapshot, shocks = [-10, -20, -30]): PositionStressScenario[] {
  return shocks.map((shockPct) => {
    const resultingCollateralUsd = position.collateralUsd * (1 + shockPct / 100);
    const stressed = evaluatePositionRisk({ ...position, collateralUsd: resultingCollateralUsd });
    return {
      name: `${Math.abs(shockPct)}% collateral drawdown`,
      shockPct,
      resultingCollateralUsd: Number(resultingCollateralUsd.toFixed(2)),
      resultingLtvPct: stressed.ltvPct,
      liquidationDistancePct: stressed.liquidationDistancePct,
      status: stressed.liquidationDistancePct <= 0 ? "liquidatable" : stressed.liquidationDistancePct < 8 ? "warning" : "survives",
    };
  });
}
