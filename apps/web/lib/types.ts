export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Regime = "NORMAL" | "SIDEWAYS" | "VOLATILE" | "CRASH" | "LIQUIDITY_SHOCK";

export type Strategy = {
  id: string;
  name: string;
  type: string;
  protocol: string;
  asset: string;
  expectedApy: number;
  riskAdjusted: number;
  worstCase: number;
  liquidity: number;
  il: number;
  breachProbability: number;
  risk: RiskLevel;
  verdict: "APPROVED" | "CONDITIONAL" | "REJECTED";
  thesis: string;
};
