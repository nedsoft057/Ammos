# AMMOS

Autonomous Market-Making & Optimization System.

AMMOS evaluates DeFi yield, liquidity, lending, borrowing and staking opportunities, simulates strategies under multiple market regimes, applies deterministic risk gates, and produces an explainable agent decision.

## Current build

This package is a deployable frontend foundation with:
- Next.js App Router + TypeScript
- polished AMMOS command-center UI
- strategy comparison
- deterministic risk scoring
- stress-test simulation
- agent terminal trace
- portfolio risk view
- strategy memory view
- mocked data clearly labeled as simulated

No wallet private keys or live transaction execution are included.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm start
```

## Routes

- `/` command center
- `/terminal` agent reasoning trace
- `/strategies` opportunity/strategy lab
- `/strategies/eth-usdc` strategy detail
- `/risk` portfolio risk
- `/memory` strategy memory

The simulation layer is deterministic and intentionally separated from the UI so live adapters can be added later.
