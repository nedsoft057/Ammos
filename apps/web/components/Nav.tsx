"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WalletConnect } from "./WalletConnect";
import { useWallet } from "./WalletProvider";

const links = [
  ["/", "Command", "⌂"], ["/positions", "Live Position", "◈"], ["/strategies", "Strategy Lab", "⌁"], ["/performance", "Performance", "◒"], ["/decisions", "Decisions", "◇"], ["/risk", "Risk", "△"], ["/memory", "Memory", "◫"], ["/terminal", "Terminal", ">_"], ["/settings", "Settings", "⚙"],
] as const;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { address } = useWallet();
  const home = pathname === "/";
  const nav = <>
    <Link href="/" className="brand" onClick={() => setOpen(false)}><div className="brand-mark">A</div><div><div className="font-black tracking-[-.08em] text-xl">AMMOS<span className="text-[#9b8cff]">.</span></div><div className="kicker mt-1">Autonomous DeFi intelligence</div></div></Link>
    <div className="px-2 mt-1 mb-3"><div className="kicker">Workspace</div></div>
    <nav className="space-y-1">{links.map(([href, label, icon]) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link ${active ? "nav-link-active" : ""}`}><span className="nav-icon">{icon}</span><span>{label}</span></Link>; })}</nav>
    <div className="mt-auto panel p-4"><div className="kicker">System</div><div className="flex items-center gap-2 mt-3 text-sm"><span className="status-dot"/> Live</div><div className="text-[10px] text-[#72798a] mt-2">live data · wallet-signed execution</div>{address && <div className="text-[9px] text-[#72798a] mt-3 truncate">wallet · {address}</div>}</div>
  </>;

  if (home) return <>
    <header className="home-nav"><Link href="/" className="home-brand"><div className="brand-mark">A</div><span>AMMOS<span className="text-[#a99cff]">.</span></span></Link><nav><a href="#system">Intelligence</a><a href="#command">Command</a><Link href="/strategies">Strategies</Link><Link href="/terminal">Terminal</Link></nav><div className="home-nav-actions"><Link href="/settings">System</Link><WalletConnect /><Link href="/positions" className="home-enter">Enter AMMOS <span>↗</span></Link></div></header>
    <header className="mobile-topbar"><Link href="/" className="flex items-center gap-2"><div className="brand-mark small">A</div><span className="font-black tracking-[-.07em]">AMMOS<span className="text-[#9b8cff]">.</span></span></Link><div className="mobile-topbar-actions"><WalletConnect compact /><button className="hamburger" aria-label="Open navigation" onClick={() => setOpen(true)}><span/><span/><span/></button></div></header>{open && <div className="mobile-overlay" onClick={() => setOpen(false)}><aside className="mobile-drawer" onClick={e => e.stopPropagation()}>{nav}</aside></div>}
  </>;

  return <><aside className="desktop-nav">{nav}</aside><header className="mobile-topbar"><Link href="/" className="flex items-center gap-2"><div className="brand-mark small">A</div><span className="font-black tracking-[-.07em]">AMMOS<span className="text-[#9b8cff]">.</span></span></Link><div className="mobile-topbar-actions"><WalletConnect compact /><button className="hamburger" aria-label="Open navigation" onClick={() => setOpen(true)}><span/><span/><span/></button></div></header>{open && <div className="mobile-overlay" onClick={() => setOpen(false)}><aside className="mobile-drawer" onClick={e => e.stopPropagation()}>{nav}</aside></div>}</>;
}
