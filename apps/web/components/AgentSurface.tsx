import Link from "next/link";
import type { LiveYieldPool } from "@/lib/live/types";

function score(pool: LiveYieldPool) {
  const liquidity = pool.tvlUsd >= 1e9 ? 88 : pool.tvlUsd >= 1e8 ? 76 : pool.tvlUsd >= 1e7 ? 61 : 45;
  return Math.round(Math.min(96, liquidity + Math.min(Math.max((pool.apy ?? 0) * 1.7, 0), 16)));
}

export function AgentSurface({ pools }: { pools: LiveYieldPool[] }) {
  const ranked = [...pools].filter(p => p.apy != null).sort((a, b) => score(b) - score(a));
  const lead = ranked[0];
  const stages = [
    ["01", "OBSERVE", `${pools.length} Ethereum records are live in the current feed.`],
    ["02", "RANK", lead ? `${lead.symbol} leads the current liquidity signal at ${score(lead)}/100.` : "Waiting for a live candidate."],
    ["03", "GATE", "Risk is evaluated before intent. Execution remains behind the user's wallet."],
  ];
  return <section className="agent-surface panel">
    <div className="agent-visual-line" />
    <div className="agent-header"><div className="agent-avatar"><span>✦</span></div><div className="min-w-0 flex-1"><div className="kicker text-[#a99cff]">AMMOS / reasoning layer</div><h2 className="agent-title">See the agent think without hiding the machinery.</h2></div><span className="live-badge"><i /> observing</span></div>
    <div className="agent-grid">{stages.map(([no,title,copy]) => <div className="agent-step" key={no}><div className="step-no">{no}</div><div><div className="step-title">{title}</div><p>{copy}</p></div></div>)}</div>
    <div className="agent-bottom"><div className="agent-readout"><div className="kicker">Current readout</div><div className="readout-main">{lead ? `${lead.project} / ${lead.symbol}` : "No candidate"}</div><div className="readout-sub">{lead ? `TVL ${lead.tvlUsd.toLocaleString(undefined,{maximumFractionDigits:0})} · APY ${lead.apy?.toFixed(2)}% · live observation` : "Live feed required"}</div></div><Link href="/decisions" className="button-secondary">Open decision trace <span>↗</span></Link></div>
  </section>;
}
