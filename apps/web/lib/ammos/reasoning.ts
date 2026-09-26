import type {
  AgentAssessment,
  Opportunity,
  PositionSnapshot,
} from "./domain";
import { evaluatePositionRisk } from "./position-risk";

export function buildDeterministicAssessment(
  opportunities: Opportunity[],
  position?: PositionSnapshot,
): AgentAssessment {
  const top = opportunities[0];

  const reasoning: string[] = [];
  const warnings = opportunities
    .flatMap((item) => item.warnings)
    .slice(0, 5);

  if (top) {
    reasoning.push(
      `${top.title} currently ranks first with an opportunity score of ${top.opportunityScore}.`,
    );
    reasoning.push(...top.reasons);
  } else {
    reasoning.push("No evaluated opportunities are available.");
  }

  if (position) {
    const risk = evaluatePositionRisk(position);
    reasoning.push(
      `Current position LTV is ${risk.ltvPct.toFixed(2)}% with ${risk.liquidationDistancePct.toFixed(2)} percentage points of liquidation headroom.`,
    );
    warnings.push(...risk.warnings);
  }

  const riskScore = top?.riskScore ?? 100;
  const opportunityScore = top?.opportunityScore ?? 0;

  const verdict =
    opportunityScore >= 65 && riskScore < 55
      ? "strong"
      : opportunityScore >= 35 && riskScore < 75
        ? "watch"
        : "avoid";

  const actions =
    verdict === "strong"
      ? ["Validate current on-chain state before entering.", "Size the position against worst-case stress scenarios."]
      : verdict === "watch"
        ? ["Wait for better risk/reward or lower utilization.", "Recalculate before deploying capital."]
        : ["Do not enter on the current snapshot.", "Investigate liquidity, cost, and liquidation risks."];

  return {
    summary: top
      ? `${top.title} is the current highest-ranked opportunity.`
      : "AMMOS has insufficient market data to recommend a strategy.",
    verdict,
    confidence: top?.confidence ?? 0,
    opportunityScore,
    riskScore,
    reasoning,
    actions,
    warnings: [...new Set(warnings)].slice(0, 8),
  };
}
