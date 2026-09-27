"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  useState,
} from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

type EthereumProvider2 = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  on?: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void;
  removeListener?: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void;
  disconnect?: () => Promise<void>;
};

type WalletData = {
  address: string;
  ethBalance: string;
  wethBalance: string;
  usdcBalance: string;
  aaveV3?: {
    collateralUsd: string;
    debtUsd: string;
    availableBorrowsUsd: string;
    ltvPct: string;
    liquidationThresholdPct: string;
    healthFactor: string;
  };
};

type WalletContextValue = {
  address: string | null;
  wallet: WalletData | null;
  busy: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
};

const WalletContext =
  createContext<WalletContextValue | null>(null);

function isValidAddress(
  value: string | null
): value is string {
  return !!value && /^0x[a-fA-F0-9]{40}$/.test(value);
}

function getEthereum():
  | EthereumProvider2
  | undefined {
  if (typeof window === "undefined") return undefined;

  return (
    window as Window & {
      ethereum?: EthereumProvider2;
    }
  ).ethereum;
}

function subscribe(callback: () => void) {
  window.addEventListener(
    "ammos-wallet-change",
    callback
  );

  return () =>
    window.removeEventListener(
      "ammos-wallet-change",
      callback
    );
}

function getAddressSnapshot() {
  if (typeof window === "undefined") return null;

  const saved =
    window.localStorage.getItem("ammos:wallet");

  return isValidAddress(saved) ? saved : null;
}

function getServerAddressSnapshot() {
  return null;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms = 25000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          "Wallet did not respond in time. Please try again."
        )
      );
    }, ms);

    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

let wcProviderPromise:
  | ReturnType<typeof EthereumProvider.init>
  | null = null;

function getWalletConnectProvider() {
  const projectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

  if (!projectId) {
    throw new Error(
      "WalletConnect is not configured."
    );
  }

  if (!wcProviderPromise) {
    wcProviderPromise = EthereumProvider.init({
      projectId,
      chains: [1],
      showQrModal: true,
      metadata: {
        name: "AMMOS",
        description: "Autonomous DeFi intelligence",
        url: "https://ammos-ebon.vercel.app",
        icons: [
          "https://ammos-ebon.vercel.app/icon.png",
        ],
      },
    });
  }

  return wcProviderPromise;
}

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wcProviderRef =
    useRef<EthereumProvider2 | null>(null);

  const [providerVersion, setProviderVersion] =
    useState(0);

  const address = useSyncExternalStore(
    subscribe,
    getAddressSnapshot,
    getServerAddressSnapshot
  );

  const [wallet, setWallet] =
    useState<WalletData | null>(null);

  const [busy, setBusy] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const setAddress = useCallback(
    (next: string | null) => {
      if (next && isValidAddress(next)) {
        window.localStorage.setItem(
          "ammos:wallet",
          next
        );
      } else {
        window.localStorage.removeItem(
          "ammos:wallet"
        );
      }

      window.dispatchEvent(
        new Event("ammos-wallet-change")
      );
    },
    []
  );

  const fetchWalletData = useCallback(
    async (
      walletAddress: string
    ): Promise<WalletData | null> => {
      if (!isValidAddress(walletAddress)) {
        throw new Error(
          "Invalid Ethereum wallet address."
        );
      }

      const response = await fetch(
        `/api/wallet/${walletAddress}`,
        {
          cache: "no-store",
        }
      );

      const payload = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.error ??
            "Wallet data unavailable."
        );
      }

      return payload.data.wallet ?? null;
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!address) {
      setWallet(null);
      return;
    }

    const nextWallet =
      await fetchWalletData(address);

    setWallet(nextWallet);
    setError(null);
  }, [address, fetchWalletData]);

  useEffect(() => {
    if (!address) {
      setWallet(null);
      return;
    }

    let cancelled = false;

    void fetchWalletData(address)
      .then((nextWallet) => {
        if (cancelled) return;

        setWallet(nextWallet);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;

        setError(
          e instanceof Error
            ? e.message
            : "Wallet data unavailable."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [address, fetchWalletData]);

  useEffect(() => {
    const ethereum =
      getEthereum() ??
      wcProviderRef.current;

    if (!ethereum?.on) return;

    const handleAccounts = (
      ...args: unknown[]
    ) => {
      const accounts = Array.isArray(args[0])
        ? args[0]
        : [];

      const next =
        typeof accounts[0] === "string" &&
        isValidAddress(accounts[0])
          ? accounts[0]
          : null;

      setAddress(next);
      setError(null);

      if (!next) {
        setWallet(null);
      }
    };

    const handleChain = (
      ...args: unknown[]
    ) => {
      const chainId =
        typeof args[0] === "string"
          ? args[0].toLowerCase()
          : "";

      if (chainId && chainId !== "0x1") {
        setError(
          "Switch your wallet to Ethereum mainnet for AMMOS."
        );

        setWallet(null);
        return;
      }

      if (address) {
        void refresh().catch((e) => {
          setError(
            e instanceof Error
              ? e.message
              : "Wallet data unavailable."
          );
        });
      }
    };

    const handleDisconnect = () => {
      wcProviderRef.current = null;
      setAddress(null);
      setWallet(null);
      setError(null);
    };

    ethereum.on(
      "accountsChanged",
      handleAccounts
    );

    ethereum.on(
      "chainChanged",
      handleChain
    );

    ethereum.on(
      "disconnect",
      handleDisconnect
    );

    return () => {
      ethereum.removeListener?.(
        "accountsChanged",
        handleAccounts
      );

      ethereum.removeListener?.(
        "chainChanged",
        handleChain
      );

      ethereum.removeListener?.(
        "disconnect",
        handleDisconnect
      );
    };
  }, [
    address,
    refresh,
    setAddress,
    providerVersion,
  ]);

  const connect = useCallback(async () => {
    setError(null);
    setBusy(true);

    try {
      let ethereum = getEthereum();

      /*
       * Desktop:
       * use injected wallet such as MetaMask.
       *
       * Mobile browser:
       * if no injected provider exists,
       * fall back to WalletConnect.
       */
      if (!ethereum) {
        const wc =
          await getWalletConnectProvider();

        await withTimeout(
          wc.connect(),
          90000
        );

        ethereum =
          wc as unknown as EthereumProvider2;

        wcProviderRef.current = ethereum;

        setProviderVersion(
          (value) => value + 1
        );
      }

      const chainId = String(
        await withTimeout(
          ethereum.request({
            method: "eth_chainId",
          })
        )
      ).toLowerCase();

      if (chainId !== "0x1") {
        try {
          await withTimeout(
            ethereum.request({
              method:
                "wallet_switchEthereumChain",
              params: [
                {
                  chainId: "0x1",
                },
              ],
            })
          );
        } catch {
          throw new Error(
            "AMMOS requires Ethereum mainnet. Switch networks in your wallet and try again."
          );
        }
      }

      const rawAccounts =
        await withTimeout(
          ethereum.request({
            method:
              "eth_requestAccounts",
          })
        );

      const accounts = Array.isArray(
        rawAccounts
      )
        ? rawAccounts
        : [];

      const next =
        typeof accounts[0] === "string" &&
        isValidAddress(accounts[0])
          ? accounts[0]
          : null;

      if (!next) {
        throw new Error(
          "Wallet returned no valid Ethereum account."
        );
      }

      setAddress(next);

      /*
       * Keep the existing AMMOS wallet API.
       * This is the part that already works.
       */
      const response = await fetch(
        `/api/wallet/${next}`,
        {
          cache: "no-store",
        }
      );

      const payload = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.error ??
            "Wallet connected, but AMMOS could not read the wallet data."
        );
      }

      setWallet(
        payload.data.wallet ?? null
      );

      setError(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Wallet connection failed."
      );
    } finally {
      setBusy(false);
    }
  }, [setAddress]);

  const disconnect = useCallback(async () => {
    try {
      const wc =
        wcProviderRef.current;

      if (wc?.disconnect) {
        await wc.disconnect();
      }
    } catch {
      // Always clear AMMOS local state.
    }

    wcProviderRef.current = null;

    setAddress(null);
    setWallet(null);
    setError(null);

    setProviderVersion(
      (value) => value + 1
    );
  }, [setAddress]);

  const visibleWallet =
    address &&
    wallet?.address.toLowerCase() ===
      address.toLowerCase()
      ? wallet
      : null;

  const value = useMemo(
    () => ({
      address,
      wallet: visibleWallet,
      busy,
      error,
      connect,
      disconnect: () => {
        void disconnect();
      },
      refresh,
    }),
    [
      address,
      visibleWallet,
      busy,
      error,
      connect,
      disconnect,
      refresh,
    ]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context =
    useContext(WalletContext);

  if (!context) {
    throw new Error(
      "useWallet must be used inside WalletProvider"
    );
  }

  return context;
}
