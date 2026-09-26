import { Strategy } from "./types";

export const strategies: Strategy[] = [
  {
    id: "usdc-lending",
    name: "USDC Lending",
    type: "LENDING",
    protocol: "Aave",
    asset: "USDC",
    expectedApy: 9.6,
    riskAdjusted: 8.9,
    worstCase: -0.4,
    liquidity: 96,
    il: 0,
    breachProbability: 1,
    risk: "LOW",
    verdict: "APPROVED",
    thesis: "Stable yield with low directional exposure and deep exit liquidity."
  },
  {
    id: "eth-usdc",
    name: "ETH / USDC Concentrated LP",
    type: "LIQUIDITY",
    protocol: "AMM",
    asset: "ETH/USDC",
    expectedApy: 16.82,
    riskAdjusted: 11.34,
    worstCase: -4.2,
    liquidity: 84,
    il: -2.8,
    breachProbability: 18,
    risk: "MEDIUM",
    verdict: "CONDITIONAL",
    thesis: "Strong fee opportunity, but range sensitivity increases downside in a sharp ETH move."
  },
  {
    id: "leveraged-yield",
    name: "ETH Collateral Loop",
    type: "BORROWING",
    protocol: "Lending Market",
    asset: "ETH → USDC",
    expectedApy: 19.4,
    riskAdjusted: 7.2,
    worstCase: -7.81,
    liquidity: 71,
    il: 0,
    breachProbability: 31,
    risk: "HIGH",
    verdict: "REJECTED",
    thesis: "Positive spread is overwhelmed by liquidation and drawdown risk under the current mandate."
  },
  {
    id: "staking",
    name: "ETH Staking",
    type: "STAKING",
    protocol: "Validator Set",
    asset: "ETH",
    expectedApy: 4.1,
    riskAdjusted: 3.8,
    worstCase: -1.8,
    liquidity: 79,
    il: 0,
    breachProbability: 3,
    risk: "LOW",
    verdict: "APPROVED",
    thesis: "Lower return, but strong fit for passive directional ETH exposure."
  }
];

export const memory = [
  ["M-042", "High advertised APY + declining organic volume", "Fee yield was overstated", "Increase volume-decay penalty"],
  ["M-041", "Stablecoin lending, high utilization", "Exit remained available", "Low-risk yield held"],
  ["M-040", "Narrow ETH/USDC range", "Range breached sooner than baseline", "Widen range under rising volatility"],
  ["M-039", "Leveraged collateral loop", "Stress case violated mandate", "Reject above 25% liquidation proximity"]
];

export const terminalEvents = [
  ["> boot", "AMMOS orchestration layer online"],
  ["> observe", "147 opportunities discovered across monitored venues"],
  ["> filter", "31 candidates remain after liquidity and asset-quality checks"],
  ["> simulate", "5 market regimes × 31 candidates"],
  ["> risk", "18 candidates rejected by deterministic risk gates"],
  ["> critique", "ETH/USDC LP challenged on range-breach sensitivity"],
  ["> revise", "Expected fee yield haircut applied"],
  ["> decision", "Strategy #004 selected: conditional ETH/USDC LP"],
  ["> memory", "Decision and rationale committed to strategy memory"]
];
