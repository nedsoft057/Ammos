import { createPublicClient, formatEther, formatUnits, getAddress, http, type Address } from "viem";
import { mainnet } from "viem/chains";

const AAVE_POOL_ABI = [
  { type: "function", name: "getUserAccountData", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [
    { name: "totalCollateralBase", type: "uint256" },
    { name: "totalDebtBase", type: "uint256" },
    { name: "availableBorrowsBase", type: "uint256" },
    { name: "currentLiquidationThreshold", type: "uint256" },
    { name: "ltv", type: "uint256" },
    { name: "healthFactor", type: "uint256" },
  ] },
] as const;

const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const AAVE_V3_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as Address;
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address;
const USDC = getAddress("0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");

function client() {
  const rpc = process.env.ETH_RPC_URL;
  if (!rpc) throw new Error("ETH_RPC_URL is not configured. AMMOS will not use a fake chain source.");
  return createPublicClient({ chain: mainnet, transport: http(rpc) });
}

export async function readWallet(address: Address) {
  const c = client();
  const [eth, weth, usdc, aave] = await Promise.all([
    c.getBalance({ address }),
    c.readContract({ address: WETH, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
    c.readContract({ address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
    c.readContract({ address: AAVE_V3_POOL, abi: AAVE_POOL_ABI, functionName: "getUserAccountData", args: [address] }).catch(() => null),
  ]);

  return {
    address,
    ethBalance: formatEther(eth),
    wethBalance: formatUnits(weth, 18),
    usdcBalance: formatUnits(usdc, 6),
    aaveV3: aave ? {
      collateralUsd: formatUnits(aave[0], 8),
      debtUsd: formatUnits(aave[1], 8),
      availableBorrowsUsd: formatUnits(aave[2], 8),
      ltvPct: (Number(aave[4]) / 100).toFixed(2),
      liquidationThresholdPct: (Number(aave[3]) / 100).toFixed(2),
      healthFactor: formatUnits(aave[5], 18),
    } : undefined,
  };
}
