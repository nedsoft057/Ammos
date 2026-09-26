import Link from "next/link";
import { CinematicField } from "@/components/CinematicField";
import { LiveMarketChart } from "@/components/LiveMarketChart";
import { AgentSurface } from "@/components/AgentSurface";
import { fetchLivePrices, fetchLiveYieldPools } from "@/lib/live/defillama";

export const dynamic = "force-dynamic";

function money(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function pct(n: number | null | undefined) { return n == null || Number.isNaN(n) ? "—" : `${n.toFixed(2)}%`; }
function score(pool: { tvlUsd: number; apy: number | null }) {
  const liquidity = pool.tvlUsd >= 1e9 ? 88 : pool.tvlUsd >= 1e8 ? 76 : pool.tvlUsd >= 1e7 ? 61 : 45;
  return Math.round(Math.min(96, liquidity + Math.min(Math.max((pool.apy ?? 0) * 1.7, 0), 16)));
}

export default async function Home() {
  let pools: Awaited<ReturnType<typeof fetchLiveYieldPools>> = [];
  let prices: Record<string, number> = {};
  let error: string | null = null;
  try { [pools, prices] = await Promise.all([fetchLiveYieldPools(), fetchLivePrices()]); }
  catch (e) { error = e instanceof Error ? e.message : "Live market data unavailable."; }

  const ranked = [...pools].filter((p) => p.apy != null).sort((a, b) => score(b) - score(a));
  const candidates = ranked.slice(0, 6);
  const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
  const eth = prices.ETH;

  return <div className="landing">
    <section className="cinematic-hero">
      <CinematicField />
      <div className="hero-vignette" />
      <div className="hero-grain" />
      <div className="hero-copy">
        <div className="kicker hero-kicker">AUTONOMOUS INTELLIGENCE FOR ONCHAIN CAPITAL</div>
        <h1>Observe.<br /><span>Reason.</span><br />Act.</h1>
        <p>AMMOS turns live protocol state into structured decisions. It watches the market, evaluates opportunities, and keeps execution behind the wallet boundary.</p>
        <div className="hero-actions">
          <Link href="#command" className="hero-button">Enter AMMOS <span>↗</span></Link>
          <Link href="#system" className="hero-text-link"><i /> Explore the system</Link>
        </div>
      </div>
      <div className="hero-readout">
        <div className="kicker">LIVE OBSERVATION</div>
        <div className="readout-number">{pools.length || "—"}</div>
        <div className="readout-label">Ethereum records in the current feed</div>
        <div className="readout-divider" />
        <div className="readout-row"><span>ETH / USD</span><strong>{eth ? `$${eth.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</strong></div>
        <div className="readout-row"><span>LIQUIDITY</span><strong>{totalTvl ? money(totalTvl) : "—"}</strong></div>
        <div className="readout-row"><span>EXECUTION</span><strong className="safe">WALLET SIGNED</strong></div>
      </div>
      <div className="hero-bottom-note">MARKETS NEVER SLEEP.<br />NEITHER DOES AMMOS.</div>
      <div className="hero-scroll"><span>SCROLL</span><i /></div>
    </section>

    <section id="system" className="manifest-section">
      <div className="manifest-art"><div className="manifest-orbit orbit-a" /><div className="manifest-orbit orbit-b" /><div className="manifest-core" /></div>
      <div className="manifest-copy"><div className="kicker">A NEW OPERATING LAYER</div><h2>For onchain capital.</h2><p>Not another terminal full of noise. AMMOS builds a continuous loop from observation to reasoning to action, with the evidence visible at every step.</p></div>
      <div className="manifest-steps">
        <div><span>01</span><strong>Live perception</strong><p>Protocol and wallet state enter the same observation surface.</p></div>
        <div><span>02</span><strong>Agentic reasoning</strong><p>Signals are ranked, stress-tested and explained before intent is formed.</p></div>
        <div><span>03</span><strong>Actionable strategy</strong><p>Execution stays explicit, user-signed and protocol-bound.</p></div>
      </div>
    </section>

    <section id="command" className="command-section">
      <div className="section-intro"><div><div className="kicker">THE COMMAND CENTER</div><h2>Everything in view.<br /><span>Nothing hidden.</span></h2></div><div className="section-intro-copy">Live positions, market structure, opportunities and agent reasoning in one calm surface. The complexity stays underneath the interface.</div></div>
      {error ? <div className="panel p-6 border-[#ff718d]/30"><div className="kicker text-[#ff718d]">Live source unavailable</div><p className="mt-2 text-sm">{error}</p></div> : <div className="dashboard-frame">
        <div className="dashboard-topline"><span><i className="status-dot" /> AMMOS / COMMAND</span><span>LIVE DATA PLANE · ETHEREUM</span></div>
        <div className="dashboard-grid">
          <div className="dashboard-stat"><div className="kicker">ETH / USD</div><strong>{eth ? `$${eth.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</strong><span>live market price</span></div>
          <div className="dashboard-stat"><div className="kicker">MARKETS</div><strong>{pools.length || "—"}</strong><span>live protocol records</span></div>
          <div className="dashboard-stat"><div className="kicker">LIQUIDITY SURFACE</div><strong>{totalTvl ? money(totalTvl) : "—"}</strong><span>observed across feed</span></div>
          <div className="dashboard-side"><div className="kicker">AGENT STATE</div><div className="agent-state"><i /> OBSERVING</div><p>observe · rank · gate</p><Link href="/decisions">Open decision trace ↗</Link></div>
          <div className="dashboard-chart"><LiveMarketChart pools={pools} /></div>
          <div className="dashboard-side opportunity-side"><div className="kicker">LIVE OPPORTUNITIES</div>{candidates.slice(0, 3).map((pool) => <div key={pool.pool} className="mini-opportunity"><div><strong>{pool.symbol}</strong><span>{pool.project}</span></div><b>{pct(pool.apy)}</b></div>)}</div>
        </div>
      </div>}
    </section>

    {!error && <section className="reasoning-section"><AgentSurface pools={pools} /></section>}

    <section className="opportunity-section">
      <div className="section-intro compact"><div><div className="kicker">LIVE OPPORTUNITY SURFACE</div><h2>Signals, not noise.</h2></div><Link href="/strategies" className="hero-text-link">Open strategy lab ↗</Link></div>
      <div className="opportunity-grid">{candidates.map((pool, index) => <Link href={`/strategies/${encodeURIComponent(pool.pool)}`} key={pool.pool} className="opportunity-card">
        <div className="opportunity-index">0{index + 1}</div><div className="opportunity-main"><div className="kicker">{pool.project} · {pool.chain}</div><h3>{pool.symbol}</h3><div className="opportunity-metrics"><span><b>{pct(pool.apy)}</b><small>APY</small></span><span><b>{money(pool.tvlUsd)}</b><small>TVL</small></span><span><b>{score(pool)}</b><small>SIGNAL</small></span></div></div><div className="opportunity-arrow">↗</div>
      </Link>)}</div>
    </section>

    <section className="closing-section"><div className="kicker">EXECUTION BOUNDARY</div><h2>Observe first.<br /><span>Sign last.</span></h2><p>AMMOS can reason about capital without owning it. Transactions remain explicit, protocol-bound and signed by the connected wallet.</p><div className="closing-actions"><Link href="/positions" className="hero-button">View live position ↗</Link><Link href="/terminal" className="hero-text-link">Inspect terminal trace ↗</Link></div></section>
  </div>;
}
