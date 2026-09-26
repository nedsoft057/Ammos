# AMMOS · Command Center UI

A polished, mobile-first AMMOS interface for the existing live-data foundation.

## What changed

- premium dark command-center visual system using purple / blue accents
- mobile hamburger navigation + full workspace sidebar on desktop
- clearer agent reasoning surface with Observe → Rank → Gate flow
- persistent live AI chat panel
- live observed-liquidity chart driven by the current DeFiLlama feed
- stronger market cards, hierarchy, spacing, typography and interaction states
- existing live wallet boundary preserved: no fabricated balances, positions, P&L or executions
- existing AMMOS routes preserved: Command, Live Position, Strategy Lab, Performance, Decisions, Risk, Memory, Terminal and Settings

## Termux

```bash
unzip AMMOS-ui-polished.zip -d ammos-new
cd ammos-new/apps/web   # only if you placed the zip inside a monorepo
npm install
npm run build
npm run dev
```

For Android / Termux, the build script intentionally uses Webpack:

```bash
npm run build
```

which maps to `next build --webpack` because Turbopack native bindings are unavailable on Android ARM64.
