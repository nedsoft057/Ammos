import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { buildDecisionTrace } from "@/lib/ammos/decision";

export const dynamic = "force-dynamic";

export default async function StrategyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trace = await buildDecisionTrace();
  const op = trace.opportunities.find(item => item.id === id);
  if (!op) notFound();
  const review = trace.review[op.id];
  const stress = trace.stress[op.id] ?? [];
  const source = trace.snapshot.pools.find(p => `live:${p.pool}` === op.id);

  return <div><Header eyebrow={`AMMOS / decision / ${op.protocol.toLowerCase()}`} title={op.title} />
    <div className="grid lg:grid-cols-5 gap-3 mb-6"><Metric label="APY" value={`${op.grossApyPct.toFixed(2)}%`} /><Metric label="Opportunity" value={String(op.opportunityScore)} /><Metric label="Risk" value={String(op.riskScore)} /><Metric label="Confidence" value={`${Math.round(op.confidence*100)}%`} /><Metric label="Review" value={review.status.toUpperCase()} /></div>
    <div className="grid lg:grid-cols-2 gap-3">
      <section className="panel p-6"><div className="kicker">Why it ranked</div><ul className="mt-4 space-y-3 text-sm text-[#b9c0ca]">{op.reasons.map((x,i)=><li key={i}>· {x}</li>)}</ul><div className="kicker mt-6">Evidence</div><ul className="mt-3 space-y-2 text-xs text-[#858c98]">{op.evidence.map((x,i)=><li key={i}>{x}</li>)}</ul></section>
      <section className="panel p-6"><div className="kicker">Adversarial review</div><div className="text-lg mt-2">{review.status.toUpperCase()}</div><ul className="mt-4 space-y-2 text-sm text-[#b9c0ca]">{review.objections.length ? review.objections.map((x,i)=><li key={i}>· {x}</li>) : <li>· No deterministic objection cleared the review gate.</li>}</ul><div className="kicker mt-6">Invalidation</div><ul className="mt-3 space-y-2 text-xs text-[#858c98]">{review.invalidationConditions.map((x,i)=><li key={i}>· {x}</li>)}</ul></section>
      <section className="panel p-6 lg:col-span-2"><div className="kicker">Stress engine</div><div className="grid md:grid-cols-3 gap-3 mt-4">{stress.map((s)=><div key={s.scenario} className="border border-[#242932] rounded-xl p-4"><div className="text-xs">{s.scenario}</div><div className="metric text-xl mt-2">{s.score}</div><div className="text-[10px] text-[#858c98] mt-1">{s.survives ? "survives" : "fails gate"}</div><p className="text-xs text-[#858c98] mt-3">{s.consequence}</p></div>)}</div></section>
      <section className="panel p-6 lg:col-span-2"><div className="kicker">Execution boundary</div><p className="text-sm text-[#b9c0ca] mt-3">{trace.action.opportunityId === op.id ? trace.action.summary : "This opportunity is not the active action intent."}</p>{source?.url && <a className="inline-block mt-5 text-[#d9ff65] text-xs" href={source.url} target="_blank" rel="noreferrer">Open protocol market →</a>}</section>
    </div>
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-xl mt-2">{value}</div></div>; }
