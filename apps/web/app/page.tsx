import Link from "next/link";
import { CinematicField } from "@/components/CinematicField";
import { LiveMarketChart } from "@/components/LiveMarketChart";
import { AgentSurface } from "@/components/AgentSurface";
import { buildDecisionTrace } from "@/lib/ammos/decision";

export const dynamic = "force-dynamic";

function money(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function pct(n: number | null | undefined) { return n == null || Number.isNaN(n) ? "—" : `${n.toFixed(2)}%`; }

export default async function Home() {
  let trace: Awaited<ReturnType<typeof buildDecisionTrace>> | null = null;
  let error: string | null = null;
  try { trace = await buildDecisionTrace(); }
  catch (e) { error = e instanceof Error ? e.message : "Live market data unavailable."; }

  const pools = trace?.snapshot.pools ?? [];
  const prices = trace?.snapshot.prices ?? {};
  const candidates = trace?.opportunities.slice(0, 6) ?? [];
  const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
  const eth = prices.ETH;

  return <div className="landing">
    <section className="cinematic-hero">
      <CinematicField /><div className="hero-vignette" /><div className="hero-grain" />
      <div className="hero-copy">
        <div className="kicker hero-kicker">AUTONOMOUS INTELLIGENCE FOR ONCHAIN CAPITAL</div>
        <h1>Observe.<br /><span>Reason.</span><br />Act.</h1>
        <p>AMMOS turns live protocol state into structured decisions. It observes, normalizes, ranks, stress-tests and reviews the evidence before an action intent can reach the wallet boundary.</p>
        <div className="hero-actions"><Link href="#command" className="hero-button">Enter AMMOS <span>↗</span></Link><Link href="#system" className="hero-text-link"><i /> Explore the system</Link></div>
      </div>
      <div className="hero-bottom-note">MARKETS NEVER SLEEP.<br />NEITHER DOES AMMOS.</div><div className="hero-scroll"><span>SCROLL</span><i /></div>
    </section>

    <section id="system" className="manifest-section">
      <div className="manifest-art"><div className="manifest-orbit orbit-a" /><div className="manifest-orbit orbit-b" /><div className="manifest-core" /></div>
      <div className="manifest-copy"><div className="kicker">A NEW OPERATING LAYER</div><h2>For onchain capital.</h2><p>Not another terminal full of disconnected heuristics. AMMOS builds one decision trace from live observation to evidence, risk, stress, adversarial review and explicit action intent.</p></div>
      <div className="manifest-steps"><div><span>01</span><strong>Observe</strong><p>Live protocol and verified wallet state enter one snapshot.</p></div><div><span>02</span><strong>Reason</strong><p>One canonical opportunity, risk, regime, stress and review pipeline evaluates it.</p></div><div><span>03</span><strong>Gate</strong><p>The resulting intent stays behind explicit approval and the wallet signature boundary.</p></div></div>
    </section>

    <section id="command" className="command-section">
      <div className="section-intro"><div><div className="kicker">THE COMMAND CENTER</div><h2>Everything in view.<br /><span>Nothing hidden.</span></h2></div><div className="section-intro-copy">Live positions, market structure, opportunities and agent reasoning now read from the same decision trace instead of separate UI heuristics.</div></div>
      {error ? <div className="panel p-6 border-[#ff718d]/30"><div className="kicker text-[#ff718d]">Live source unavailable</div><p className="mt-2 text-sm">{error}</p></div> : <div className="dashboard-frame">
        <div className="dashboard-topline"><span><i className="status-dot" /> AMMOS / COMMAND</span><span>LIVE DATA PLANE · ETHEREUM</span></div>
        <div className="dashboard-grid">
          <div className="dashboard-stat"><div className="kicker">ETH / USD</div><strong>{eth ? `$${eth.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</strong><span>live market price</span></div>
          <div className="dashboard-stat"><div className="kicker">MARKETS</div><strong>{pools.length || "—"}</strong><span>live protocol records</span></div>
          <div className="dashboard-stat"><div className="kicker">REGIME</div><strong>{trace?.regime.label ?? "—"}</strong><span>{trace ? `${Math.round(trace.regime.confidence * 100)}% confidence` : "—"}</span></div>
          <div className="dashboard-side"><div className="kicker">AGENT STATE</div><div className="agent-state"><i /> {trace?.assessment.verdict.toUpperCase() ?? "OBSERVING"}</div><p>observe · rank · stress · review</p><Link href="/decisions">Open decision trace ↗</Link></div>
          <div className="dashboard-chart"><LiveMarketChart pools={pools} /></div>
          <div className="dashboard-side opportunity-side"><div className="kicker">LIVE OPPORTUNITIES</div>{candidates.slice(0, 3).map((op) => <div key={op.id} className="mini-opportunity"><div><strong>{op.title}</strong><span>{op.protocol}</span></div><b>{op.opportunityScore}</b></div>)}</div>
        </div>
      </div>}
    </section>

    {!error && trace && <section className="reasoning-section"><AgentSurface trace={trace} /></section>}

    <section className="opportunity-section"><div className="section-intro compact"><div><div className="kicker">LIVE OPPORTUNITY SURFACE</div><h2>Signals, not noise.</h2></div><Link href="/strategies" className="hero-text-link">Open strategy lab ↗</Link></div>
      <div className="opportunity-grid">{candidates.map((op, index) => <Link href={`/strategies/${encodeURIComponent(op.id)}`} key={op.id} className="opportunity-card"><div className="opportunity-index">0{index + 1}</div><div className="opportunity-main"><div className="kicker">{op.protocol} · {op.chain}</div><h3>{op.title}</h3><div className="opportunity-metrics"><span><b>{pct(op.grossApyPct)}</b><small>APY</small></span><span><b>{money(trace?.snapshot.pools.find(p => `live:${p.pool}` === op.id)?.tvlUsd ?? 0)}</b><small>TVL</small></span><span><b>{op.opportunityScore}</b><small>SCORE</small></span></div></div><div className="opportunity-arrow">↗</div></Link>)}</div>
    </section>

    <section className="closing-section"><div className="kicker">EXECUTION BOUNDARY</div><h2>Observe first.<br /><span>Sign last.</span></h2><p>AMMOS can reason about capital without owning it. No transaction is created merely because a strategy ranked well. Explicit user approval and a protocol-specific wallet signature remain mandatory.</p><div className="closing-actions"><Link href="/positions" className="hero-button">View live position ↗</Link><Link href="/terminal" className="hero-text-link">Inspect terminal trace ↗</Link></div></section>
  </div>;
}
