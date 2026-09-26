import { Header } from "@/components/Header";
import { StrategyCard } from "@/components/StrategyCard";
import { strategies } from "@/lib/data";

export default function Strategies() {
  return (
    <div>
      <Header eyebrow="AMMOS / strategy lab" title="Competing strategies." />
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
        {["ALL", "LIQUIDITY", "LENDING", "BORROWING", "STAKING"].map(x =>
          <button key={x} className="border border-[#242932] rounded-full px-4 py-2 text-[10px] tracking-[.12em] text-[#858c98] whitespace-nowrap">{x}</button>
        )}
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        {strategies.map(s => <StrategyCard key={s.id} strategy={s} />)}
      </div>
    </div>
  );
}
