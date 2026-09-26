import { createPublicClient, formatEther, formatUnits, http, type Address } from "viem";
import { mainnet } from "viem/chains";

const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address;
const USDC = "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Address;

function client() {
  const rpc = process.env.ETH_RPC_URL;
  if (!rpc) throw new Error("ETH_RPC_URL is not configured. AMMOS will not use a fake chain source.");
  return createPublicClient({ chain: mainnet, transport: http(rpc) });
}

export async function readWallet(address: Address) {
  const c = client();
  const [eth, weth, usdc] = await Promise.all([
    c.getBalance({ address }),
    c.readContract({ address: WETH, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
    c.readContract({ address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
  ]);

  return {
    address,
    ethBalance: formatEther(eth),
    wethBalance: formatUnits(weth, 18),
    usdcBalance: formatUnits(usdc, 6),
  };
}
