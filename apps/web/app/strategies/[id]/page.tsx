import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { strategies } from "@/lib/data";
import { stress } from "@/lib/engine";
import { Regime } from "@/lib/types";

const regimes: Regime[] = ["NORMAL", "SIDEWAYS", "VOLATILE", "CRASH", "LIQUIDITY_SHOCK"];

export default async function StrategyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const strategy = strategies.find(s => s.id === id);
  if (!strategy) notFound();

  return (
    <div>
      <Header eyebrow={`AMMOS / strategy / ${strategy.type.toLowerCase()}`} title={strategy.name} />

      <div className="grid lg:grid-cols-3 gap-3 mb-6">
        <Metric label="Expected APY" value={`${strategy.expectedApy}%`} />
        <Metric label="Risk adjusted" value={`${strategy.riskAdjusted}%`} />
        <Metric label="Worst simulated" value={`${strategy.worstCase}%`} />
      </div>

      <div className="grid lg:grid-cols-[1.3fr_.7fr] gap-3">
        <section className="panel p-6">
          <div className="kicker">Stress simulation</div>
          <h2 className="text-xl mt-2">Five market regimes</h2>
          <div className="mt-6 divide-y divide-[#242932]">
            {regimes.map(r => {
              const value = stress(strategy, r);
              return <div key={r} className="py-4 flex justify-between">
                <span className="text-sm text-[#b9c0ca]">{r.replace("_", " ")}</span>
                <span className={value >= 0 ? "text-[#d9ff65]" : "text-[#ff7272]"}>{value >= 0 ? "+" : ""}{value}%</span>
              </div>;
            })}
          </div>
        </section>

        <section className="panel p-6">
          <div className="kicker">Risk gate</div>
          <div className="text-3xl font-semibold mt-3">{strategy.risk}</div>
          <div className="mt-6 space-y-4 text-sm">
            <Row label="Liquidity depth" value={`${strategy.liquidity}%`} />
            <Row label="IL estimate" value={`${strategy.il}%`} />
            <Row label="Range breach" value={`${strategy.breachProbability}%`} />
            <Row label="Verdict" value={strategy.verdict} />
          </div>
          <div className="border-t border-[#242932] mt-7 pt-5 text-xs text-[#858c98] leading-5">{strategy.thesis}</div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-3xl mt-2">{value}</div></div>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-[#858c98]">{label}</span><span>{value}</span></div>;
}
