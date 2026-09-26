import type { AgentAssessment, Opportunity } from "../ammos/domain";

export type AIReasoningRequest = {
  opportunities: Opportunity[];
  deterministicAssessment: AgentAssessment;
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
