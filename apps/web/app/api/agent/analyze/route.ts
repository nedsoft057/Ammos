import { NextResponse } from "next/server";
import { isAddress, type Address } from "viem";
import { buildDecisionTrace } from "@/lib/ammos/decision";
import { reasonWithGroq } from "@/lib/ai/groq";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const address = typeof body?.address === "string" && isAddress(body.address)
      ? body.address as Address
      : undefined;
    const trace = await buildDecisionTrace(address, { persist: true });
    const ai = await reasonWithGroq({
      opportunities: trace.opportunities.slice(0, 10),
      deterministicAssessment: trace.assessment,
      regime: trace.regime,
      reviews: trace.review,
      stress: trace.stress,
      memory: trace.memory,
      userQuestion: typeof body?.question === "string" ? body.question : undefined,
    }).catch(() => null);

    return NextResponse.json({
      ok: true,
      source: ai ? "groq" : "deterministic",
      trace,
      assessment: ai ? { ...trace.assessment, summary: ai.summary, reasoning: ai.thesis, actions: ai.actions, warnings: ai.caveats } : trace.assessment,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AMMOS analysis failed." }, { status: 500 });
  }
}
