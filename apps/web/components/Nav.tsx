import Link from "next/link";

const links = [
  ["/", "Command"],
  ["/terminal", "Terminal"],
  ["/strategies", "Strategies"],
  ["/risk", "Risk"],
  ["/memory", "Memory"],
];

export function Nav() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 border-r border-[#242932] bg-[#08090b]/95 p-6 flex-col z-20">
      <Link href="/" className="mb-12">
        <div className="font-black tracking-[-.08em] text-2xl">AMMOS<span className="text-[#d9ff65]">.</span></div>
        <div className="kicker mt-1">Autonomous DeFi intelligence</div>
      </Link>

      <nav className="space-y-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="block rounded-lg px-3 py-2.5 text-sm text-[#858c98] hover:bg-white/[.035] hover:text-white transition">
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto panel p-4">
        <div className="kicker">Agent status</div>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <span className="h-2 w-2 rounded-full bg-[#d9ff65] shadow-[0_0_12px_#d9ff65]" />
          Observing
        </div>
        <div className="text-[11px] text-[#858c98] mt-2">Simulation mode · no live execution</div>
      </div>
    </aside>
  );
}
