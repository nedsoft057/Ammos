import { Header } from "@/components/Header";
import { buildDecisionTrace } from "@/lib/ammos/decision";

export const dynamic = "force-dynamic";

export default async function Terminal() {
  let trace: Awaited<ReturnType<typeof buildDecisionTrace>> | null = null;
  let error: string | null = null;
  try { trace = await buildDecisionTrace(); } catch (e) { error = e instanceof Error ? e.message : "Live feed unavailable."; }
  return <div><Header eyebrow="AMMOS / canonical live trace" title="Terminal." />
    <div className="panel overflow-hidden"><div className="border-b border-[#242932] px-5 py-4 flex justify-between"><div className="kicker">decision trace · one source of truth</div><div className="text-[10px] text-[#d9ff65]">● LIVE</div></div>
      <div className="p-5 md:p-8 font-mono text-sm space-y-4">{error ? <div><span className="text-[#ff7272]">&gt; error </span><span className="text-[#b9c0ca]">{error}</span></div> : trace && <>
        <div><span className="text-[#d9ff65]">&gt; observe </span><span className="text-[#b9c0ca]">{trace.snapshot.pools.length} live Ethereum records · {trace.snapshot.source}</span></div>
        <div><span className="text-[#d9ff65]">&gt; normalize </span><span className="text-[#b9c0ca]">{trace.opportunities.length} candidates entered the canonical AMMOS opportunity model</span></div>
        <div><span className="text-[#d9ff65]">&gt; regime </span><span className="text-[#b9c0ca]">{trace.regime.label} · confidence {Math.round(trace.regime.confidence*100)}%</span></div>
        {trace.opportunities.slice(0,5).map((op)=><div key={op.id}><span className="text-[#d9ff65]">&gt; candidate </span><span className="text-[#b9c0ca]">{op.title} · score {op.opportunityScore} · risk {op.riskScore} · review {trace.review[op.id]?.status}</span></div>)}
        <div><span className="text-[#d9ff65]">&gt; stress </span><span className="text-[#b9c0ca]">{trace.opportunities[0] ? (trace.stress[trace.opportunities[0].id]??[]).map(s=>`${s.scenario}: ${s.survives?"survives":"fails"}`).join(" · ") : "no lead"}</span></div>
        <div><span className="text-[#d9ff65]">&gt; decide </span><span className="text-[#b9c0ca]">{trace.assessment.verdict} · {trace.assessment.summary}</span></div>
        <div><span className="text-[#d9ff65]">&gt; action </span><span className="text-[#b9c0ca]">{trace.action.status} · {trace.action.summary}</span></div>
        <div className="border-t border-[#242932] pt-5 mt-7"><span className="text-[#d9ff65]">AMMOS → </span><span className="text-[#b9c0ca]">no transaction is created or executed until a real connected wallet receives an explicit protocol-specific request and the user signs it.</span></div>
      </>}</div>
    </div>
  </div>;
}
