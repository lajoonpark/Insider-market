"use client";

import { SPEED_OPTIONS } from "@/lib/game/constants";
import { fmtDateTime, fmtDollar } from "@/lib/game/format";

export function TopBar({
  currentTime,
  cash,
  netWorth,
  totalPnL,
  paused,
  timeSpeed,
  onPause,
  onSpeed,
}: {
  currentTime: number;
  cash: number;
  netWorth: number;
  totalPnL: number;
  paused: boolean;
  timeSpeed: number;
  onPause: () => void;
  onSpeed: (s: number) => void;
}) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
        <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-300">{fmtDateTime(currentTime)}</div>
        <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-300">Cash: {fmtDollar(cash)}</div>
        <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-300">Portfolio: {fmtDollar(netWorth)}</div>
        <div
          className={`rounded-lg px-3 py-2 ${
            totalPnL >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
          }`}
        >
          Total P/L: {totalPnL >= 0 ? "+" : ""}
          {fmtDollar(totalPnL)}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`rounded-md px-3 py-1.5 text-xs ${paused ? "bg-amber-500/20 text-amber-300" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
          onClick={onPause}
        >
          Pause
        </button>
        {SPEED_OPTIONS.filter((s) => s > 0).map((s) => (
          <button
            key={s}
            className={`rounded-md px-3 py-1.5 text-xs transition ${
              timeSpeed === s ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
            onClick={() => onSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>
    </header>
  );
}
