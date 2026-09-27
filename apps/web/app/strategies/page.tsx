import Link from "next/link";
import { Header } from "@/components/Header";
import { buildDecisionTrace } from "@/lib/ammos/decision";

export const dynamic = "force-dynamic";

export default async function Strategies() {
  let trace: Awaited<ReturnType<typeof buildDecisionTrace>> | null = null;
  let error: string | null = null;
  try { trace = await buildDecisionTrace(); } catch (e) { error = e instanceof Error ? e.message : "Live strategy data unavailable."; }
  return <div><Header eyebrow="AMMOS / unified strategy lab" title="Competing strategies." />
    <p className="text-sm text-[#858c98] mb-5 max-w-3xl">Every card below is produced by the same live decision pipeline used by the command surface. Headline APY is evidence, not a strategy by itself.</p>
    {error ? <div className="panel p-6 text-sm">{error}</div> : <div className="grid lg:grid-cols-2 gap-3">{trace?.opportunities.slice(0,30).map(op=>{const review=trace.review[op.id];return <Link href={`/strategies/${encodeURIComponent(op.id)}`} key={op.id} className="panel panel-hover p-5"><div className="flex justify-between gap-4"><div><div className="kicker">{op.protocol} · {op.chain}</div><h2 className="text-lg mt-2">{op.title}</h2></div><div className="text-[10px] tracking-[.12em] text-[#858c98]">{review?.status.toUpperCase()}</div></div><div className="grid grid-cols-3 gap-4 mt-6"><Metric label="APY" value={`${op.grossApyPct.toFixed(2)}%`} /><Metric label="Score" value={String(op.opportunityScore)} /><Metric label="Risk" value={String(op.riskScore)} /></div><div className="mt-5 text-xs text-[#858c98]">{op.reasons[0]} {op.warnings[0] ? ` ${op.warnings[0]}.` : ""}</div></Link>})}</div>}
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div><div className="kicker">{label}</div><div className="text-sm mt-1">{value}</div></div>; }
