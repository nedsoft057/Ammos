import type { Address } from "viem";
import { fetchLivePriceChanges24h, fetchLivePrices, fetchLiveYieldPools } from "./defillama";
import { readWallet } from "./ethereum";
import type { LiveMarketSnapshot } from "./types";

export async function getLiveSnapshot(address?: Address): Promise<LiveMarketSnapshot> {
  const [pools, prices, priceChanges24h, wallet] = await Promise.all([
    fetchLiveYieldPools(),
    fetchLivePrices(),
    fetchLivePriceChanges24h().catch(() => ({})),
    address ? readWallet(address) : Promise.resolve(undefined),
  ]);

  return {
    asOf: new Date().toISOString(),
    source: "DeFiLlama + Ethereum RPC",
    chain: "Ethereum",
    pools,
    prices,
    priceChanges24h,
    wallet,
  };
}
