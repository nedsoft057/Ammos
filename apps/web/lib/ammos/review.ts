import type { MarketRegime, Opportunity, ReviewResult, StressResult } from "./domain";

export function reviewOpportunity(opportunity: Opportunity, regime: MarketRegime, stress: StressResult[]): ReviewResult {
  const objections: string[] = [];
  const invalidationConditions: string[] = [];
  if (opportunity.confidence < 0.65) objections.push("Too much required input is missing to treat this as a high-confidence thesis.");
  if (opportunity.riskScore >= 70) objections.push("The deterministic risk gate is already high or critical.");
  if (regime.label === "LIQUIDITY_SHOCK") objections.push("Current liquidity conditions make exit assumptions less reliable.");
  if (regime.label === "VOLATILE" && opportunity.type === "liquidity") objections.push("Volatility regime increases path-dependent LP and IL risk.");
  if (opportunity.warnings.some((w) => /APY|reward/i.test(w))) objections.push("Headline yield may be less durable than the headline number suggests.");
  const yieldOutlier = opportunity.warnings.some((w) => /materially above/i.test(w));

  invalidationConditions.push("Observed APY falls materially while TVL or liquidity deteriorates.");
  invalidationConditions.push("A protocol-specific position check reveals debt, collateral, or exit constraints not represented in the market feed.");
  if (stress.some((s) => !s.survives)) invalidationConditions.push("Stress scenarios produce a non-surviving outcome under the modeled shock.");

  const status = opportunity.riskScore >= 82 || stress.filter((s) => !s.survives).length >= 2
    ? "reject"
    : yieldOutlier || objections.length >= 2 || stress.some((s) => !s.survives)
      ? "watch"
      : "pass";

  return { status, objections: [...new Set(objections)], invalidationConditions: [...new Set(invalidationConditions)] };
}
