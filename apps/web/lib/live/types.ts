export type LiveYieldPool = {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
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
  wallet?: {
    address: string;
    ethBalance: string;
    wethBalance: string;
    usdcBalance: string;
  };
};
