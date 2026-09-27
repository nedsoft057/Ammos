export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type AssetSnapshot = {
  symbol: string;
  chain: string;
  priceUsd: number;
  volatility24h?: number;
  depegDistancePct?: number;
};

export type LendingMarketSnapshot = {
  id: string;
  protocol: string;
  chain: string;
  collateral: AssetSnapshot;
  borrowAsset: AssetSnapshot;
  supplyApyPct: number;
  borrowApyPct: number;
  totalSupplyUsd: number;
  totalBorrowUsd: number;
  liquidationThresholdPct: number;
  liquidationPenaltyPct: number;
};

export type LiquidityPoolSnapshot = {
  id: string;
  protocol: string;
  chain: string;
  token0: AssetSnapshot;
  token1: AssetSnapshot;
  tvlUsd: number;
  volume24hUsd: number;
  feeBps: number;
  aprPct: number;
  token0Weight: number;
  token1Weight: number;
  il7dPct?: number;
};

export type PositionSnapshot = {
  collateralUsd: number;
  debtUsd: number;
  liquidationLtvPct: number;
  collateralVolatilityPct: number;
  debtVolatilityPct: number;
  liquidationPenaltyPct: number;
  protocol?: string;
  market?: string;
};

export type Opportunity = {
  id: string;
  type: "lending" | "borrow" | "liquidity" | "staking" | "leveraged";
  protocol: string;
  chain: string;
  title: string;
  grossApyPct: number;
  estimatedCostPct: number;
  estimatedNetApyPct: number;
  riskScore: number;
  opportunityScore: number;
  confidence: number;
  reasons: string[];
  warnings: string[];
  evidence: string[];
  unknowns: string[];
};

export type MarketRegime = {
  label: "NORMAL" | "SIDEWAYS" | "VOLATILE" | "CRASH" | "LIQUIDITY_SHOCK";
  confidence: number;
  signals: string[];
  limitations: string[];
};

export type StressResult = {
  scenario: string;
  shockPct: number;
  score: number;
  survives: boolean;
  consequence: string;
};

export type ReviewResult = {
  status: "pass" | "watch" | "reject";
  objections: string[];
  invalidationConditions: string[];
};

export type ActionIntent = {
  status: "analysis_only" | "awaiting_user_approval" | "ready_for_wallet_signature";
  kind: "none" | "supply" | "provide_liquidity" | "borrow" | "withdraw";
  opportunityId?: string;
  protocol?: string;
  summary: string;
  requiresWalletSignature: true;
};

export type AgentAssessment = {
  summary: string;
  verdict: "strong" | "watch" | "avoid";
  confidence: number;
  opportunityScore: number;
  riskScore: number;
  reasoning: string[];
  actions: string[];
  warnings: string[];
};

export type MarketSnapshot = {
  asOf: string;
  source?: string;
  chain?: string;
  lending?: LendingMarketSnapshot[];
  liquidity?: LiquidityPoolSnapshot[];
  positions?: PositionSnapshot[];
};
