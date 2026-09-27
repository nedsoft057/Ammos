import Link from "next/link";
import type { DecisionTrace } from "@/lib/ammos/decision";

export function AgentSurface({ trace }: { trace: DecisionTrace }) {
  const lead = trace.opportunities[0];
  const review = lead ? trace.review[lead.id] : undefined;
  const stress = lead ? trace.stress[lead.id] ?? [] : [];
  const stages = [
    ["01", "OBSERVE", `${trace.snapshot.pools.length} Ethereum records are live in the current snapshot.`],
    ["02", "REASON", `${trace.regime.label} regime proxy · ${lead ? `${lead.title} leads at ${lead.opportunityScore}/100` : "no candidate"}.`],
    ["03", "REVIEW", `${review?.status ?? "unreviewed"} · ${stress.filter(s => !s.survives).length} stress case(s) fail the current gate.`],
  ];
  return <section className="agent-surface panel"><div className="agent-visual-line" />
    <div className="agent-header"><div className="min-w-0 flex-1"><div className="kicker text-[#a99cff]">AMMOS / reasoning layer</div><h2 className="agent-title">See the agent think without hiding the machinery.</h2></div><span className="live-badge"><i /> {trace.regime.label.toLowerCase()}</span></div>
    <div className="agent-grid">{stages.map(([no,title,copy]) => <div className="agent-step" key={no}><div className="step-no">{no}</div><div><div className="step-title">{title}</div><p>{copy}</p></div></div>)}</div>
    <div className="agent-bottom"><div className="agent-readout"><div className="kicker">Current decision</div><div className="readout-main">{trace.assessment.verdict.toUpperCase()} · {trace.assessment.opportunityScore}/100</div><div className="readout-sub">risk {trace.assessment.riskScore}/100 · confidence {Math.round(trace.assessment.confidence * 100)}% · review {review?.status ?? "—"}</div></div><Link href="/decisions" className="button-secondary">Open decision trace <span>↗</span></Link></div>
  </section>;
}
