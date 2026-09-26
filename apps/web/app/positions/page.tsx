"use client";

import { Header } from "@/components/Header";
import { useWallet } from "@/components/WalletProvider";
import { AmmosScene } from "@/components/AmmosScene";

export default function Positions() {
  const { address, wallet, connect, busy } = useWallet();
  return <div>
    <Header eyebrow="AMMOS / live portfolio" title="Live position." action={<button onClick={connect} className="button-secondary">{address ? "Wallet connected" : "Connect wallet"}</button>} />
    {!address ? <section className="panel p-8 md:p-12 relative overflow-hidden">
      <AmmosScene compact />
      <div className="relative z-10 max-w-2xl"><div className="kicker">Wallet required</div><h2 className="text-3xl mt-2">No portfolio is assumed.</h2><p className="subtle mt-4">Connect an Ethereum wallet and AMMOS will read the balances it can verify through the configured RPC. Until then, this page remains intentionally empty.</p><button onClick={connect} disabled={busy} className="button-primary mt-6">{busy ? "Connecting…" : "Connect wallet"}</button></div>
    </section> : <>
      <div className="flex items-center justify-between mb-3"><div className="text-xs text-[#858c98] break-all">{address}</div><div className="text-[10px] text-[#7df7b5]">LIVE</div></div>
      <section className="grid md:grid-cols-3 gap-3">{[["ETH",wallet?.ethBalance??"—"],["WETH",wallet?.wethBalance??"—"],["USDC",wallet?.usdcBalance??"—"]].map(([asset,value])=><div className="panel p-6 panel-hover" key={asset}><div className="kicker">Wallet asset</div><div className="text-3xl metric mt-2">{Number(value).toLocaleString(undefined,{maximumFractionDigits:6})}</div><div className="text-xs text-[#858c98] mt-2">{asset} · verified through Ethereum RPC</div></div>)}</section>
      <section className="panel p-7 mt-4 relative overflow-hidden"><AmmosScene compact /><div className="relative z-10"><div className="kicker">Protocol positions</div><h2 className="text-2xl mt-2">No unverified position data.</h2><p className="subtle mt-3 max-w-3xl">AMMOS currently verifies base ETH, WETH and USDC balances. It will only label an Aave, Uniswap or other protocol position once a protocol-specific on-chain adapter can verify it for this wallet.</p></div></section>
    </>}
  </div>;
}
