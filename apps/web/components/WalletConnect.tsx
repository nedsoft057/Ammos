"use client";

import { useWallet } from "./WalletProvider";

function short(address: string) { return `${address.slice(0, 6)}…${address.slice(-4)}`; }

export function WalletConnect({ compact = false }: { compact?: boolean }) {
  const { address, wallet, busy, error, connect, disconnect } = useWallet();

  return (
    <div className={`wallet-connect ${compact ? "wallet-connect-compact" : ""}`}>
      <button onClick={address ? disconnect : connect} disabled={busy} className="wallet-button">
        <span className="status-dot" />
        {address ? short(address) : busy ? "Connecting…" : compact ? "Connect" : "Connect wallet"}
      </button>
      {!compact && wallet && (
        <div className="wallet-popover">
          <div><span>ETH</span><strong>{Number(wallet.ethBalance).toFixed(4)}</strong></div>
          <div><span>WETH</span><strong>{Number(wallet.wethBalance).toFixed(4)}</strong></div>
          <div><span>USDC</span><strong>{Number(wallet.usdcBalance).toFixed(2)}</strong></div>
        </div>
      )}
      {error && <div className="wallet-error">{error}</div>}
    </div>
  );
}
