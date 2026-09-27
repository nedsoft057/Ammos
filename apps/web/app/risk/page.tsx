import { Header } from "@/components/Header";
import { buildDecisionTrace } from "@/lib/ammos/decision";

export const dynamic = "force-dynamic";

export default async function Risk() {
  let trace: Awaited<ReturnType<typeof buildDecisionTrace>> | null = null;
  let error: string | null = null;
  try { trace = await buildDecisionTrace(); } catch (e) { error = e instanceof Error ? e.message : "Live risk inputs unavailable."; }
  const totalTvl = trace?.snapshot.pools.reduce((sum,p)=>sum+p.tvlUsd,0) ?? 0;
  const highRisk = trace?.opportunities.filter(op=>op.riskScore>=70).length ?? 0;
  return <div><Header eyebrow="AMMOS / canonical risk engine" title="Risk." />
    {error ? <section className="panel p-6">{error}<p className="text-xs text-[#858c98] mt-2">No fabricated risk score is shown when live inputs are unavailable.</p></section> : trace && <>
      <section className="grid lg:grid-cols-4 gap-3 mb-6"><Metric label="Regime" value={trace.regime.label} /><Metric label="Observed TVL" value={`$${totalTvl.toLocaleString(undefined,{maximumFractionDigits:0})}`} /><Metric label="High-risk candidates" value={String(highRisk)} /><Metric label="Lead risk" value={String(trace.assessment.riskScore)} /></section>
      <section className="panel p-7 mb-4"><div className="kicker">Risk posture</div><h2 className="text-2xl mt-2">Risk is evidence, not a decorative badge.</h2><p className="text-sm text-[#858c98] leading-6 mt-4 max-w-3xl">The same opportunity engine now feeds risk, stress and review. Position-specific liquidation risk still requires protocol-specific wallet adapters. AMMOS will not infer Aave collateral or debt from a generic wallet balance.</p></section>
      <div className="space-y-3">{trace.opportunities.slice(0,12).map(op=><div className="panel p-5" key={op.id}><div className="flex justify-between gap-4"><div><div className="kicker">{op.protocol}</div><h3 className="text-lg mt-1">{op.title}</h3></div><div className="metric text-xl">{op.riskScore}</div></div><div className="text-xs text-[#858c98] mt-3">{op.warnings.slice(0,2).join(" · ") || "No deterministic warning on the current snapshot."}</div></div>)}</div>
    </>}
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-xl mt-2">{value}</div></div>; }
