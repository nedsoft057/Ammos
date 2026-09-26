import type { Address } from "viem";
import { fetchLivePrices, fetchLiveYieldPools } from "./defillama";
import { readWallet } from "./ethereum";
import type { LiveMarketSnapshot } from "./types";

export async function getLiveSnapshot(address?: Address): Promise<LiveMarketSnapshot> {
  const [pools, prices, wallet] = await Promise.all([
    fetchLiveYieldPools(),
    fetchLivePrices(),
    address ? readWallet(address) : Promise.resolve(undefined),
  ]);

  return {
    asOf: new Date().toISOString(),
    source: "DeFiLlama + Ethereum RPC",
    chain: "Ethereum",
    pools,
    prices,
    wallet,
  };
}
