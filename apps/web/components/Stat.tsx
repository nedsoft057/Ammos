export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="panel p-5">
      <div className="kicker">{label}</div>
      <div className="metric text-3xl font-semibold mt-3">{value}</div>
      {sub && <div className="text-xs text-[#858c98] mt-2">{sub}</div>}
    </div>
  );
}
