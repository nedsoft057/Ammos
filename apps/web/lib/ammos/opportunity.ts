import type { MarketSnapshot, Opportunity } from "./domain";
import { evaluateLendingMarket } from "./lending";
import { evaluateLiquidityPool } from "./liquidity";

export function discoverOpportunities(
  snapshot: MarketSnapshot,
): Opportunity[] {
  const opportunities: Opportunity[] = [];

  for (const market of snapshot.lending ?? []) {
    opportunities.push(evaluateLendingMarket(market));
  }

  for (const pool of snapshot.liquidity ?? []) {
    opportunities.push(evaluateLiquidityPool(pool));
  }

  return opportunities.sort(
    (a, b) => b.opportunityScore - a.opportunityScore,
  );
}
