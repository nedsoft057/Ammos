import { Header } from "@/components/Header";

const rows = [
  ["Market risk", "MEDIUM", 61],
  ["Liquidity risk", "LOW", 28],
  ["Smart contract", "MEDIUM", 54],
  ["Leverage", "LOW", 22],
  ["Concentration", "HIGH", 77],
  ["Oracle", "LOW", 19],
];

export default function Risk() {
  return (
    <div>
      <Header eyebrow="AMMOS / risk engine" title="Portfolio risk." />
      <div className="grid lg:grid-cols-[.7fr_1.3fr] gap-3">
        <section className="panel p-7">
          <div className="kicker">Composite score</div>
          <div className="metric text-7xl font-semibold mt-3">62</div>
          <div className="text-[#858c98] mt-2">/ 100 · MODERATE</div>
          <div className="mt-8 h-2 bg-[#1b1e23] rounded-full overflow-hidden"><div className="h-full w-[62%] bg-[#d9ff65]" /></div>
          <p className="text-xs text-[#858c98] leading-5 mt-5">Score combines market, liquidity, leverage, concentration, contract and oracle exposure. It is deterministic and independent of the language model.</p>
        </section>
        <section className="panel p-7">
          <div className="kicker">Risk vectors</div>
          <div className="mt-5 divide-y divide-[#242932]">
            {rows.map(([name, level, score]) => <div key={name} className="py-4 flex items-center gap-5">
              <div className="w-32 text-sm">{name}</div>
              <div className="flex-1 h-1.5 bg-[#1b1e23] rounded-full overflow-hidden"><div className="h-full bg-[#b9c0ca]" style={{width: `${score}%`}} /></div>
              <div className="text-[10px] tracking-[.12em] text-[#858c98] w-16 text-right">{level}</div>
            </div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
