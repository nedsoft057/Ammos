import { NextResponse } from "next/server";
import { isAddress, type Address } from "viem";
import { buildDecisionTrace } from "@/lib/ammos/decision";
import { chatWithGroq } from "@/lib/ai/groq";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body?.question === "string"
    ? body.question.trim()
    : typeof body?.message === "string"
      ? body.message.trim()
      : "";
  const address = typeof body?.address === "string" && isAddress(body.address)
    ? body.address as Address
    : undefined;

  if (!question) return NextResponse.json({ ok: false, error: "Ask AMMOS a question." }, { status: 400 });

  try {
    const trace = await buildDecisionTrace(address, { persist: true });
    const answer = await chatWithGroq({
      question,
      context: {
        decisionTraceId: trace.id,
        observedAt: trace.snapshot.asOf,
        source: trace.snapshot.source,
        regime: trace.regime,
        opportunities: trace.opportunities.slice(0, 10),
        leadReview: trace.opportunities[0] ? trace.review[trace.opportunities[0].id] : null,
        leadStress: trace.opportunities[0] ? trace.stress[trace.opportunities[0].id] : [],
        assessment: trace.assessment,
        action: trace.action,
        positionRisk: trace.positionRisk ?? null,
        positionStress: trace.positionStress ?? [],
        recentMemory: trace.memory.slice(0, 5),
        wallet: trace.snapshot.wallet ? {
          address: trace.snapshot.wallet.address,
          ethBalance: trace.snapshot.wallet.ethBalance,
          wethBalance: trace.snapshot.wallet.wethBalance,
          usdcBalance: trace.snapshot.wallet.usdcBalance,
        } : null,
      },
    }).catch(() => null);

    if (answer) {
      return NextResponse.json({ ok: true, answer, source: "groq", trace });
    }

    const { assessment } = trace;
    const lead = trace.opportunities[0];
    const review = lead ? trace.review[lead.id] : undefined;
    const fallback = `**AMMOS decision trace**

${assessment.summary}

**Regime:** ${trace.regime.label} (${Math.round(trace.regime.confidence * 100)}% confidence)

**Lead:** ${lead ? `${lead.protocol} / ${lead.title}` : "none"}
**Opportunity:** ${assessment.opportunityScore}/100
**Risk:** ${assessment.riskScore}/100
**Review:** ${review?.status ?? "unreviewed"}

${assessment.reasoning.slice(0, 5).map((line) => `- ${line}`).join("\n")}

**Action boundary:** ${trace.action.summary}

No transaction has been created or executed.`;

    return NextResponse.json({ ok: true, answer: fallback, source: "deterministic", trace });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Agent unavailable." }, { status: 503 });
  }
}
