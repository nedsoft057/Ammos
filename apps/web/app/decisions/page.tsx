import Link from "next/link";
import { Header } from "@/components/Header";
import { buildDecisionTrace } from "@/lib/ammos/decision";

export const dynamic = "force-dynamic";

export default async function Decisions() {
  let trace: Awaited<ReturnType<typeof buildDecisionTrace>> | null = null;
  let error: string | null = null;
  try { trace = await buildDecisionTrace(); } catch (e) { error = e instanceof Error ? e.message : "Live decision inputs unavailable."; }
  return <div><Header eyebrow="AMMOS / canonical decision engine" title="Decisions." />
    <p className="subtle max-w-3xl mb-6">One trace now connects observation, normalization, regime classification, opportunity scoring, risk, stress, adversarial review and action gating. It does not claim an executed trade.</p>
    {error ? <section className="panel p-6">{error}</section> : trace && <>
      <section className="grid md:grid-cols-4 gap-3 mb-6">
        <Metric label="Regime" value={trace.regime.label} />
        <Metric label="Lead score" value={String(trace.assessment.opportunityScore)} />
        <Metric label="Lead risk" value={String(trace.assessment.riskScore)} />
        <Metric label="Action" value={trace.action.status.replace(/_/g, " ").toUpperCase()} />
      </section>
      <section className="panel p-6 mb-6"><div className="kicker">Decision thesis</div><h2 className="text-2xl mt-2">{trace.assessment.summary}</h2><div className="grid md:grid-cols-2 gap-6 mt-5"><div><div className="kicker">Reasoning</div><ul className="mt-3 space-y-2 text-sm text-[#b9c0ca]">{trace.assessment.reasoning.slice(0,7).map((x,i)=><li key={i}>· {x}</li>)}</ul></div><div><div className="kicker">Action boundary</div><p className="text-sm text-[#b9c0ca] mt-3">{trace.action.summary}</p><div className="kicker mt-5">Invariants</div><p className="text-xs text-[#858c98] mt-2">No transaction is prepared or signed by ranking alone. Wallet signature remains the final execution boundary.</p></div></div></section>
      <div className="space-y-3">{trace.opportunities.slice(0,12).map((op,i)=>{const review=trace.review[op.id]; const failed=(trace.stress[op.id]??[]).filter(s=>!s.survives).length; return <Link href={`/strategies/${encodeURIComponent(op.id)}`} key={op.id} className="panel panel-hover p-5 flex flex-col md:flex-row md:items-center gap-5"><div className="w-12 text-2xl metric text-[#d9ff65]">{String(i+1).padStart(2,"0")}</div><div className="flex-1"><div className="kicker">{op.protocol} · {op.chain}</div><h2 className="text-lg mt-1">{op.title}</h2><div className="text-xs text-[#858c98] mt-2">APY {op.grossApyPct.toFixed(2)}% · risk {op.riskScore} · confidence {Math.round(op.confidence*100)}%</div></div><div className="md:w-32"><div className="kicker">review</div><div className="text-sm mt-2">{review?.status?.toUpperCase()}</div></div><div className="md:w-32"><div className="kicker">stress</div><div className="text-sm mt-2">{failed ? `${failed} fail` : "survives"}</div></div><div className="text-[#858c98] text-sm">→</div></Link>})}</div>
    </>}
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-xl mt-2">{value}</div></div>; }
