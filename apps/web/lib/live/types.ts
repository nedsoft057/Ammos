export type LiveYieldPool = {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  apyMean30d?: number | null;
  volume24hUsd?: number | null;
  il7dPct?: number | null;
  stablecoin: boolean;
  exposure: string;
  url?: string;
};

export type LiveMarketSnapshot = {
  asOf: string;
  source: string;
  chain: "Ethereum";
  pools: LiveYieldPool[];
  prices: Record<string, number>;
  priceChanges24h?: Record<string, number>;
  wallet?: {
    address: string;
    ethBalance: string;
    wethBalance: string;
    usdcBalance: string;
    aaveV3?: {
      collateralUsd: string;
      debtUsd: string;
      availableBorrowsUsd: string;
      ltvPct: string;
      liquidationThresholdPct: string;
      healthFactor: string;
    };
  };
};
