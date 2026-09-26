import { NextResponse } from "next/server";
import {
  buildDeterministicAssessment,
  discoverOpportunities,
  type MarketSnapshot,
} from "@/lib/ammos";
import { reasonWithGroq } from "@/lib/ai/groq";
import { getMemoryStore } from "@/lib/memory";

export async function POST(request: Request) {
  try {
    const snapshot = (await request.json()) as MarketSnapshot;

    if (!snapshot || typeof snapshot !== "object") {
      return NextResponse.json(
        { error: "Invalid market snapshot." },
        { status: 400 },
      );
    }

    const opportunities = discoverOpportunities(snapshot);
    const deterministicAssessment = buildDeterministicAssessment(
      opportunities,
      snapshot.positions?.[0],
    );

    const ai = await reasonWithGroq({
      opportunities: opportunities.slice(0, 10),
      deterministicAssessment,
    });

    const assessment = ai ?? deterministicAssessment;

    const memory = getMemoryStore();
    await memory.save({
      kind: "agent_run",
      key: `analysis:${snapshot.asOf}`,
      payload: {
        snapshot,
        opportunities,
        assessment,
        aiEnabled: Boolean(ai),
      },
    });

    return NextResponse.json({
      ok: true,
      source: ai ? "groq" : "deterministic",
      opportunities,
      assessment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AMMOS analysis failed.",
      },
      { status: 500 },
    );
  }
}
