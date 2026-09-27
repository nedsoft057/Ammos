import type { Address } from "viem";
import { getLiveSnapshot } from "../live/snapshot";
import { getMemoryStore } from "../memory";
import type { ActionIntent, AgentAssessment, MarketRegime, Opportunity, ReviewResult, StressResult } from "./domain";
import { discoverLiveOpportunities } from "./live-adapter";
import { buildDeterministicAssessment } from "./reasoning";
import { classifyMarketRegime } from "./regime";
import { reviewOpportunity } from "./review";
import { stressOpportunity, stressPosition } from "./stress";
import { evaluatePositionRisk, type PositionRisk } from "./position-risk";
import type { PositionSnapshot } from "./domain";

export type DecisionTrace = {
  id: string;
  snapshot: Awaited<ReturnType<typeof getLiveSnapshot>>;
  regime: MarketRegime;
  opportunities: Opportunity[];
  stress: Record<string, StressResult[]>;
  review: Record<string, ReviewResult>;
  assessment: AgentAssessment;
  memory: { key: string; createdAt?: string; payload: Record<string, unknown> }[];
  action: ActionIntent;
  positionRisk?: PositionRisk;
  positionStress?: ReturnType<typeof stressPosition>;
};

function buildActionIntent(top: Opportunity | undefined, review: ReviewResult | undefined, address?: Address): ActionIntent {
  if (!top || !review || review.status === "reject") {
    return { status: "analysis_only", kind: "none", summary: "No executable intent is formed because the current thesis does not clear the deterministic review gate.", requiresWalletSignature: true };
  }
  const kind = top.type === "liquidity" ? "provide_liquidity" : top.type === "lending" ? "supply" : "none";
  if (!address) {
    return { status: "awaiting_user_approval", kind, opportunityId: top.id, protocol: top.protocol, summary: `AMMOS has a reviewed ${top.type} thesis, but no wallet is connected. No transaction can be created.`, requiresWalletSignature: true };
  }
  return { status: "awaiting_user_approval", kind, opportunityId: top.id, protocol: top.protocol, summary: "A wallet is present, but AMMOS still requires explicit user approval and a protocol-specific transaction builder before anything can be signed.", requiresWalletSignature: true };
}

export async function buildDecisionTrace(address?: Address, options: { persist?: boolean } = {}): Promise<DecisionTrace> {
  const snapshot = await getLiveSnapshot(address);
  const opportunities = discoverLiveOpportunities(snapshot);
  const regime = classifyMarketRegime(snapshot.pools, snapshot.priceChanges24h);
  const stress = Object.fromEntries(opportunities.slice(0, 12).map((opportunity) => [opportunity.id, stressOpportunity(opportunity)]));
  const review = Object.fromEntries(opportunities.slice(0, 12).map((opportunity) => [opportunity.id, reviewOpportunity(opportunity, regime, stress[opportunity.id] ?? [])]));
  const aave = snapshot.wallet?.aaveV3;
  const position: PositionSnapshot | undefined = aave && (Number(aave.collateralUsd) > 0 || Number(aave.debtUsd) > 0) ? {
    collateralUsd: Number(aave.collateralUsd),
    debtUsd: Number(aave.debtUsd),
    liquidationLtvPct: Number(aave.liquidationThresholdPct),
    collateralVolatilityPct: 0,
    debtVolatilityPct: 0,
    liquidationPenaltyPct: 5,
    protocol: "Aave V3",
    market: "Ethereum",
  } : undefined;
  const positionRisk = position ? evaluatePositionRisk(position) : undefined;
  const positionStress = position ? stressPosition(position) : undefined;
  const deterministic = buildDeterministicAssessment(opportunities, position, regime, review, stress);
  const [agentRuns, observations, strategies] = await Promise.all([
    getMemoryStore().recent("agent_run", 8).catch(() => []),
    getMemoryStore().recent("observation", 6).catch(() => []),
    getMemoryStore().recent("strategy", 6).catch(() => []),
  ]);
  const memories = [...agentRuns, ...observations, ...strategies]
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    .slice(0, 12);
  const action = buildActionIntent(opportunities[0], opportunities[0] ? review[opportunities[0].id] : undefined, address);
  const id = `decision:${snapshot.asOf}`;

  const trace: DecisionTrace = {
    id,
    snapshot,
    regime,
    opportunities,
    stress,
    review,
    assessment: deterministic,
    memory: memories.map((m) => ({ key: m.key, createdAt: m.createdAt, payload: m.payload })),
    action,
    positionRisk,
    positionStress,
  };

  if (options.persist) {
    await getMemoryStore().save({
      kind: "observation",
      key: id,
      payload: { asOf: snapshot.asOf, source: snapshot.source, regime, lead: opportunities[0]?.id ?? null, marketCount: snapshot.pools.length, walletConnected: Boolean(address) },
    }).catch(() => undefined);
    if (opportunities[0]) {
      await getMemoryStore().save({
        kind: "strategy",
        key: `${id}:strategy:${opportunities[0].id}`,
        payload: { opportunity: opportunities[0], review: review[opportunities[0].id], stress: stress[opportunities[0].id] ?? [], regime },
      }).catch(() => undefined);
    }
    await getMemoryStore().save({
      kind: "agent_run",
      key: id,
      payload: { assessment: trace.assessment, regime, positionRisk, positionStress, lead: opportunities[0] ?? null, review: opportunities[0] ? review[opportunities[0].id] : null, stress: opportunities[0] ? stress[opportunities[0].id] : [], action },
    }).catch(() => undefined);
  }

  return trace;
}
