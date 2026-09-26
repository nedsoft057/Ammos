import { Header } from "@/components/Header";
import { terminalEvents } from "@/lib/data";

export default function Terminal() {
  return (
    <div>
      <Header eyebrow="AMMOS / agent trace" title="Terminal." />
      <div className="panel overflow-hidden">
        <div className="border-b border-[#242932] px-5 py-4 flex justify-between">
          <div className="kicker">decision trace · simulation mode</div>
          <div className="text-[10px] text-[#d9ff65]">● LIVE ENGINE</div>
        </div>
        <div className="p-5 md:p-8 font-mono text-sm space-y-4">
          {terminalEvents.map(([tag, text], i) => (
            <div key={i} className="flex gap-4">
              <span className="text-[#d9ff65] shrink-0">{tag}</span>
              <span className="text-[#b9c0ca]">{text}</span>
            </div>
          ))}
          <div className="border-t border-[#242932] pt-5 mt-7">
            <span className="text-[#d9ff65]">AMMOS → </span>
            <span>conditional approval. ETH/USDC LP survives the current 5% drawdown mandate only with a widened range and active monitoring.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
