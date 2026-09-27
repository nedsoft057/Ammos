import type { LiveYieldPool } from "../live/types";
import type { MarketRegime } from "./domain";

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export function classifyMarketRegime(pools: LiveYieldPool[], priceChanges24h: Record<string, number> = {}): MarketRegime {
  const valid = pools.filter((p) => Number.isFinite(p.tvlUsd) && p.tvlUsd > 0);
  if (!valid.length) {
    return { label: "NORMAL", confidence: 0, signals: [], limitations: ["No live protocol observations were available."] };
  }

  const tvls = valid.map((p) => p.tvlUsd).sort((a, b) => b - a);
  const totalTvl = tvls.reduce((a, b) => a + b, 0);
  const top5Share = totalTvl > 0 ? tvls.slice(0, 5).reduce((a, b) => a + b, 0) / totalTvl : 1;
  const apys = valid.map((p) => p.apy).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const meanApy = apys.length ? apys.reduce((a, b) => a + b, 0) / apys.length : 0;
  const highApyShare = apys.length ? apys.filter((v) => v > Math.max(20, meanApy * 1.8)).length / apys.length : 0;
  const stableShare = valid.filter((p) => p.stablecoin).reduce((sum, p) => sum + p.tvlUsd, 0) / Math.max(totalTvl, 1);
  const lowLiquidityShare = valid.filter((p) => p.tvlUsd < 1_000_000).reduce((sum, p) => sum + p.tvlUsd, 0) / Math.max(totalTvl, 1);
  const ethChange24h = Number(priceChanges24h.ETH ?? 0);

  const signals: string[] = [];
  if (top5Share > 0.75) signals.push(`liquidity is concentrated: top five records represent ${(top5Share * 100).toFixed(0)}% of observed TVL`);
  if (highApyShare > 0.2) signals.push(`${(highApyShare * 100).toFixed(0)}% of APY-bearing records are yield outliers`);
  if (stableShare > 0.7) signals.push(`stablecoin pools represent ${(stableShare * 100).toFixed(0)}% of observed TVL`);
  if (lowLiquidityShare > 0.35) signals.push(`a large share of observed TVL sits in lower-liquidity records`);
  if (Number.isFinite(ethChange24h) && Math.abs(ethChange24h) >= 8) signals.push(`ETH moved ${ethChange24h.toFixed(1)}% over the live 24h price window`);

  let label: MarketRegime = { label: "NORMAL", confidence: 0.55, signals, limitations: ["Regime classification is based on live cross-sectional liquidity/yield structure plus a 24h ETH price change. It is not a full historical regime model."] };
  if (ethChange24h <= -12) label = { ...label, label: "CRASH", confidence: clamp(0.72 + Math.abs(ethChange24h) / 100), signals };
  else if (top5Share > 0.85 && lowLiquidityShare > 0.35) label = { ...label, label: "LIQUIDITY_SHOCK", confidence: clamp(0.55 + lowLiquidityShare * 0.4), signals };
  else if (Math.abs(ethChange24h) >= 8 || highApyShare > 0.35) label = { ...label, label: "VOLATILE", confidence: clamp(0.55 + Math.max(Math.abs(ethChange24h) / 100, highApyShare) * 0.45), signals };
  else if (stableShare > 0.8 && highApyShare < 0.1) label = { ...label, label: "SIDEWAYS", confidence: 0.68, signals };

  return label;
}
