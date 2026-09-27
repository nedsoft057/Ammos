import { Header } from "@/components/Header";
import { getMemoryStore } from "@/lib/memory";

export const dynamic = "force-dynamic";

export default async function Memory() {
  const store = getMemoryStore();
  const [observations, strategies, outcomes, runs] = await Promise.all([
    store.recent("observation", 12).catch(() => []),
    store.recent("strategy", 12).catch(() => []),
    store.recent("outcome", 12).catch(() => []),
    store.recent("agent_run", 12).catch(() => []),
  ]);
  const records = [...observations, ...strategies, ...outcomes, ...runs].sort((a,b)=>String(b.createdAt??"").localeCompare(String(a.createdAt??""))).slice(0,40);
  return <div><Header eyebrow="AMMOS / persistent decision memory" title="What the agent remembers." />
    <p className="subtle max-w-3xl mb-6">Memory is evidence storage, not a magic personality layer. AMMOS records observations, strategy theses, agent runs and later verified outcomes so future reasoning can see what changed and what was previously believed.</p>
    <section className="grid md:grid-cols-4 gap-3 mb-6"><Metric label="Observations" value={String(observations.length)} /><Metric label="Strategies" value={String(strategies.length)} /><Metric label="Agent runs" value={String(runs.length)} /><Metric label="Outcomes" value={String(outcomes.length)} /></section>
    <section className="panel overflow-hidden"><div className="px-5 py-4 border-b border-[#242932] kicker">Persistent records</div>{records.length===0?<div className="p-8 text-sm text-[#858c98]">No memory has been recorded yet. AMMOS will not fabricate history.</div>:records.map(record=><div key={`${record.kind}-${record.id}-${record.key}`} className="px-5 py-5 border-b border-[#242932] last:border-0"><div className="flex justify-between gap-4"><span className="text-[#d9ff65] text-xs">{record.kind} · {record.key}</span><span className="text-[10px] text-[#858c98]">{record.createdAt}</span></div><pre className="text-xs text-[#b9c0ca] mt-3 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(record.payload,null,2)}</pre></div>)}</section>
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-xl mt-2">{value}</div></div>; }
