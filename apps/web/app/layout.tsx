import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { WalletProvider } from "@/components/WalletProvider";
import { ChatPanel } from "@/components/ChatPanel";

export const metadata: Metadata = {
  title: "AMMOS · Autonomous DeFi Intelligence",
  description: "Live autonomous liquidity, lending and yield strategy intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WalletProvider><Nav /><main className="app-main"><div className="page-wrap">{children}</div><ChatPanel /></main></WalletProvider></body></html>;
}
