import type { AgentAssessment, MarketRegime, Opportunity, PositionSnapshot, ReviewResult, StressResult } from "./domain";
import { evaluatePositionRisk } from "./position-risk";

export function buildDeterministicAssessment(
  opportunities: Opportunity[],
  position?: PositionSnapshot,
  regime?: MarketRegime,
  reviews: Record<string, ReviewResult> = {},
  stress: Record<string, StressResult[]> = {},
): AgentAssessment {
  const top = opportunities[0];
  const review = top ? reviews[top.id] : undefined;
  const stressResults = top ? stress[top.id] ?? [] : [];
  const reasoning: string[] = [];
  const warnings = top ? [...top.warnings] : [];

  if (regime) reasoning.push(`Current market regime proxy: ${regime.label} (${Math.round(regime.confidence * 100)}% confidence).`);
  if (top) {
    reasoning.push(`${top.title} currently ranks first with an opportunity score of ${top.opportunityScore}.`);
    reasoning.push(...top.reasons);
    reasoning.push(`Deterministic review status: ${review?.status ?? "unreviewed"}.`);
    if (review?.objections.length) reasoning.push(...review.objections);
    const failed = stressResults.filter((s) => !s.survives);
    if (failed.length) reasoning.push(`${failed.length} modeled market stress scenario(s) fail the current gate.`);
  } else {
    reasoning.push("No evaluated opportunities are available from the live observation surface.");
  }

  let positionRiskScore = 0;
  if (position) {
    const risk = evaluatePositionRisk(position);
    positionRiskScore = risk.score;
    reasoning.push(`Verified ${position.protocol ?? "protocol"} position LTV is ${risk.ltvPct.toFixed(2)}% with ${risk.liquidationDistancePct.toFixed(2)} percentage points of liquidation headroom.`);
    warnings.push(...risk.warnings);
  }

  const marketRisk = top?.riskScore ?? 100;
  const riskScore = position ? Math.max(marketRisk, positionRiskScore) : marketRisk;
  const opportunityScore = top?.opportunityScore ?? 0;
  const verdict = !top || review?.status === "reject" || opportunityScore < 35 || riskScore >= 75
    ? "avoid"
    : review?.status === "watch" || opportunityScore < 65 || riskScore >= 55
      ? "watch"
      : "strong";

  const actions = verdict === "strong"
    ? ["Validate protocol-specific state before entry.", "Review the stress cases and invalidation conditions.", "Require explicit user approval before any wallet action."]
    : verdict === "watch"
      ? ["Wait for better risk/reward or stronger evidence.", "Recalculate against fresh live state before deploying capital.", "Do not treat the current headline yield as durable by default."]
      : ["Do not enter on the current snapshot.", "Investigate the failed risk/review gates before forming an action intent."];

  return {
    summary: top ? `${top.title} is the current highest-ranked live candidate, subject to the review and stress gates.` : "AMMOS has insufficient live evidence to recommend a strategy.",
    verdict,
    confidence: top?.confidence ?? 0,
    opportunityScore,
    riskScore,
    reasoning,
    actions,
    warnings: [...new Set([...warnings, ...(regime?.limitations ?? []), ...(review?.invalidationConditions ?? [])])].slice(0, 10),
  };
}
