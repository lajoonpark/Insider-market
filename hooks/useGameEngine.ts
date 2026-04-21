"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COIN_CONFIGS, SPEED_OPTIONS } from "@/lib/game/constants";
import { GameSettings, GameState, NavSection } from "@/lib/game/types";
import { clearGameState, loadGameState, saveGameState } from "@/lib/storage/localStorage";
import {
  createTradePreview,
  executeTrade,
  getNetWorth,
  initialGameState,
  stepGameState,
} from "@/lib/simulation/engine";

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: "Realistic",
  soundEnabled: false,
  tutorialSeen: false,
};

function hydrateState(saved: GameState | null) {
  const fallback = initialGameState(7777);
  if (!saved) return fallback;

  const coins = Object.fromEntries(
    COIN_CONFIGS.map((cfg) => [cfg.id, { ...fallback.coins[cfg.id], ...saved.coins?.[cfg.id] }]),
  ) as GameState["coins"];

  return {
    ...fallback,
    ...saved,
    coins,
    marketRegime: saved.marketRegime ?? fallback.marketRegime,
    regimeMinutesRemaining: saved.regimeMinutesRemaining ?? fallback.regimeMinutesRemaining,
  };
}

export function useGameEngine() {
  const [state, setState] = useState<GameState>(() => hydrateState(loadGameState()));
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const { paused, timeSpeed } = state;

  useEffect(() => {
    if (!state) return;
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    if (paused || timeSpeed === 0) return;
    const id = window.setInterval(() => {
      setState((prev) => {
        if (prev.paused || prev.timeSpeed === 0) return prev;
        const next = structuredClone(prev);
        stepGameState(next, settings, next.timeSpeed);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [paused, timeSpeed, settings]);

  const setNav = useCallback((nav: NavSection) => {
    setState((prev) => (prev ? { ...prev, nav } : prev));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (!SPEED_OPTIONS.includes(speed)) return;
    setState((prev) => {
      if (!prev) return prev;
      return { ...prev, timeSpeed: speed, paused: speed === 0 ? true : prev.paused };
    });
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => (prev ? { ...prev, paused: !prev.paused } : prev));
  }, []);

  const selectCoin = useCallback((coinId: GameState["selectedCoin"]) => {
    setState((prev) => (prev ? { ...prev, selectedCoin: coinId } : prev));
  }, []);

  const runTrade = useCallback(
    (side: "buy" | "sell", coinId: GameState["selectedCoin"], orderUsd: number) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        executeTrade(next, coinId, side, orderUsd);
        return next;
      });
    },
    [],
  );

  const newRun = useCallback(() => {
    setState(initialGameState(Date.now() % 100000));
  }, []);

  const resetProgress = useCallback(() => {
    clearGameState();
    setSettings(DEFAULT_SETTINGS);
    setState(initialGameState(7777));
  }, []);

  const dismissTutorial = useCallback(() => {
    setSettings((prev) => ({ ...prev, tutorialSeen: true }));
  }, []);

  const setDifficulty = useCallback((difficulty: GameSettings["difficulty"]) => {
    setSettings((prev) => ({ ...prev, difficulty }));
  }, []);

  const toggleSound = useCallback(() => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const derived = useMemo(() => {
    const netWorth = getNetWorth(state);

    let invested = 0;
    let unrealizedPnL = 0;
    let openPositions = 0;
    let best = { id: "-", val: -Infinity };
    let worst = { id: "-", val: Infinity };

    for (const cfg of COIN_CONFIGS) {
      const h = state.holdings[cfg.id];
      const c = state.coins[cfg.id];
      if (h.units <= 0) continue;
      openPositions += 1;
      invested += h.units * h.avgCost;
      const pnlPct = h.avgCost > 0 ? (c.sellPrice - h.avgCost) / h.avgCost : 0;
      unrealizedPnL += h.units * (c.sellPrice - h.avgCost);
      if (pnlPct > best.val) best = { id: cfg.id, val: pnlPct };
      if (pnlPct < worst.val) worst = { id: cfg.id, val: pnlPct };
    }

    return {
      netWorth,
      invested,
      unrealizedPnL,
      openPositions,
      best: best.id,
      worst: worst.id,
    };
  }, [state]);

  const preview = useMemo(() => {
    return (side: "buy" | "sell", orderUsd: number) =>
      createTradePreview(state, state.selectedCoin, side, orderUsd);
  }, [state]);

  return {
    state,
    settings,
    derived,
    preview,
    actions: {
      setNav,
      setSpeed,
      togglePause,
      selectCoin,
      runTrade,
      newRun,
      resetProgress,
      dismissTutorial,
      setDifficulty,
      toggleSound,
    },
  };
}
