import { Header } from "@/components/Header";
import { getMemoryStore } from "@/lib/memory";

export const dynamic = "force-dynamic";

export default async function Memory() {
  const records = await getMemoryStore().recent("agent_run", 25);
  return <div>
    <Header eyebrow="AMMOS / persistent strategy memory" title="What the agent learned." />
    <section className="panel overflow-hidden">
      <div className="px-5 py-4 border-b border-[#242932] kicker">Recorded agent runs</div>
      {records.length === 0 ? <div className="p-8 text-sm text-[#858c98]">No agent decisions have been recorded yet. AMMOS will not fabricate historical decisions.</div> : records.map(record => <div key={record.id} className="px-5 py-5 border-b border-[#242932] last:border-0"><div className="flex justify-between gap-4"><span className="text-[#d9ff65] text-xs">{record.key}</span><span className="text-[10px] text-[#858c98]">{record.createdAt}</span></div><pre className="text-xs text-[#b9c0ca] mt-3 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(record.payload, null, 2)}</pre></div>)}
    </section>
  </div>;
}
