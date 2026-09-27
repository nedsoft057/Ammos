"use client";

import { Header } from "@/components/Header";
import { useWallet } from "@/components/WalletProvider";
import { AmmosScene } from "@/components/AmmosScene";

export default function Positions() {
  const { address, wallet, connect, busy } = useWallet();

  return <div>
    <Header eyebrow="AMMOS / verified portfolio" title="Live position." action={<button onClick={connect} className="button-secondary">{address ? "Wallet connected" : "Connect wallet"}</button>} />
    {!address ? <section className="panel p-8 md:p-12 relative overflow-hidden"><AmmosScene compact /><div className="relative z-10 max-w-2xl"><div className="kicker">Wallet required</div><h2 className="text-3xl mt-2">No portfolio is assumed.</h2><p className="subtle mt-4">Connect an Ethereum wallet and AMMOS will read balances and the Aave V3 account state it can verify through the configured RPC.</p><button onClick={connect} disabled={busy} className="button-primary mt-6">{busy ? "Connecting…" : "Connect wallet"}</button></div></section> : <>
      <div className="flex items-center justify-between mb-3"><div className="text-xs text-[#858c98] break-all">{address}</div><div className="text-[10px] text-[#7df7b5]">LIVE · RPC VERIFIED</div></div>
      <section className="grid md:grid-cols-3 gap-3">{[["ETH",wallet?.ethBalance??"—"],["WETH",wallet?.wethBalance??"—"],["USDC",wallet?.usdcBalance??"—"]].map(([asset,value])=><div className="panel p-6 panel-hover" key={asset}><div className="kicker">Wallet asset</div><div className="text-3xl metric mt-2">{Number(value).toLocaleString(undefined,{maximumFractionDigits:6})}</div><div className="text-xs text-[#858c98] mt-2">{asset} · verified through Ethereum RPC</div></div>)}</section>
      <section className="panel p-7 mt-4"><div className="kicker">Aave V3 · Ethereum</div><h2 className="text-2xl mt-2">Protocol position state.</h2>{wallet?.aaveV3 && (Number(wallet.aaveV3.collateralUsd)>0 || Number(wallet.aaveV3.debtUsd)>0) ? <><div className="grid md:grid-cols-4 gap-3 mt-6"><Metric label="Collateral" value={`$${Number(wallet.aaveV3.collateralUsd).toLocaleString(undefined,{maximumFractionDigits:2})}`} /><Metric label="Debt" value={`$${Number(wallet.aaveV3.debtUsd).toLocaleString(undefined,{maximumFractionDigits:2})}`} /><Metric label="LTV" value={`${wallet.aaveV3.ltvPct}%`} /><Metric label="Health factor" value={Number(wallet.aaveV3.healthFactor).toFixed(3)} /></div><p className="text-xs text-[#858c98] mt-5">Liquidation threshold: {wallet.aaveV3.liquidationThresholdPct}%. AMMOS can now stress this verified account-level collateral/debt state. Asset-by-asset composition is still not inferred from the aggregate account call.</p></> : <p className="subtle mt-3">No non-zero Aave V3 collateral/debt was verified for this wallet. AMMOS will not invent protocol positions.</p>}</section>
    </>}
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div className="panel p-5"><div className="kicker">{label}</div><div className="metric text-xl mt-2">{value}</div></div>; }
