"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletConnect } from "./WalletConnect";
import { useWallet } from "./WalletProvider";


type LiveObservation = {
  records: number | null;
  eth: number | null;
  liquidity: number | null;
};

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function money(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const links = [
  ["/", "Command"], ["/positions", "Live Position"], ["/strategies", "Strategy Lab"], ["/performance", "Performance"], ["/decisions", "Decisions"], ["/risk", "Risk"], ["/memory", "Memory"], ["/terminal", "Terminal"],
] as const;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { address } = useWallet();

  const [live, setLive] = useState<LiveObservation>({
    records: null,
    eth: null,
    liquidity: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function readLive() {
      try {
        const response = await fetch("/api/live", { cache: "no-store" });
        if (!response.ok) return;

        const json = await response.json() as unknown;
        const root =
          json && typeof json === "object"
            ? json as Record<string, unknown>
            : {};

        const candidate = root.data ?? root.snapshot ?? root;
        const source =
          candidate && typeof candidate === "object"
            ? candidate as Record<string, unknown>
            : {};

        const rawPools = Array.isArray(source.pools) ? source.pools : [];
        const pools = rawPools.filter(
          (pool): pool is Record<string, unknown> =>
            !!pool && typeof pool === "object"
        );

        const prices =
          source.prices && typeof source.prices === "object"
            ? source.prices as Record<string, unknown>
            : {};

        const liquidity = pools.reduce((sum, pool) => {
          return sum + (toNumber(pool.tvlUsd) ?? 0);
        }, 0);

        const next = {
          records: pools.length || null,
          eth: toNumber(prices.ETH),
          liquidity: liquidity || null,
        };

        if (!cancelled) setLive(next);
      } catch {
        // Keep the last verified observation rather than inventing data.
      }
    }

    void readLive();

    const interval = window.setInterval(readLive, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const home = pathname === "/";
  const nav = <>
    <Link href="/" className="brand" onClick={() => setOpen(false)}><div className="brand-mark">A</div><div><div className="font-black tracking-[-.08em] text-xl">AMMOS<span className="text-[#9b8cff]">.</span></div><div className="kicker mt-1">Autonomous DeFi intelligence</div></div></Link>
    <div className="px-2 mt-1 mb-3"><div className="kicker">Workspace</div></div>
    <nav className="space-y-1">{links.map(([href, label]) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link ${active ? "nav-link-active" : ""}`}><span>{label}</span></Link>; })}</nav>
    <div className="nav-system">
      <div className="nav-observation-card">
        <div className="kicker">Live observation</div>

        <div className="nav-observation-number">
          {live.records ?? "—"}
        </div>

        <div className="nav-observation-label">
          Ethereum records in the current feed
        </div>

        <div className="readout-divider" />

        <div className="nav-observation-row">
          <span>ETH / USD</span>
          <strong>
            {live.eth != null
              ? `$${live.eth.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "—"}
          </strong>
        </div>

        <div className="nav-observation-row">
          <span>LIQUIDITY</span>
          <strong>{money(live.liquidity)}</strong>
        </div>

        <div className="nav-observation-row">
          <span>EXECUTION</span>
          <strong className={address ? "nav-observation-live" : ""}>
            {address ? "WALLET CONNECTED" : "READ-ONLY"}
          </strong>
        </div>
      </div>
    </div>
  </>;

  if (home) return <>
    <header className="home-nav"><Link href="/" className="home-brand"><div className="brand-mark">A</div><span>AMMOS<span className="text-[#a99cff]">.</span></span></Link><nav><a href="#system">Intelligence</a><a href="#command">Command</a><Link href="/strategies">Strategies</Link><Link href="/terminal">Terminal</Link></nav><div className="home-nav-actions"><WalletConnect /><Link href="/positions" className="home-enter">Enter AMMOS <span>↗</span></Link></div></header>
    <header className="mobile-topbar"><Link href="/" className="flex items-center gap-2"><div className="brand-mark small">A</div><span className="font-black tracking-[-.07em]">AMMOS<span className="text-[#9b8cff]">.</span></span></Link><div className="mobile-topbar-actions"><WalletConnect compact /><button className="hamburger" aria-label="Open navigation" onClick={() => setOpen(true)}><span/><span/><span/></button></div></header>{open && <div className="mobile-overlay" onClick={() => setOpen(false)}><aside className="mobile-drawer" onClick={e => e.stopPropagation()}>{nav}</aside></div>}
  </>;

  return <><aside className="desktop-nav">{nav}</aside><header className="mobile-topbar"><Link href="/" className="flex items-center gap-2"><div className="brand-mark small">A</div><span className="font-black tracking-[-.07em]">AMMOS<span className="text-[#9b8cff]">.</span></span></Link><div className="mobile-topbar-actions"><WalletConnect compact /><button className="hamburger" aria-label="Open navigation" onClick={() => setOpen(true)}><span/><span/><span/></button></div></header>{open && <div className="mobile-overlay" onClick={() => setOpen(false)}><aside className="mobile-drawer" onClick={e => e.stopPropagation()}>{nav}</aside></div>}</>;
}
