import type { PositionSnapshot } from "./domain";
import { evaluatePositionRisk } from "./position-risk";

export type StressScenario = {
  name: string;
  shockPct: number;
  resultingCollateralUsd: number;
  resultingLtvPct: number;
  liquidationDistancePct: number;
  status: "survives" | "warning" | "liquidatable";
};

export function stressPosition(
  position: PositionSnapshot,
  shocks = [-10, -20, -30],
): StressScenario[] {
  return shocks.map((shockPct) => {
    const resultingCollateralUsd =
      position.collateralUsd * (1 + shockPct / 100);

    const stressed = evaluatePositionRisk({
      ...position,
      collateralUsd: resultingCollateralUsd,
    });

    return {
      name: `${Math.abs(shockPct)}% collateral drawdown`,
      shockPct,
      resultingCollateralUsd: Number(resultingCollateralUsd.toFixed(2)),
      resultingLtvPct: stressed.ltvPct,
      liquidationDistancePct: stressed.liquidationDistancePct,
      status:
        stressed.liquidationDistancePct <= 0
          ? "liquidatable"
          : stressed.liquidationDistancePct < 8
            ? "warning"
            : "survives",
    };
  });
}
