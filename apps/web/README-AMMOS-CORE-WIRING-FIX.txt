AMMOS CORE WIRING FIX
======================

This patch is built from the latest AMMOS-fixed.zip supplied in the conversation.

Core architecture now:

  LIVE SOURCES
      ↓
  OBSERVATION SNAPSHOT
      ↓
  NORMALIZATION / DOMAIN MODEL
      ↓
  MARKET REGIME PROXY
      ↓
  OPPORTUNITY ENGINE
      ↓
  CANONICAL RISK
      ↓
  STRESS ENGINE
      ↓
  ADVERSARIAL REVIEW
      ↓
  DETERMINISTIC DECISION
      ↓
  MEMORY CONTEXT
      ↓
  GROQ EXPLANATION (optional)
      ↓
  EXPLICIT ACTION INTENT
      ↓
  USER APPROVAL
      ↓
  WALLET SIGNATURE BOUNDARY

What was fixed:

1. Live DeFiLlama data is now normalized into the AMMOS opportunity model instead of being scored separately by each UI.
2. Market regime classification is now a live implementation (with an explicit limitation that it is cross-sectional, not historical volatility forecasting).
3. Strategy/opportunity generation now consumes the same live normalized evidence used by the rest of the product.
4. Stress testing is now part of the live decision trace. Verified Aave V3 account collateral/debt can also be stressed.
5. Every lead candidate gets an adversarial review with objections and invalidation conditions before a positive action intent can form.
6. Risk is centralized through the same opportunity + position risk functions instead of page-specific risk heuristics.
7. The decision engine is now the canonical orchestration layer used by command, decisions, strategies, risk and terminal surfaces.
8. Execution remains an explicit boundary. AMMOS creates an action intent, but does not fake a transaction or claim execution. A real protocol-specific transaction builder and user signature are still required before signing.
9. Memory is now part of the decision context. Observations, strategies and agent runs are persisted when analysis is intentionally run; the provider remains Supabase/local through the existing abstraction.
10. Wallet state now includes verified Aave V3 account-level collateral, debt, LTV, liquidation threshold and health factor when the RPC call succeeds.
11. Agent chat no longer owns a second heuristic brain. It asks the canonical decision engine for the live trace and uses Groq only to explain/challenge that evidence.
12. Legacy UI-specific scoring is removed from the live product surfaces. The homepage, strategy lab, decisions, risk page and terminal all read from the same decision trace.

Important truth boundary:

- DeFiLlama gives live market observations, not protocol transaction truth.
- Generic wallet balances are not treated as Aave/Uniswap positions.
- Aave V3 aggregate account state is verified directly from the Ethereum RPC.
- Asset-level Aave collateral composition is not inferred from the aggregate account call.
- No transaction is created or executed by the decision engine.
- Simulated/stressed values are never presented as realized performance.

Validation:

A full npm dependency install was not possible in the build container because the registry/cache was incomplete. TypeScript/TSX files were syntax-transpiled successfully. Run the following in the user's Termux project after installing dependencies:

  rm -rf .next
  npm ci
  npx tsc --noEmit
  npm run lint
  npm run build

The archive intentionally contains no node_modules, .next, secrets or environment files.
