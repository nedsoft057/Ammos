import Link from "next/link";
import { Header } from "@/components/Header";
import { Stat } from "@/components/Stat";
import { StrategyCard } from "@/components/StrategyCard";
import { strategies } from "@/lib/data";

export default function Home() {
  return (
    <div>
      <Header eyebrow="AMMOS / command center" title="Autonomous DeFi intelligence." />

      <section className="grid-bg panel p-7 md:p-10 mb-6 glow">
        <div className="max-w-3xl">
          <div className="kicker text-[#d9ff65]">Current mandate</div>
          <h2 className="text-2xl md:text-4xl font-medium tracking-[-.045em] mt-3">
            Find the highest return that survives the risk.
          </h2>
          <p className="text-[#858c98] leading-7 mt-4 max-w-2xl">
            AMMOS discovers DeFi opportunities, generates competing strategies, stress-tests them across market regimes and applies deterministic risk gates before making a recommendation.
          </p>
          <div className="flex gap-3 mt-7">
            <Link href="/terminal" className="bg-[#d9ff65] text-black rounded-lg px-5 py-3 text-sm font-semibold">Open terminal</Link>
            <Link href="/strategies" className="border border-[#303640] rounded-lg px-5 py-3 text-sm">Strategy lab</Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-3 mb-8">
        <Stat label="Market state" value="VOLATILE" sub="Confidence 81%" />
        <Stat label="Opportunities" value="147" sub="31 passed initial filters" />
        <Stat label="Stable yield" value="9.6%" sub="Effective simulated yield" />
        <Stat label="Risk score" value="62/100" sub="Portfolio mandate: moderate" />
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div><div className="kicker">Agent shortlist</div><h2 className="text-2xl font-medium mt-1">Active strategies</h2></div>
          <Link href="/strategies" className="text-xs text-[#858c98] hover:text-white">View all →</Link>
        </div>
        <div className="grid lg:grid-cols-2 gap-3">
          {strategies.slice(0, 4).map(s => <StrategyCard key={s.id} strategy={s} />)}
        </div>
      </section>
    </div>
  );
}
