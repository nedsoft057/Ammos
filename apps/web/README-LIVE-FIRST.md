# AMMOS live-first build

AMMOS is intentionally live-first. If a source is unavailable, the UI shows an error or an empty state instead of fabricated APYs, balances, positions, decisions, performance or transaction results.

## Live data plane
- DeFiLlama live Ethereum yield records for Aave V3 and Uniswap V3.
- DeFiLlama live ETH/USDC reference prices.
- Ethereum RPC wallet reads for ETH, WETH and USDC.
- Groq agent chat reads the current live market context server-side.
- Persistent memory is optional through Supabase; local memory is process-local when Supabase is not configured.
- No AMMOS-owned recipient address exists in the application.

## Environment
Create `apps/web/.env.local`:

```env
ETH_RPC_URL=your_ethereum_rpc_endpoint
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-20b
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`GROQ_MODEL` can remain `openai/gpt-oss-20b` for the current build.

## Termux
Android/ARM64 does not support the native Turbopack binding used by this Next.js build, so the package scripts use Webpack:

```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Open `http://127.0.0.1:3000` in the same device. If the browser is on the device but localhost refuses the connection, the dev server is not running in another Termux session.

## Routes
- `/` live command center
- `/positions` verified wallet state
- `/strategies` live strategy lab
- `/strategies/[id]` live market detail
- `/performance` recorded outcomes only
- `/decisions` current deterministic decision surface
- `/risk` market and portfolio risk boundary
- `/memory` persisted agent memory
- `/terminal` live trace
- `/settings` configuration and execution policy

## Execution rule
Future transaction execution must create protocol-specific transaction requests and have the connected wallet sign them. AMMOS must never ask users to transfer funds to an AMMOS-controlled or hardcoded recipient address.
