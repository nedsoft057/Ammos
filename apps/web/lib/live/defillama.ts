import type { LiveYieldPool } from "./types";

const POOLS_URL = "https://yields.llama.fi/pools";
const PRICES_URL = "https://coins.llama.fi/prices/current/ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,ethereum:0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

export async function fetchLiveYieldPools(): Promise<LiveYieldPool[]> {
  const response = await fetch(POOLS_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`DeFiLlama pools request failed: ${response.status}`);

  const payload = await response.json() as { data?: Array<Record<string, unknown>> };
  const rows = Array.isArray(payload.data) ? payload.data : [];

  return rows
    .filter((row) => String(row.chain ?? "").toLowerCase() === "ethereum")
    .filter((row) => ["aave-v3", "uniswap-v3"].includes(String(row.project ?? "").toLowerCase()))
    .map((row) => ({
      pool: String(row.pool ?? ""),
      chain: String(row.chain ?? "Ethereum"),
      project: String(row.project ?? ""),
      symbol: String(row.symbol ?? ""),
      tvlUsd: Number(row.tvlUsd ?? 0),
      apy: row.apy == null ? null : Number(row.apy),
      apyBase: row.apyBase == null ? null : Number(row.apyBase),
      apyReward: row.apyReward == null ? null : Number(row.apyReward),
      apyMean30d: row.apyMean30d == null ? null : Number(row.apyMean30d),
      volume24hUsd: row.volumeUsd1d == null ? (row.volume24hUsd == null ? null : Number(row.volume24hUsd)) : Number(row.volumeUsd1d),
      il7dPct: row.il7d == null ? null : Number(row.il7d) * 100,
      stablecoin: Boolean(row.stablecoin),
      exposure: String(row.exposure ?? ""),
      url: typeof row.url === "string" ? row.url : undefined,
    }))
    .filter((row) => row.tvlUsd > 0 && row.symbol);
}

export async function fetchLivePrices(): Promise<Record<string, number>> {
  const response = await fetch(PRICES_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`DeFiLlama prices request failed: ${response.status}`);
  const payload = await response.json() as { coins?: Record<string, { price?: number }> };
  const coins = payload.coins ?? {};
  return {
    ETH: Number(coins["ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]?.price ?? 0),
    USDC: Number(coins["ethereum:0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]?.price ?? 0),
  };
}


export async function fetchLivePriceChanges24h(): Promise<Record<string, number>> {
  const ids = [
    "ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "ethereum:0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  ];
  const entries = await Promise.all(ids.map(async (id) => {
    const response = await fetch(`https://coins.llama.fi/chart/${id}?span=1`, { cache: "no-store" });
    if (!response.ok) return [id, 0] as const;
    const payload = await response.json() as { coins?: Record<string, { prices?: Array<[number, number]> }> };
    const points = payload.coins?.[id]?.prices ?? [];
    if (points.length < 2) return [id, 0] as const;
    const first = points[0][1];
    const last = points[points.length - 1][1];
    return [id, first > 0 ? ((last / first) - 1) * 100 : 0] as const;
  }));
  return { ETH: entries[0][1], USDC: entries[1][1] };
}
