import { Regime, RiskLevel, Strategy } from "./types";

export const regimeShock: Record<Regime, number> = {
  NORMAL: 1,
  SIDEWAYS: 0.78,
  VOLATILE: 0.46,
  CRASH: -0.72,
  LIQUIDITY_SHOCK: -0.95
};

export function stress(strategy: Strategy, regime: Regime) {
  const shock = regimeShock[regime];
  const feeComponent = strategy.expectedApy * 0.12;
  const downside = Math.abs(strategy.worstCase) * Math.max(0, -shock);
  const result = strategy.expectedApy * (0.42 + Math.max(shock, 0) * 0.58) - downside * 1.4 - feeComponent;
  return Number(result.toFixed(2));
}

export function scoreRisk(strategy: Strategy): RiskLevel {
  const score =
    (strategy.expectedApy > 18 ? 2 : 0) +
    (strategy.breachProbability > 25 ? 2 : strategy.breachProbability > 15 ? 1 : 0) +
    (Math.abs(strategy.worstCase) > 6 ? 2 : Math.abs(strategy.worstCase) > 3 ? 1 : 0) +
    (strategy.liquidity < 75 ? 1 : 0);

  if (score >= 6) return "CRITICAL";
  if (score >= 4) return "HIGH";
  if (score >= 2) return "MEDIUM";
  return "LOW";
}
