"use client";

import { CoinConfig, Holding, CoinState } from "@/lib/game/types";
import { fmtDollar, fmtPct } from "@/lib/game/format";

export function HoldingsTable({
  coins,
  holdings,
  coinStates,
}: {
  coins: CoinConfig[];
  holdings: Record<string, Holding>;
  coinStates: Record<string, CoinState>;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-200">Holdings</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="px-2 py-2 text-left">Coin</th>
              <th className="px-2 py-2 text-right">Units</th>
              <th className="px-2 py-2 text-right">Avg Cost</th>
              <th className="px-2 py-2 text-right">Current Value</th>
              <th className="px-2 py-2 text-right">P/L %</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((c) => {
              const h = holdings[c.id];
              const s = coinStates[c.id];
              const value = h.units * s.sellPrice;
              const pnlPct = h.avgCost > 0 ? (s.sellPrice - h.avgCost) / h.avgCost : 0;
              return (
                <tr key={c.id} className="border-t border-zinc-800">
                  <td className="px-2 py-2 text-zinc-200">{c.id}</td>
                  <td className="px-2 py-2 text-right text-zinc-300">{h.units.toFixed(4)}</td>
                  <td className="px-2 py-2 text-right text-zinc-300">{fmtDollar(h.avgCost)}</td>
                  <td className="px-2 py-2 text-right text-zinc-300">{fmtDollar(value)}</td>
                  <td className={`px-2 py-2 text-right ${pnlPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {fmtPct(pnlPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
