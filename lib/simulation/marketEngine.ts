import { COIN_CONFIGS } from "@/lib/game/constants";
import { CoinConfig, CoinId, GameSettings, GameState, MarketRegime } from "@/lib/game/types";
import { nextRng, rngRange } from "@/lib/simulation/random";

const ONE_MINUTE = 60_000;
const MARKET_OPEN_MINUTE = 9 * 60 + 30;
const MARKET_CLOSE_MINUTE = 16 * 60;
const PRICE_FLOOR_MULTIPLIER = 0.15;
const PRICE_CEILING_MULTIPLIER = 30;

interface RegimeProfile {
  driftBias: number;
  volatilityMultiplier: number;
  tickCapMultiplier: number;
  eventFrequencyMultiplier: number;
}

const REGIME_PROFILES: Record<MarketRegime, RegimeProfile> = {
  Calm: { driftBias: 0.000005, volatilityMultiplier: 0.65, tickCapMultiplier: 0.8, eventFrequencyMultiplier: 0.7 },
  Bullish: { driftBias: 0.00004, volatilityMultiplier: 0.9, tickCapMultiplier: 1, eventFrequencyMultiplier: 1 },
  Bearish: { driftBias: -0.00004, volatilityMultiplier: 1, tickCapMultiplier: 1.05, eventFrequencyMultiplier: 1.05 },
  Volatile: { driftBias: 0, volatilityMultiplier: 1.35, tickCapMultiplier: 1.25, eventFrequencyMultiplier: 1.4 },
  Panic: { driftBias: -0.0001, volatilityMultiplier: 1.8, tickCapMultiplier: 1.35, eventFrequencyMultiplier: 1.75 },
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function withRng(state: GameState, fn: (seed: number) => { rngState: number; value: number }) {
  const out = fn(state.rngState);
  state.rngState = out.rngState;
  return out.value;
}

function random01(state: GameState) {
  return withRng(state, (seed) => {
    const rr = nextRng(seed);
    return { rngState: rr.state, value: rr.value };
  });
}

function randomSignedRange(state: GameState, min: number, max: number) {
  const magnitude = withRng(state, (seed) => {
    const rr = rngRange(seed, min, max);
    return { rngState: rr.state, value: rr.value };
  });
  return random01(state) > 0.5 ? magnitude : -magnitude;
}

function regimeProfile(state: GameState) {
  return REGIME_PROFILES[state.marketRegime];
}

export function isMarketOpen(currentTime: number) {
  const dt = new Date(currentTime);
  const day = dt.getUTCDay();
  if (day === 0 || day === 6) return false;
  const minute = dt.getUTCHours() * 60 + dt.getUTCMinutes();
  return minute >= MARKET_OPEN_MINUTE && minute < MARKET_CLOSE_MINUTE;
}

function pickRegime(state: GameState): MarketRegime {
  const sentiment = state.marketSentiment;
  const r = random01(state);

  if (sentiment > 0.35) {
    if (r < 0.55) return "Bullish";
    if (r < 0.78) return "Calm";
    if (r < 0.92) return "Volatile";
    return "Bearish";
  }

  if (sentiment < -0.35) {
    if (r < 0.48) return "Bearish";
    if (r < 0.66) return "Panic";
    if (r < 0.85) return "Volatile";
    return "Calm";
  }

  if (r < 0.42) return "Calm";
  if (r < 0.7) return "Bullish";
  if (r < 0.9) return "Bearish";
  if (r < 0.98) return "Volatile";
  return "Panic";
}

export function updateMarketRegime(state: GameState) {
  state.regimeMinutesRemaining -= 1;
  if (state.regimeMinutesRemaining > 0) return;

  state.marketRegime = pickRegime(state);
  const duration = withRng(state, (seed) => {
    const rr = rngRange(seed, 90, 360);
    return { rngState: rr.state, value: Math.floor(rr.value) };
  });
  state.regimeMinutesRemaining = duration;
}

export function getEventSpawnProbability(state: GameState) {
  return 0.0035 * regimeProfile(state).eventFrequencyMultiplier;
}

function sampleNoiseMove(state: GameState, cfg: CoinConfig, profile: RegimeProfile) {
  const roll = random01(state);
  let min = 0.0001;
  let max = 0.002;

  if (roll > 0.85 && roll <= 0.97) {
    min = 0.002;
    max = 0.01;
  } else if (roll > 0.97) {
    min = 0.01;
    max = 0.04;
  }

  const volScale = clamp(cfg.volatility / 0.0012, 0.45, 3);
  return randomSignedRange(state, min, max) * volScale * profile.volatilityMultiplier;
}

function getEventImpact(state: GameState, id: CoinId, cfg: CoinConfig) {
  let impact = 0;
  for (const ev of state.activeEvents) {
    if (ev.target !== "market" && ev.target !== id) continue;
    const decay = ev.remainingMinutes > 180 ? 0.55 : ev.remainingMinutes > 60 ? 1 : 0.75;
    impact += ev.intensity * cfg.eventSensitivity * decay;
  }
  return clamp(impact, -cfg.maxEventMove, cfg.maxEventMove);
}

function getInsiderImpact(state: GameState, id: CoinId, cfg: CoinConfig) {
  let impact = 0;
  for (const tip of state.insiderTips) {
    if (tip.coinId !== id || tip.resolved) continue;
    const age = (state.currentTime - tip.t) / ONE_MINUTE;
    const horizon = tip.expectedReactionMinutes;
    if (age > horizon * 1.6) continue;

    const truthFactor = tip.truthType === "true" ? 1 : tip.truthType === "partial" ? 0.55 : -0.6;
    const direction = tip.expectedDirection === "up" ? 1 : -1;
    const base = 0.00025 * (0.6 + tip.hiddenReliability) * cfg.insiderSensitivity;

    const phase =
      age < horizon * 0.4
        ? 0.65
        : age < horizon
          ? 1.2
          : -0.7;

    impact += base * truthFactor * direction * phase;
  }
  return clamp(impact, -cfg.maxEventMove * 0.6, cfg.maxEventMove * 0.6);
}

function applyOpenGap(state: GameState, cfg: CoinConfig) {
  const coin = state.coins[cfg.id];
  const baselineGap = randomSignedRange(state, 0.0004, 0.0065);
  const eventGap = getEventImpact(state, cfg.id, cfg) * 3.2;
  const gap = clamp(baselineGap + eventGap, -0.05, 0.05);

  coin.price = clamp(
    coin.price * (1 + gap),
    cfg.basePrice * PRICE_FLOOR_MULTIPLIER,
    cfg.basePrice * PRICE_CEILING_MULTIPLIER,
  );
  coin.intradayOpenPrice = coin.price;
  coin.dailyMovePct = 0;
}

function hasMajorPositiveCatalyst(state: GameState, id: CoinId) {
  return state.activeEvents.some(
    (ev) =>
      (ev.target === "market" || ev.target === id) &&
      ev.sentiment > 0 &&
      Math.abs(ev.intensity) > 0.005,
  );
}

function hasMajorNegativeCatalyst(state: GameState, id: CoinId) {
  return state.activeEvents.some(
    (ev) =>
      (ev.target === "market" || ev.target === id) &&
      ev.sentiment < 0 &&
      Math.abs(ev.intensity) > 0.005,
  );
}

export function runMarketTick(state: GameState, settings: GameSettings) {
  updateMarketRegime(state);
  const profile = regimeProfile(state);
  const nowOpen = isMarketOpen(state.currentTime);
  const prevOpen = isMarketOpen(state.currentTime - ONE_MINUTE);
  const justOpened = nowOpen && !prevOpen;

  if (!nowOpen) {
    state.marketSentiment = clamp(state.marketSentiment * 0.996, -1, 1);
    return { marketOpen: false, moodNudge: 0 };
  }

  let moodNudge = 0;

  for (const cfg of COIN_CONFIGS) {
    const coin = state.coins[cfg.id];
    if (justOpened) applyOpenGap(state, cfg);

    const eventImpact = getEventImpact(state, cfg.id, cfg);
    const insiderImpact = getInsiderImpact(state, cfg.id, cfg);
    const noise = sampleNoiseMove(state, cfg, profile);
    const sentimentDrift = state.marketSentiment * cfg.eventSensitivity * 0.00045;
    const momentum = coin.momentum * 0.28;
    const regimeDrift = profile.driftBias;
    const stockDrift = cfg.trendBias;
    let meanReversion = 0;

    if (coin.dailyMovePct > cfg.dailyMoveLimit * 0.6) {
      meanReversion -= Math.abs(randomSignedRange(state, 0.00015, 0.0012));
    } else if (coin.dailyMovePct < -cfg.dailyMoveLimit * 0.6) {
      meanReversion += Math.abs(randomSignedRange(state, 0.00015, 0.0012));
    }

    if (coin.cooldownTicks > 0) {
      const damp = randomSignedRange(state, 0.0001, 0.0008);
      meanReversion += coin.dailyMovePct >= 0 ? -Math.abs(damp) : Math.abs(damp);
      coin.cooldownTicks -= 1;
    }

    const difficultyMultiplier =
      settings.difficulty === "Casual"
        ? 0.9
        : settings.difficulty === "Chaos"
          ? 1.2
          : 1;

    let move =
      (noise + sentimentDrift + stockDrift + regimeDrift + momentum + eventImpact + insiderImpact + meanReversion) *
      difficultyMultiplier;

    const dailyUsage = Math.abs(coin.dailyMovePct) / Math.max(cfg.dailyMoveLimit, 0.0001);
    if (dailyUsage > 0.8) move *= 0.55;
    if (dailyUsage > 1) move *= 0.35;
    if (dailyUsage > 1.25) coin.cooldownTicks = Math.max(coin.cooldownTicks, 25);

    const historyRef = coin.history[Math.max(0, coin.history.length - 120)];
    if (historyRef) {
      const shortWindowMove = (coin.price - historyRef.price) / Math.max(historyRef.price, 0.0001);
      if (shortWindowMove > 0.26 && !hasMajorPositiveCatalyst(state, cfg.id)) {
        move = Math.min(move, -Math.abs(randomSignedRange(state, 0.0005, 0.0035)));
        coin.cooldownTicks = Math.max(coin.cooldownTicks, 40);
      }
      if (shortWindowMove < -0.3 && !hasMajorNegativeCatalyst(state, cfg.id)) {
        move = Math.max(move, Math.abs(randomSignedRange(state, 0.0004, 0.003)));
      }
    }

    const tickCap = cfg.maxMovePerTick * profile.tickCapMultiplier;
    move = clamp(move, -tickCap, tickCap);

    coin.price = clamp(
      coin.price * (1 + move),
      cfg.basePrice * PRICE_FLOOR_MULTIPLIER,
      cfg.basePrice * PRICE_CEILING_MULTIPLIER,
    );
    coin.momentum = clamp(coin.momentum * 0.75 + move * 0.82, -0.03, 0.03);
    coin.dailyMovePct =
      coin.intradayOpenPrice > 0 ? (coin.price - coin.intradayOpenPrice) / coin.intradayOpenPrice : 0;
    coin.history.push({ t: state.currentTime, price: coin.price });
    moodNudge += move;
  }

  return { marketOpen: true, moodNudge };
}
