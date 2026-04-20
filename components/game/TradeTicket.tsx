"use client";

import { useMemo, useState } from "react";
import { CoinConfig, CoinState, Holding, TradePreview } from "@/lib/game/types";
import { fmtDollar } from "@/lib/game/format";

export function TradeTicket({
  coin,
  state,
  holding,
  cash,
  previewFactory,
  onTrade,
}: {
  coin: CoinConfig;
  state: CoinState;
  holding: Holding;
  cash: number;
  previewFactory: ((side: "buy" | "sell", amount: number) => TradePreview) | null;
  onTrade: (side: "buy" | "sell", amount: number) => void;
}) {
  const [amount, setAmount] = useState(500);
  const [side, setSide] = useState<"buy" | "sell">("buy");

  const preview = useMemo(() => {
    if (!previewFactory) return null;
    return previewFactory(side, amount);
  }, [amount, previewFactory, side]);

  const maxSellValue = holding.units * state.sellPrice;

  const quickSet = (fraction: number) => {
    if (side === "buy") setAmount(Math.max(1, cash * fraction));
    else setAmount(Math.max(1, maxSellValue * fraction));
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-200">{coin.name} ({coin.id})</h3>
        <p className="mt-1 text-xs text-zinc-400">{coin.description}</p>
      </div>

      <div className="rounded-lg bg-zinc-800/70 p-3 text-sm text-zinc-200">
        <div className="flex justify-between"><span>Buy Price</span><span>{fmtDollar(state.buyPrice)}</span></div>
        <div className="flex justify-between"><span>Sell Price</span><span>{fmtDollar(state.sellPrice)}</span></div>
        <div className="mt-1 flex justify-between text-xs text-zinc-400">
          <span>Spread</span>
          <span>{fmtDollar(state.buyPrice - state.sellPrice)} ({(((state.buyPrice - state.sellPrice) / state.price) * 100).toFixed(2)}%)</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Spread is the gap between buy and sell price. Slippage applies to large orders. Fee is 0.15%.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("buy")}
          className={`rounded-md px-3 py-2 text-sm ${side === "buy" ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-300"}`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`rounded-md px-3 py-2 text-sm ${side === "sell" ? "bg-rose-500/20 text-rose-300" : "bg-zinc-800 text-zinc-300"}`}
        >
          Sell
        </button>
      </div>

      <label className="block text-xs text-zinc-400">
        Order Amount (USD)
        <input
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          type="number"
          min={1}
          value={Math.round(amount)}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </label>

      <div className="grid grid-cols-4 gap-2 text-xs">
        {[0.1, 0.25, 0.5, 1].map((f, idx) => (
          <button key={f} onClick={() => quickSet(f)} className="rounded bg-zinc-800 px-2 py-1 text-zinc-300 hover:bg-zinc-700">
            {idx === 3 ? "Max" : `${f * 100}%`}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-zinc-800/60 p-3 text-xs text-zinc-300">
        <div className="flex justify-between"><span>Current holdings</span><span>{holding.units.toFixed(4)} {coin.id}</span></div>
        <div className="flex justify-between"><span>Average cost basis</span><span>{fmtDollar(holding.avgCost)}</span></div>
        {preview ? (
          <>
            <div className="mt-2 border-t border-zinc-700 pt-2">
              <div className="flex justify-between"><span>Estimated price</span><span>{fmtDollar(preview.estimatedPrice)}</span></div>
              <div className="flex justify-between"><span>Fee</span><span>{fmtDollar(preview.fee)}</span></div>
              <div className="flex justify-between"><span>Spread cost</span><span>{fmtDollar(preview.spreadCost)}</span></div>
              <div className="flex justify-between"><span>Slippage</span><span>{(preview.slippagePct * 100).toFixed(2)}%</span></div>
              <div className="mt-1 flex justify-between font-medium text-zinc-100">
                <span>{side === "buy" ? "Total cost" : "Net proceeds"}</span>
                <span>{fmtDollar(preview.total)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Cash after trade</span>
                <span>{fmtDollar(side === "buy" ? cash - preview.total : cash + preview.total)}</span>
              </div>
              {!preview.valid ? <p className="mt-2 text-rose-400">{preview.reason}</p> : null}
            </div>
          </>
        ) : null}
      </div>

      <button
        onClick={() => onTrade(side, amount)}
        disabled={!preview?.valid}
        className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-zinc-700"
      >
        Execute {side.toUpperCase()}
      </button>
    </div>
  );
}
