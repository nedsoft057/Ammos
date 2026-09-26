import { Header } from "@/components/Header";
import { fetchLiveYieldPools } from "@/lib/live/defillama";

export const dynamic = "force-dynamic";

function pct(n: number | null | undefined) { return n == null || Number.isNaN(n) ? "—" : `${n.toFixed(2)}%`; }
function risk(pool: { tvlUsd: number; apy: number | null }) { const score = (pool.tvlUsd < 1_000_000 ? 45 : pool.tvlUsd < 10_000_000 ? 30 : 15) + ((pool.apy ?? 0) > 20 ? 35 : (pool.apy ?? 0) > 10 ? 20 : 5); return score >= 60 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW"; }

export default async function Strategies() {
  let pools: Awaited<ReturnType<typeof fetchLiveYieldPools>> = [];
  let error: string | null = null;
  try { pools = (await fetchLiveYieldPools()).sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0)).slice(0, 30); }
  catch (e) { error = e instanceof Error ? e.message : "Live strategy data unavailable."; }

  return <div>
    <Header eyebrow="AMMOS / live strategy lab" title="Competing strategies." />
    <p className="text-sm text-[#858c98] mb-5 max-w-3xl">Strategies are generated from live Ethereum protocol observations. AMMOS does not seed this page with example APYs, positions, or wallet balances.</p>
    {error ? <div className="panel p-6 text-sm">{error}</div> : <div className="grid lg:grid-cols-2 gap-3">
      {pools.map(pool => <article key={pool.pool} className="panel p-5">
        <div className="flex justify-between gap-4"><div><div className="kicker">{pool.project} · {pool.chain}</div><h2 className="text-lg mt-2">{pool.symbol}</h2></div><div className="text-[10px] tracking-[.12em] text-[#858c98]">{risk(pool)}</div></div>
        <div className="grid grid-cols-3 gap-4 mt-6"><Metric label="APY" value={pct(pool.apy)} /><Metric label="Base" value={pct(pool.apyBase)} /><Metric label="TVL" value={`$${pool.tvlUsd.toLocaleString(undefined,{maximumFractionDigits:0})}`} /></div>
        <div className="mt-5 text-xs text-[#858c98]">Reward APY: {pct(pool.apyReward)}. APY is observed market data, not a guarantee.</div>
      </article>)}
    </div>}
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div><div className="kicker">{label}</div><div className="text-sm mt-1">{value}</div></div>; }
