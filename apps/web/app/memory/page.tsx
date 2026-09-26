import { Header } from "@/components/Header";
import { memory } from "@/lib/data";

export default function Memory() {
  return (
    <div>
      <Header eyebrow="AMMOS / persistent strategy memory" title="What the agent learned." />
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <Box label="Decisions" value="127" />
        <Box label="Successful" value="43" />
        <Box label="Revised" value="8" />
      </div>
      <section className="panel overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-[#242932] kicker">
          <span>ID</span><span>Pattern</span><span>Observed</span><span>Lesson</span>
        </div>
        {memory.map(row => <div key={row[0]} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-4 px-5 py-5 border-b border-[#242932] last:border-0 text-xs">
          <span className="text-[#d9ff65]">{row[0]}</span><span>{row[1]}</span><span className="text-[#858c98]">{row[2]}</span><span className="text-[#b9c0ca]">{row[3]}</span>
        </div>)}
      </section>
    </div>
  );
}
function Box({label,value}:{label:string,value:string}) {
  return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-3xl mt-2">{value}</div></div>;
}
