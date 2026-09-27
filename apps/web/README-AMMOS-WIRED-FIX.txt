AMMOS WIRED FIX
================

This patch is built from AMMOS-current-source.zip.

What was fixed:
- Agent chat now accepts the frontend request correctly and sends the question plus connected wallet context to the backend.
- Chat reasoning uses the live DeFiLlama feed, current prices, optional verified wallet balances, and recent AMMOS agent runs.
- Groq is used for actual contextual reasoning when configured; if Groq is unavailable, the chat falls back to a live deterministic answer instead of becoming unusable.
- WalletConnect is restored to the landing navigation and mobile top bar.
- Wallet state is synchronized with injected-wallet accountsChanged/chainChanged events.
- Wallet connection requires Ethereum mainnet, reads real ETH/WETH/USDC balances through the existing Ethereum RPC route, and never fabricates balances.
- The old animated AmmosScene was removed from reusable page headers.
- Landing hero typography is centered and uses the same restrained typographic direction as the closing section.
- Existing backend routes and read-only execution boundary remain intact.

Validation note:
The source package was inspected and modified directly. The container did not have a complete dependency installation available, so the final tsc/Next build should be run in the user's existing AMMOS environment with:

  rm -rf .next
  npx tsc --noEmit
  npm run lint
  npm run build

No .next or node_modules directory is included in this archive.


FINAL UI PASS
=============
- Removed the hero live-observation card; the same live data already has a proper home in the command surface, so it no longer competes with the hero on small screens.
- Centered the landing hero copy and actions across desktop and mobile.
- Removed the large mobile dead zone by making the hero fit the viewport below the mobile top bar.
- Kept the cinematic field as background atmosphere only.
- Wired the connected wallet address into agent chat requests so the agent can reason from verified wallet context when available.
- Added lightweight markdown rendering for agent responses, including **bold**, inline code, lists, headings and pipe tables.
