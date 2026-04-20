"use client";

import { CoinConfig, CoinState } from "@/lib/game/types";
import { fmtDollar, fmtPct } from "@/lib/game/format";

export function CoinCard({
  coin,
  state,
  selected,
  onSelect,
}: {
  coin: CoinConfig;
  state: CoinState;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-indigo-500 bg-indigo-500/10"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/80"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="font-medium text-zinc-100">{coin.name}</div>
          <div className="text-xs text-zinc-400">{coin.id}</div>
        </div>
        <div className={`text-xs ${state.trend24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {fmtPct(state.trend24h)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-zinc-800/70 p-2 text-zinc-200">Buy: {fmtDollar(state.buyPrice)}</div>
        <div className="rounded bg-zinc-800/70 p-2 text-zinc-200">Sell: {fmtDollar(state.sellPrice)}</div>
      </div>
      <div className="mt-3 flex gap-2 text-[11px]">
        <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">Vol: {state.volatilityLabel}</span>
        <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">Risk: {coin.riskLabel}</span>
      </div>
    </button>
  );
}
