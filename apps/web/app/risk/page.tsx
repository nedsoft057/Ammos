import { Header } from "@/components/Header";
import { fetchLiveYieldPools } from "@/lib/live/defillama";

export const dynamic = "force-dynamic";

export default async function Risk() {
  let pools: Awaited<ReturnType<typeof fetchLiveYieldPools>> = [];
  let error: string | null = null;
  try { pools = await fetchLiveYieldPools(); } catch (e) { error = e instanceof Error ? e.message : "Live risk inputs unavailable."; }
  const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
  const highYield = pools.filter(p => (p.apy ?? 0) > 20).length;
  return <div>
    <Header eyebrow="AMMOS / risk engine" title="Portfolio risk." />
    {error ? <section className="panel p-6">{error}<p className="text-xs text-[#858c98] mt-2">No fabricated risk score is shown when live inputs are unavailable.</p></section> : <>
      <section className="grid lg:grid-cols-3 gap-3 mb-6">
        <Metric label="Observed markets" value={String(pools.length)} />
        <Metric label="Observed TVL" value={`$${totalTvl.toLocaleString(undefined,{maximumFractionDigits:0})}`} />
        <Metric label="High-APY outliers" value={String(highYield)} />
      </section>
      <section className="panel p-7"><div className="kicker">Risk posture</div><h2 className="text-2xl mt-2">Position risk is wallet-specific.</h2><p className="text-sm text-[#858c98] leading-6 mt-4 max-w-3xl">AMMOS will not invent a portfolio risk score. Connect a wallet to evaluate actual balances, collateral, debt, health factors and protocol exposure. Market-level risk is derived only after live observations are available.</p></section>
    </>}
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-3xl mt-2">{value}</div></div>; }
