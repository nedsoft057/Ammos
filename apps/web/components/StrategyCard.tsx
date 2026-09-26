import Link from "next/link";
import { Strategy } from "@/lib/types";

export function StrategyCard({ strategy }: { strategy: Strategy }) {
  const verdict = strategy.verdict === "APPROVED" ? "text-[#d9ff65]" : strategy.verdict === "CONDITIONAL" ? "text-[#ffd36a]" : "text-[#ff7272]";
  return (
    <Link href={`/strategies/${strategy.id}`} className="panel p-5 block hover:bg-white/[.025] transition group">
      <div className="flex justify-between gap-4">
        <div>
          <div className="kicker">{strategy.type} · {strategy.protocol}</div>
          <h3 className="text-lg font-medium mt-2 group-hover:text-[#d9ff65] transition">{strategy.name}</h3>
        </div>
        <div className={`text-[10px] font-bold tracking-[.16em] ${verdict}`}>{strategy.verdict}</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-7">
        <Metric label="APY" value={`${strategy.expectedApy}%`} />
        <Metric label="Risk adj." value={`${strategy.riskAdjusted}%`} />
        <Metric label="Worst" value={`${strategy.worstCase}%`} />
      </div>
      <p className="text-xs text-[#858c98] leading-5 mt-5">{strategy.thesis}</p>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><div className="kicker">{label}</div><div className="metric text-xl mt-1">{value}</div></div>;
}
