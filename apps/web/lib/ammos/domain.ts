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
};

export type PositionSnapshot = {
  collateralUsd: number;
  debtUsd: number;
  liquidationLtvPct: number;
  collateralVolatilityPct: number;
  debtVolatilityPct: number;
  liquidationPenaltyPct: number;
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
  lending?: LendingMarketSnapshot[];
  liquidity?: LiquidityPoolSnapshot[];
  positions?: PositionSnapshot[];
};
