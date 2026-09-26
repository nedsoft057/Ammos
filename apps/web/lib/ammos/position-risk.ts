import { clamp, riskLevel } from "./scoring";
import type { PositionSnapshot } from "./domain";

export type PositionRisk = {
  ltvPct: number;
  liquidationDistancePct: number;
  score: number;
  level: ReturnType<typeof riskLevel>;
  warnings: string[];
};

export function evaluatePositionRisk(
  position: PositionSnapshot,
): PositionRisk {
  const ltvPct =
    position.collateralUsd <= 0
      ? 100
      : (position.debtUsd / position.collateralUsd) * 100;

  // This is actual position LTV versus the liquidation threshold.
  const liquidationDistancePct =
    position.liquidationLtvPct - ltvPct;

  const distanceRisk =
    liquidationDistancePct <= 0
      ? 100
      : clamp(100 - liquidationDistancePct * 3);

  const volatilityRisk = clamp(
    position.collateralVolatilityPct * 2.2,
  );

  const debtRisk = clamp(position.debtVolatilityPct * 1.4);

  const score = Number(
    clamp(
      distanceRisk * 0.58 +
        volatilityRisk * 0.27 +
        debtRisk * 0.15,
    ).toFixed(2),
  );

  const warnings: string[] = [];

  if (liquidationDistancePct <= 0) {
    warnings.push("Position is at or beyond the liquidation threshold.");
  } else if (liquidationDistancePct < 5) {
    warnings.push("Very little liquidation headroom remains.");
  } else if (liquidationDistancePct < 12) {
    warnings.push("Liquidation headroom is becoming uncomfortable.");
  }

  if (position.collateralVolatilityPct > 8) {
    warnings.push("Collateral volatility can rapidly compress liquidation headroom.");
  }

  return {
    ltvPct: Number(ltvPct.toFixed(3)),
    liquidationDistancePct: Number(
      liquidationDistancePct.toFixed(3),
    ),
    score,
    level: riskLevel(score),
    warnings,
  };
}
