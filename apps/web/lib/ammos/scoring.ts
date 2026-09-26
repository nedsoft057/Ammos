import type { RiskLevel } from "./domain";

export const clamp = (n: number, min = 0, max = 100) =>
  Math.min(Math.max(n, min), max);

export function riskLevel(score: number): RiskLevel {
  if (score < 20) return "low";
  if (score < 45) return "moderate";
  if (score < 70) return "high";
  return "critical";
}

export function opportunityScore(
  netApyPct: number,
  riskScore: number,
  confidence = 1,
) {
  const returnComponent = clamp(netApyPct * 3.5);
  const riskPenalty = clamp(riskScore * 0.62);
  const confidenceBonus = clamp(confidence * 15);
  return Number(
    clamp(returnComponent - riskPenalty + confidenceBonus).toFixed(2),
  );
}

export function riskAdjustedApy(
  netApyPct: number,
  riskScore: number,
  confidence = 1,
) {
  const riskMultiplier = Math.max(0, 1 - clamp(riskScore) / 120);
  return Number((netApyPct * riskMultiplier * confidence).toFixed(3));
}
