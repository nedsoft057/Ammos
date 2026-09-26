import { Header } from "@/components/Header";
import { fetchLiveYieldPools } from "@/lib/live/defillama";

export const dynamic = "force-dynamic";

export default async function Terminal() {
  let pools: Awaited<ReturnType<typeof fetchLiveYieldPools>> = [];
  let error: string | null = null;
  try { pools = await fetchLiveYieldPools(); } catch (e) { error = e instanceof Error ? e.message : "Live feed unavailable."; }
  const top = [...pools].sort((a,b)=>(b.tvlUsd-a.tvlUsd)).slice(0,5);
  return <div>
    <Header eyebrow="AMMOS / live agent trace" title="Terminal." />
    <div className="panel overflow-hidden">
      <div className="border-b border-[#242932] px-5 py-4 flex justify-between"><div className="kicker">decision trace · live data plane</div><div className="text-[10px] text-[#d9ff65]">● LIVE FEED</div></div>
      <div className="p-5 md:p-8 font-mono text-sm space-y-4">
        {error ? <div><span className="text-[#ff7272]">&gt; error </span><span className="text-[#b9c0ca]">{error}</span></div> : <>
          <div><span className="text-[#d9ff65]">&gt; source </span><span className="text-[#b9c0ca]">DeFiLlama live Ethereum yield feed</span></div>
          <div><span className="text-[#d9ff65]">&gt; observe </span><span className="text-[#b9c0ca]">{pools.length} live Aave / Uniswap records received</span></div>
          <div><span className="text-[#d9ff65]">&gt; filter </span><span className="text-[#b9c0ca]">ranking by live TVL and current APY</span></div>
          {top.map((p) => <div key={p.pool}><span className="text-[#d9ff65]">&gt; candidate </span><span className="text-[#b9c0ca]">{p.project} / {p.symbol} · APY {p.apy == null ? "—" : `${p.apy.toFixed(2)}%`} · TVL ${p.tvlUsd.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>)}
          <div className="border-t border-[#242932] pt-5 mt-7"><span className="text-[#d9ff65]">AMMOS → </span><span className="text-[#b9c0ca]">no transaction is created until a real connected wallet signs a protocol-specific request.</span></div>
        </>}
      </div>
    </div>
  </div>;
}
