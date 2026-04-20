import {
  COIN_CONFIGS,
  EVENT_LIBRARY,
  HEADLINE_TEMPLATES,
  MISSION_DEFS,
  SOURCE_RELIABILITY,
  SOURCE_TYPES,
  STARTING_CASH,
} from "@/lib/game/constants";
import {
  CoinConfig,
  CoinId,
  CoinState,
  GameSettings,
  GameState,
  InsiderTip,
  MarketEvent,
  TradePreview,
} from "@/lib/game/types";
import { nextRng, rngRange } from "@/lib/simulation/random";

const ONE_MINUTE = 60_000;

function nowStart() {
  return Date.UTC(2028, 0, 1, 9, 0, 0);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function formatDollar(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function coinConfig(id: CoinId) {
  return COIN_CONFIGS.find((c) => c.id === id) as CoinConfig;
}

function getSpreadPct(cfg: CoinConfig, fear: number, greed: number) {
  const base = 0.0015 + cfg.volatility * 2 + cfg.scamRisk * 0.02;
  const emotionPenalty = (fear + greed) / 2000;
  return base + emotionPenalty;
}

function volatilityLabel(v: number): CoinState["volatilityLabel"] {
  if (v < 0.004) return "Low";
  if (v < 0.009) return "Medium";
  if (v < 0.015) return "High";
  return "Extreme";
}

function createCoinState(cfg: CoinConfig, t: number): CoinState {
  return {
    id: cfg.id,
    price: cfg.basePrice,
    buyPrice: cfg.basePrice * 1.001,
    sellPrice: cfg.basePrice * 0.999,
    momentum: 0,
    trend24h: 0,
    history: [{ t, price: cfg.basePrice }],
    volatilityLabel: volatilityLabel(cfg.volatility),
    latestNewsIds: [],
  };
}

function newId(prefix: string, t: number, rngState: number) {
  return `${prefix}-${t}-${rngState}`;
}

export function initialGameState(seed = 1337): GameState {
  const t = nowStart();
  const coins = Object.fromEntries(
    COIN_CONFIGS.map((cfg) => [cfg.id, createCoinState(cfg, t)]),
  ) as GameState["coins"];

  const holdings = Object.fromEntries(
    COIN_CONFIGS.map((cfg) => [
      cfg.id,
      { coinId: cfg.id, units: 0, avgCost: 0, invested: 0, realizedPnL: 0 },
    ]),
  ) as GameState["holdings"];

  const sourceStats = Object.fromEntries(
    SOURCE_TYPES.map((type) => [
      type,
      { type, tipsTotal: 0, resolvedTips: 0, accurateTips: 0 },
    ]),
  ) as GameState["sourceStats"];

  return {
    seed,
    rngState: seed,
    startedAt: t,
    currentTime: t,
    paused: false,
    timeSpeed: 1,
    cash: STARTING_CASH,
    fear: 25,
    greed: 25,
    marketSentiment: 0,
    activeEvents: [],
    coins,
    holdings,
    trades: [],
    news: [],
    insiderTips: [],
    sourceStats,
    missions: MISSION_DEFS,
    unlockedFeatures: ["Base charts"],
    nav: "dashboard",
    selectedCoin: "BTCX",
    netWorthHistory: [{ t, value: STARTING_CASH, marketIndex: 100 }],
    majorDecisions: [],
    notifications: [],
    runBestValue: STARTING_CASH,
  };
}

function chooseCoin(state: GameState): CoinId {
  const pick = Math.floor(nextRng(state.rngState).value * COIN_CONFIGS.length);
  return COIN_CONFIGS[pick].id;
}

function withRng(
  state: GameState,
  fn: (next: number) => { rngState: number; result?: unknown },
) {
  const output = fn(state.rngState);
  state.rngState = output.rngState;
  return output.result;
}

function randomEvent(state: GameState): MarketEvent {
  const rName = withRng(state, (s) => {
    const next = nextRng(s);
    const idx = Math.floor(next.value * EVENT_LIBRARY.length);
    return { rngState: next.state, result: EVENT_LIBRARY[idx] };
  }) as (typeof EVENT_LIBRARY)[number];

  const targetMarket = withRng(state, (s) => {
    const next = nextRng(s);
    return { rngState: next.state, result: next.value < 0.45 };
  }) as boolean;

  const sentiment =
    rName === "influencer hype" ||
    rName === "whale accumulation" ||
    rName === "institutional adoption" ||
    rName === "chain upgrade success"
      ? 1
      : -1;

  const intensity =
    (withRng(state, (s) => {
      const rr = rngRange(s, 0.01, 0.07);
      return { rngState: rr.state, result: rr.value };
    }) as number) * sentiment;

  const duration = withRng(state, (s) => {
    const rr = rngRange(s, 30, 240);
    return { rngState: rr.state, result: Math.floor(rr.value) };
  }) as number;

  const target = targetMarket ? "market" : chooseCoin(state);

  return {
    id: newId("ev", state.currentTime, state.rngState),
    title: rName,
    detail: targetMarket
      ? `${rName} is impacting the entire market mood.`
      : `${rName} is focused on ${target}.`,
    sentiment,
    target,
    remainingMinutes: duration,
    intensity,
  };
}

function headlineFor(state: GameState, event: MarketEvent) {
  let headline = "Mixed market signals dominate trading desks";
  if (event.sentiment > 0) {
    const list =
      event.target === "MEME" ? HEADLINE_TEMPLATES.meme : HEADLINE_TEMPLATES.marketBull;
    headline = list[Math.floor(nextRng(state.rngState).value * list.length)];
  } else {
    const list = event.title.includes("exploit")
      ? HEADLINE_TEMPLATES.security
      : HEADLINE_TEMPLATES.marketBear;
    headline = list[Math.floor(nextRng(state.rngState).value * list.length)];
  }

  return {
    headline,
    detail: `${headline}. Traders are reassessing risk as ${event.title} develops.`,
    sentiment: event.sentiment > 0 ? "bullish" : "bearish",
    impact: Math.abs(event.intensity),
    source: "PulseWire",
  } as const;
}

function maybeEmitEvent(state: GameState) {
  const roll = withRng(state, (s) => {
    const next = nextRng(s);
    return { rngState: next.state, result: next.value };
  }) as number;
  if (roll > 0.018) return;

  const event = randomEvent(state);
  state.activeEvents.unshift(event);
  state.activeEvents = state.activeEvents.slice(0, 12);

  const n = headlineFor(state, event);
  const news = {
    id: newId("news", state.currentTime, state.rngState),
    t: state.currentTime,
    headline: n.headline,
    detail: n.detail,
    sentiment: n.sentiment,
    impact: n.impact,
    coinId: event.target === "market" ? undefined : event.target,
    source: n.source,
  };
  state.news.unshift(news);
  state.news = state.news.slice(0, 300);

  state.notifications.unshift({
    id: newId("toast", state.currentTime, state.rngState),
    t: state.currentTime,
    title: "Market Event",
    message: n.headline,
    type: "event",
  });
}

function maybeEmitInsiderTip(state: GameState) {
  const roll = withRng(state, (s) => {
    const next = nextRng(s);
    return { rngState: next.state, result: next.value };
  }) as number;
  if (roll > 0.01) return;

  const sourceType = SOURCE_TYPES[
    Math.floor(
      (withRng(state, (s) => {
        const next = nextRng(s);
        return { rngState: next.state, result: next.value };
      }) as number) * SOURCE_TYPES.length,
    )
  ];

  const [minRel, maxRel] = SOURCE_RELIABILITY[sourceType];
  const reliability = withRng(state, (s) => {
    const rr = rngRange(s, minRel, maxRel);
    return { rngState: rr.state, result: rr.value };
  }) as number;

  const truthRoll = withRng(state, (s) => {
    const next = nextRng(s);
    return { rngState: next.state, result: next.value };
  }) as number;

  const truthType: InsiderTip["truthType"] =
    truthRoll < reliability * 0.75
      ? "true"
      : truthRoll < reliability
        ? "partial"
        : "false";

  const coinId = chooseCoin(state);
  const eta = withRng(state, (s) => {
    const rr = rngRange(s, 20, 160);
    return { rngState: rr.state, result: Math.floor(rr.value) };
  }) as number;

  const direction =
    truthType === "false"
      ? withRng(state, (s) => {
          const next = nextRng(s);
          return { rngState: next.state, result: next.value > 0.5 ? "up" : "down" };
        })
      : withRng(state, (s) => {
          const next = nextRng(s);
          return { rngState: next.state, result: next.value > 0.35 ? "up" : "down" };
        });

  const tip: InsiderTip = {
    id: newId("tip", state.currentTime, state.rngState),
    t: state.currentTime,
    coinId,
    sourceType,
    hiddenReliability: reliability,
    message:
      direction === "up"
        ? "Whispers suggest aggressive accumulation before a catalyst."
        : "Private channels warn of coordinated unloading pressure.",
    confidenceHint:
      reliability > 0.7
        ? "Feels unusually specific"
        : reliability > 0.5
          ? "Some corroboration, still noisy"
          : "Thin signal, mostly rumors",
    expectedReactionMinutes: eta,
    truthType,
    resolved: false,
  };

  state.insiderTips.unshift(tip);
  state.insiderTips = state.insiderTips.slice(0, 120);

  state.sourceStats[sourceType].tipsTotal += 1;

  state.notifications.unshift({
    id: newId("toast", state.currentTime, state.rngState),
    t: state.currentTime,
    title: "New Insider Leak",
    message: `${sourceType} mentioned ${coinId}`,
    type: "insider",
  });
}

function resolveTips(state: GameState) {
  state.insiderTips.forEach((tip) => {
    if (tip.resolved) return;
    const elapsed = (state.currentTime - tip.t) / ONE_MINUTE;
    if (elapsed < tip.expectedReactionMinutes) return;

    const coin = state.coins[tip.coinId];
    const horizon = coin.history.slice(-Math.max(5, Math.floor(tip.expectedReactionMinutes / 2)));
    if (horizon.length < 2) return;

    const start = horizon[0].price;
    const end = horizon[horizon.length - 1].price;
    const ret = (end - start) / start;

    const expectedDirection = tip.message.includes("accumulation") ? 1 : -1;
    let accurate = false;
    if (tip.truthType === "true") accurate = ret * expectedDirection > 0.01;
    if (tip.truthType === "partial") accurate = ret * expectedDirection > 0;
    if (tip.truthType === "false") accurate = ret * expectedDirection < 0;

    tip.resolved = true;
    tip.wasAccurate = accurate;

    const stats = state.sourceStats[tip.sourceType];
    stats.resolvedTips += 1;
    if (accurate) stats.accurateTips += 1;
  });
}

function applyEventEffects(state: GameState, id: CoinId) {
  let effect = 0;
  const cfg = coinConfig(id);
  for (const ev of state.activeEvents) {
    if (ev.target === "market" || ev.target === id) {
      effect += ev.intensity * cfg.eventSensitivity;
    }
  }
  return effect;
}

function calcMarketIndex(state: GameState) {
  const avg =
    COIN_CONFIGS.reduce((sum, cfg) => {
      const c = state.coins[cfg.id];
      return sum + c.price / cfg.basePrice;
    }, 0) / COIN_CONFIGS.length;
  return avg * 100;
}

export function getNetWorth(state: GameState) {
  const holdingsValue = COIN_CONFIGS.reduce((sum, cfg) => {
    const h = state.holdings[cfg.id];
    return sum + h.units * state.coins[cfg.id].sellPrice;
  }, 0);
  return state.cash + holdingsValue;
}

function trimHistory(state: GameState) {
  for (const cfg of COIN_CONFIGS) {
    state.coins[cfg.id].history = state.coins[cfg.id].history.slice(-1500);
  }
  state.netWorthHistory = state.netWorthHistory.slice(-1500);
  state.notifications = state.notifications.slice(0, 30);
}

function updateMissions(state: GameState) {
  const netWorth = getNetWorth(state);
  const completed = new Set(state.missions.filter((m) => m.completed).map((m) => m.id));

  const profitableStreak = (() => {
    let streak = 0;
    for (const trade of [...state.trades].reverse()) {
      if (trade.side !== "sell") continue;
      if ((trade.pnl ?? 0) > 0) streak += 1;
      else break;
      if (streak >= 5) return streak;
    }
    return streak;
  })();

  const insiderWins = state.majorDecisions.filter((d) => d.text.includes("insider tip paid off")).length;

  const majorCrashSeen = state.news.some((n) =>
    /panic|hack|exploit|regulation/i.test(n.headline),
  );

  const memeHeldDuringVolatility = state.news.some(
    (n) => n.coinId === "MEME" && Math.abs(n.impact) > 0.04 && state.holdings.MEME.units > 0,
  );

  state.missions = state.missions.map((m) => {
    if (m.completed) return m;
    let done = false;
    if (m.id === "m-10x") done = netWorth >= 100_000;
    if (m.id === "m-crash") done = majorCrashSeen && netWorth > 0;
    if (m.id === "m-streak") done = profitableStreak >= 5;
    if (m.id === "m-meme") done = memeHeldDuringVolatility;
    if (m.id === "m-insider") done = insiderWins >= 3;
    if (!done) return m;

    state.notifications.unshift({
      id: newId("toast", state.currentTime, state.rngState),
      t: state.currentTime,
      title: "Mission Complete",
      message: `${m.title} unlocked: ${m.reward}`,
      type: "mission",
    });

    if (!completed.has(m.id)) {
      state.unlockedFeatures = Array.from(new Set([...state.unlockedFeatures, m.reward]));
    }

    return { ...m, completed: true };
  });
}

function updateFearGreed(state: GameState, prevWorth: number, newWorth: number) {
  const delta = (newWorth - prevWorth) / Math.max(prevWorth, 1);
  state.greed = clamp(state.greed + (delta > 0 ? delta * 600 : delta * 120), 0, 100);
  state.fear = clamp(state.fear + (delta < 0 ? -delta * 700 : -delta * 100), 0, 100);
}

export function stepGameState(state: GameState, settings: GameSettings, minutes: number) {
  const loops = Math.max(1, Math.floor(minutes));
  for (let i = 0; i < loops; i += 1) {
    const prevWorth = getNetWorth(state);

    state.currentTime += ONE_MINUTE;

    maybeEmitEvent(state);
    maybeEmitInsiderTip(state);

    state.activeEvents.forEach((ev) => {
      ev.remainingMinutes -= 1;
    });
    state.activeEvents = state.activeEvents.filter((ev) => ev.remainingMinutes > 0);

    let moodNudge = 0;
    for (const cfg of COIN_CONFIGS) {
      const c = state.coins[cfg.id];
      const noise = withRng(state, (s) => {
        const rr = rngRange(s, -cfg.volatility, cfg.volatility);
        return { rngState: rr.state, result: rr.value };
      }) as number;

      const difficultyBoost =
        settings.difficulty === "Casual"
          ? 0.8
          : settings.difficulty === "Chaos"
            ? 1.35
            : 1;

      const eventEffect = applyEventEffects(state, cfg.id);
      const sentimentDrift = state.marketSentiment * cfg.eventSensitivity * 0.001;
      const momentumPart = c.momentum * 0.4;
      const drift = cfg.trendBias + sentimentDrift + eventEffect;

      const rawMove = (drift + momentumPart + noise) * difficultyBoost;
      c.price = Math.max(0.0001, c.price * (1 + rawMove));
      c.momentum = clamp(c.momentum * 0.8 + rawMove * 0.9, -0.15, 0.15);
      c.history.push({ t: state.currentTime, price: c.price });

      const spreadPct = getSpreadPct(cfg, state.fear, state.greed);
      c.buyPrice = c.price * (1 + spreadPct / 2);
      c.sellPrice = c.price * (1 - spreadPct / 2);

      const ref = c.history[Math.max(0, c.history.length - 1440)];
      c.trend24h = ref ? (c.price - ref.price) / ref.price : 0;

      moodNudge += rawMove;
    }

    state.marketSentiment = clamp(state.marketSentiment * 0.97 + moodNudge * 0.2, -1, 1);

    resolveTips(state);

    const newWorth = getNetWorth(state);
    updateFearGreed(state, prevWorth, newWorth);

    const index = calcMarketIndex(state);
    state.netWorthHistory.push({ t: state.currentTime, value: newWorth, marketIndex: index });
    state.runBestValue = Math.max(state.runBestValue, newWorth);

    updateMissions(state);
    trimHistory(state);
  }
}

export function createTradePreview(
  state: GameState,
  coinId: CoinId,
  side: "buy" | "sell",
  orderUsd: number,
): TradePreview {
  const coin = state.coins[coinId];
  const cfg = coinConfig(coinId);
  const px = side === "buy" ? coin.buyPrice : coin.sellPrice;
  const slippagePct = clamp((orderUsd / Math.max(1000, getNetWorth(state))) * cfg.volatility * 6, 0, 0.08);
  const emotionPenalty = clamp((state.fear + state.greed - 80) / 600, 0, 0.05);
  const effectiveSlippage = slippagePct + emotionPenalty;

  const executionPrice = side === "buy" ? px * (1 + effectiveSlippage) : px * (1 - effectiveSlippage);
  const units = orderUsd <= 0 ? 0 : orderUsd / executionPrice;
  const fee = orderUsd * 0.0015;
  const spreadCost = orderUsd * (Math.abs(coin.buyPrice - coin.sellPrice) / Math.max(coin.price, 1));
  const total = side === "buy" ? orderUsd + fee : orderUsd - fee;

  if (orderUsd <= 0) {
    return {
      side,
      coinId,
      orderUsd,
      units: 0,
      estimatedPrice: executionPrice,
      fee,
      spreadCost,
      slippagePct: effectiveSlippage,
      total,
      valid: false,
      reason: "Enter an amount greater than 0",
    };
  }

  if (side === "buy" && total > state.cash) {
    return {
      side,
      coinId,
      orderUsd,
      units,
      estimatedPrice: executionPrice,
      fee,
      spreadCost,
      slippagePct: effectiveSlippage,
      total,
      valid: false,
      reason: "Not enough cash",
    };
  }

  const maxSellUsd = state.holdings[coinId].units * executionPrice;
  if (side === "sell" && orderUsd > maxSellUsd + 1e-6) {
    return {
      side,
      coinId,
      orderUsd,
      units,
      estimatedPrice: executionPrice,
      fee,
      spreadCost,
      slippagePct: effectiveSlippage,
      total,
      valid: false,
      reason: "Amount exceeds holdings",
    };
  }

  return {
    side,
    coinId,
    orderUsd,
    units,
    estimatedPrice: executionPrice,
    fee,
    spreadCost,
    slippagePct: effectiveSlippage,
    total,
    valid: true,
  };
}

export function executeTrade(
  state: GameState,
  coinId: CoinId,
  side: "buy" | "sell",
  orderUsd: number,
) {
  const preview = createTradePreview(state, coinId, side, orderUsd);
  if (!preview.valid) {
    return { ok: false, reason: preview.reason };
  }

  const holding = state.holdings[coinId];
  const trade = {
    id: newId("trade", state.currentTime, state.rngState),
    t: state.currentTime,
    coinId,
    side,
    units: preview.units,
    price: preview.estimatedPrice,
    fee: preview.fee,
    slippagePct: preview.slippagePct,
    total: preview.total,
    pnl: 0,
  };

  if (side === "buy") {
    const newUnits = holding.units + preview.units;
    const costBefore = holding.avgCost * holding.units;
    const costAdded = preview.estimatedPrice * preview.units;
    holding.units = newUnits;
    holding.avgCost = newUnits > 0 ? (costBefore + costAdded) / newUnits : 0;
    holding.invested += preview.orderUsd;

    state.cash -= preview.total;
    state.greed = clamp(state.greed + 1.2 + preview.orderUsd / 7000, 0, 100);
    state.majorDecisions.unshift({
      t: state.currentTime,
      text: `Bought ${coinId} for ${formatDollar(preview.orderUsd)}`,
    });
  } else {
    const unitsSold = preview.units;
    const costBasisSold = unitsSold * holding.avgCost;
    const proceeds = preview.orderUsd - preview.fee;
    const pnl = proceeds - costBasisSold;

    holding.units = Math.max(0, holding.units - unitsSold);
    if (holding.units === 0) holding.avgCost = 0;
    holding.realizedPnL += pnl;

    trade.pnl = pnl;
    state.cash += proceeds;
    state.fear = clamp(state.fear + (pnl < 0 ? 2 : -0.6), 0, 100);

    const fromInsider = state.insiderTips.some(
      (tip) =>
        tip.coinId === coinId &&
        !tip.resolved &&
        (state.currentTime - tip.t) / ONE_MINUTE < tip.expectedReactionMinutes,
    );

    if (fromInsider && pnl > 0) {
      state.majorDecisions.unshift({
        t: state.currentTime,
        text: `A ${coinId} insider tip paid off with ${formatDollar(pnl)} profit`,
      });
    } else {
      state.majorDecisions.unshift({
        t: state.currentTime,
        text: `Sold ${coinId} for ${formatDollar(preview.orderUsd)} (${pnl >= 0 ? "+" : ""}${formatDollar(pnl)})`,
      });
    }
  }

  state.trades.unshift(trade);
  state.trades = state.trades.slice(0, 600);

  state.notifications.unshift({
    id: newId("toast", state.currentTime, state.rngState),
    t: state.currentTime,
    title: "Trade Executed",
    message: `${side.toUpperCase()} ${coinId} ${preview.units.toFixed(4)} @ ${formatDollar(preview.estimatedPrice)}`,
    type: "trade",
  });

  return { ok: true };
}
