# Insider Market

Insider Market is a polished browser-based stock investing simulator game (fictional market, no real APIs) built with **Next.js + TypeScript + Tailwind CSS + Recharts**.

## Project overview

You start each run with **$10,000** and try to grow your portfolio by:

- Watching simulated market behavior
- Reacting to fictional news and random events
- Trading with buy/sell spread, fees, and slippage
- Interpreting insider leaks that can be true, false, or partial
- Managing fear/greed pressure and mission progression

All game logic runs client-side with deterministic seeded simulation and localStorage persistence.

## Features

- Modern dark trading-dashboard UI
- Desktop-first responsive layout with top bar + sidebar navigation
- Time acceleration controls: Pause, 1x, 2x, 3x, 5x, 10x, 25x, 50x, 100x
- Six fictional stocks with distinct personalities:
  - APEX, HYPE, NOVA, VALT, SHAD, GRID
- Continuous market simulation engine with:
  - trading sessions (open/close)
  - market regimes (Calm/Bullish/Bearish/Volatile/Panic)
  - trend bias
  - momentum
  - volatility
  - market sentiment
  - event impact
  - insider tip generation and resolution
- Market / Invest experience:
  - buy and sell prices shown separately
  - spread shown visually and numerically
  - trade preview with fee + spread cost + slippage
  - quick-size controls (10/25/50/Max)
- Dashboard analytics:
  - allocation pie chart
  - portfolio performance chart
  - compare-vs-market chart
  - holdings table
  - KPI cards
- News Feed with clickable detailed items and sentiment metadata
- Insider page with source types, hidden reliability, and historical accuracy tracking
- Missions/progression with unlockable rewards
- History page with trades, major decisions, drawdown, best/worst trade
- Settings:
  - difficulty (Casual / Realistic / Chaos)
  - sound toggle
  - new run
  - reset progress
- First-launch tutorial modal
- Toast notifications for events, insider leaks, trades, and mission completion

## Folder structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  charts/
  game/
  layout/
hooks/
  useGameEngine.ts
lib/
  game/
    constants.ts
    format.ts
    types.ts
  simulation/
    engine.ts
    marketEngine.ts
    random.ts
  storage/
    localStorage.ts
```

## Local development

### Prerequisites

- Node.js 20+
- npm

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Quality checks

```bash
npm run lint
npm run build
```

## Persistence model

The game saves to browser `localStorage`:

- current run state
- market/news/insider history
- mission progression
- unlocked features
- settings

## Notes on architecture

- Simulation modules are separated from UI for easier backend migration.
- Engine is deterministic with seeded RNG state for reproducibility/debugging.
- Portfolio accounting tracks holdings, average cost basis, realized/unrealized P/L, and net worth history.

## Future improvements

- Server-backed profiles and leaderboard
- Replay viewer and run comparison tooling
- More chart indicators and filters
- Expanded mission tree and achievement system
- Advanced insider source analytics
- Optional sound and richer motion polish
