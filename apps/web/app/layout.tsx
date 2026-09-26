import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "AMMOS · Autonomous DeFi Intelligence",
  description: "Autonomous liquidity, lending and yield strategy intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="lg:pl-60 min-h-screen">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-7">{children}</div>
        </main>
      </body>
    </html>
  );
}
