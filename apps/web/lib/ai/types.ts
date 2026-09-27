import type { AgentAssessment, MarketRegime, Opportunity, ReviewResult, StressResult } from "../ammos/domain";

export type AIReasoningRequest = {
  opportunities: Opportunity[];
  deterministicAssessment: AgentAssessment;
  regime?: MarketRegime;
  reviews?: Record<string, ReviewResult>;
  stress?: Record<string, StressResult[]>;
  memory?: Array<{ key: string; createdAt?: string; payload: Record<string, unknown> }>;
  userQuestion?: string;
};

export type AIReasoningResponse = {
  summary: string;
  verdict: "strong" | "watch" | "avoid";
  confidence: number;
  thesis: string[];
  actions: string[];
  caveats: string[];
};
