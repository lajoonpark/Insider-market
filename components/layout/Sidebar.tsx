"use client";

import { NAV_ITEMS } from "@/lib/game/constants";
import { NavSection } from "@/lib/game/types";

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function Sidebar({
  nav,
  fear,
  greed,
  onSelect,
}: {
  nav: NavSection;
  fear: number;
  greed: number;
  onSelect: (n: NavSection) => void;
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/70 p-4">
      <h1 className="mb-6 text-xl font-semibold tracking-wide text-white">Insider Market</h1>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const selected = nav === item.key;
          return (
            <button
              key={item.key}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                selected
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
              onClick={() => onSelect(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <Meter label="Fear" value={fear} color="bg-rose-500" />
        <Meter label="Greed" value={greed} color="bg-emerald-500" />
      </div>
    </aside>
  );
}
