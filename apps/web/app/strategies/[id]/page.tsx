import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { fetchLiveYieldPools } from "@/lib/live/defillama";

export const dynamic = "force-dynamic";

export default async function StrategyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pools = await fetchLiveYieldPools();
  const pool = pools.find(item => item.pool === id);
  if (!pool) notFound();

  return <div>
    <Header eyebrow={`AMMOS / live strategy / ${pool.project.toLowerCase()}`} title={pool.symbol} />
    <div className="grid lg:grid-cols-4 gap-3 mb-6">
      <Metric label="APY" value={pool.apy == null ? "—" : `${pool.apy.toFixed(2)}%`} />
      <Metric label="Base APY" value={pool.apyBase == null ? "—" : `${pool.apyBase.toFixed(2)}%`} />
      <Metric label="Reward APY" value={pool.apyReward == null ? "—" : `${pool.apyReward.toFixed(2)}%`} />
      <Metric label="TVL" value={`$${pool.tvlUsd.toLocaleString(undefined,{maximumFractionDigits:0})}`} />
    </div>
    <section className="panel p-6">
      <div className="kicker">Live source</div>
      <p className="text-sm mt-3">{pool.project} on {pool.chain}. AMMOS uses this record as an input to deterministic risk and strategy analysis. No simulated return or fake position is inserted.</p>
      {pool.url && <a className="inline-block mt-5 text-[#d9ff65] text-xs" href={pool.url} target="_blank" rel="noreferrer">Open protocol market →</a>}
    </section>
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-2xl mt-2">{value}</div></div>; }
