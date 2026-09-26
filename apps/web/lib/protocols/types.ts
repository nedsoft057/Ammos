export type ProtocolType =
  | "lending"
  | "liquidity"
  | "staking"
  | "restaking"
  | "vault"
  | "perpetuals";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type Asset = {
  symbol: string;
  address?: string;
  chain: string;
  priceUsd: number;
  volatility24h?: number;
};

export type LendingMarket = {
  id: string;
  protocol: string;
  chain: string;
  collateralAsset: Asset;
  borrowAsset: Asset;

  supplyApy: number;
  borrowApy: number;

  totalSupplyUsd: number;
  totalBorrowUsd: number;
  utilization: number;

  liquidationThreshold: number;
  liquidationPenalty: number;

  canBorrow: boolean;
  canSupply: boolean;
};

export type LiquidityPool = {
  id: string;
  protocol: string;
  chain: string;

  token0: Asset;
  token1: Asset;

  tvlUsd: number;
  volume24hUsd: number;

  feeBps: number;
  apr: number;

  token0Weight: number;
  token1Weight: number;

  volatility24h?: number;
};

export type StakingOpportunity = {
  id: string;
  protocol: string;
  chain: string;
  asset: Asset;

  apy: number;
  tvlUsd: number;

  validatorCommission?: number;
  unbondingDays?: number;
  slashingRisk?: RiskLevel;
};

export type Strategy = {
  id: string;
  name: string;
  protocol: string;
  chain: string;
  type: ProtocolType;

  capitalUsd: number;

  grossApy: number;
  estimatedCosts: number;
  estimatedIl?: number;

  netApy: number;

  riskScore: number;
  confidence: number;

  liquidationDistance?: number;
  utilization?: number;
  depegSensitivity?: number;

  reasoning: string[];
};
