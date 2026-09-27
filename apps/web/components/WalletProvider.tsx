"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, useState } from "react";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

type WalletData = { address: string; ethBalance: string; wethBalance: string; usdcBalance: string; aaveV3?: { collateralUsd: string; debtUsd: string; availableBorrowsUsd: string; ltvPct: string; liquidationThresholdPct: string; healthFactor: string } };

type WalletContextValue = { address: string | null; wallet: WalletData | null; busy: boolean; error: string | null; connect: () => Promise<void>; disconnect: () => void; refresh: () => Promise<void> };

const WalletContext = createContext<WalletContextValue | null>(null);

function isValidAddress(value: string | null): value is string { return !!value && /^0x[a-fA-F0-9]{40}$/.test(value); }
function getEthereum(): EthereumProvider | undefined { return typeof window === "undefined" ? undefined : (window as Window & { ethereum?: EthereumProvider }).ethereum; }
function subscribe(callback: () => void) { window.addEventListener("ammos-wallet-change", callback); return () => window.removeEventListener("ammos-wallet-change", callback); }
function getAddressSnapshot() { if (typeof window === "undefined") return null; const saved = window.localStorage.getItem("ammos:wallet"); return isValidAddress(saved) ? saved : null; }
function getServerAddressSnapshot() { return null; }

function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Wallet did not respond in time. Please try again.")), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const address = useSyncExternalStore(subscribe, getAddressSnapshot, getServerAddressSnapshot);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAddress = useCallback((next: string | null) => {
    if (next && isValidAddress(next)) window.localStorage.setItem("ammos:wallet", next);
    else window.localStorage.removeItem("ammos:wallet");
    window.dispatchEvent(new Event("ammos-wallet-change"));
  }, []);

  const fetchWalletData = useCallback(async (walletAddress: string): Promise<WalletData | null> => {
    const response = await fetch(`/api/wallet/${walletAddress}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Wallet data unavailable.");
    return payload.data.wallet ?? null;
  }, []);

  const refresh = useCallback(async () => {
    if (!address) {
      setWallet(null);
      return;
    }
    const nextWallet = await fetchWalletData(address);
    setWallet(nextWallet);
    setError(null);
  }, [address, fetchWalletData]);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    void fetchWalletData(address)
      .then((nextWallet) => {
        if (cancelled) return;
        setWallet(nextWallet);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Wallet data unavailable.");
      });

    return () => {
      cancelled = true;
    };
  }, [address, fetchWalletData]);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum?.on) return;

    const handleAccounts = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : [];
      const next = typeof accounts[0] === "string" && isValidAddress(accounts[0]) ? accounts[0] : null;
      setAddress(next);
      setError(null);
    };
    const handleChain = (...args: unknown[]) => {
      const chainId = typeof args[0] === "string" ? args[0].toLowerCase() : "";
      if (chainId && chainId !== "0x1") {
        setError("Switch your wallet to Ethereum mainnet for AMMOS.");
        setWallet(null);
      } else if (address) {
        void refresh().catch((e) => setError(e instanceof Error ? e.message : "Wallet data unavailable."));
      }
    };

    ethereum.on("accountsChanged", handleAccounts);
    ethereum.on("chainChanged", handleChain);
    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccounts);
      ethereum.removeListener?.("chainChanged", handleChain);
    };
  }, [address, refresh, setAddress]);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    setError(null);
    if (!ethereum) {
      setError("No injected wallet found. Open AMMOS from your wallet browser or install a wallet extension.");
      return;
    }

    setBusy(true);
    try {
      const chainId = String(await withTimeout(ethereum.request({ method: "eth_chainId" }))).toLowerCase();
      if (chainId !== "0x1") {
        try {
          await withTimeout(ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x1" }] }));
        } catch {
          throw new Error("AMMOS requires Ethereum mainnet. Switch networks in your wallet and try again.");
        }
      }

      const rawAccounts = await withTimeout(ethereum.request({ method: "eth_requestAccounts" }));
      const accounts = Array.isArray(rawAccounts) ? rawAccounts : [];
      const next = typeof accounts[0] === "string" && isValidAddress(accounts[0]) ? accounts[0] : null;
      if (!next) throw new Error("Wallet returned no valid Ethereum account.");
      setAddress(next);
      const response = await fetch(`/api/wallet/${next}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Wallet connected, but AMMOS could not read the wallet data.");
      setWallet(payload.data.wallet ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connection failed.");
    } finally {
      setBusy(false);
    }
  }, [setAddress]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWallet(null);
    setError(null);
  }, [setAddress]);

  const visibleWallet = address && wallet?.address.toLowerCase() === address.toLowerCase() ? wallet : null;
  const value = useMemo(() => ({ address, wallet: visibleWallet, busy, error, connect, disconnect, refresh }), [address, visibleWallet, busy, error, connect, disconnect, refresh]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() { const context = useContext(WalletContext); if (!context) throw new Error("useWallet must be used inside WalletProvider"); return context; }
