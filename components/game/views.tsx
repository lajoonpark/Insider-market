"use client";

import { COIN_CONFIGS } from "@/lib/game/constants";
import { fmtDateTime, fmtDollar, fmtPct } from "@/lib/game/format";
import { GameState, TradePreview } from "@/lib/game/types";
import { CoinCard } from "@/components/game/CoinCard";
import { HoldingsTable } from "@/components/game/HoldingsTable";
import { TradeTicket } from "@/components/game/TradeTicket";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { PortfolioPieChart } from "@/components/charts/PortfolioPieChart";

function KpiCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "good" | "bad" | "neutral" }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`text-lg font-semibold ${tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-zinc-100"}`}>{value}</p>
    </div>
  );
}

export function DashboardView({ state, derived }: { state: GameState; derived: { netWorth: number; invested: number; unrealizedPnL: number; openPositions: number; best: string; worst: string } }) {
  const pie = COIN_CONFIGS.map((c) => ({ name: c.id, value: state.holdings[c.id].units * state.coins[c.id].sellPrice })).filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Cash (available to trade)" value={fmtDollar(state.cash)} />
        <KpiCard label="Net Worth" value={fmtDollar(derived.netWorth)} />
        <KpiCard
          label="Unrealized P/L"
          value={`${derived.unrealizedPnL >= 0 ? "+" : ""}${fmtDollar(Math.abs(derived.unrealizedPnL))}`}
          tone={derived.unrealizedPnL >= 0 ? "good" : "bad"}
        />
        <KpiCard label="Invested Capital" value={fmtDollar(derived.invested)} />
        <KpiCard label="Best Performer" value={derived.best} tone="good" />
        <KpiCard label="Worst Performer" value={derived.worst} tone="bad" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PortfolioPieChart data={pie.length ? pie : [{ name: "Cash", value: state.cash }]} />
        <PerformanceChart data={state.netWorthHistory} title="Portfolio Value (USD)" />
      </div>

      <PerformanceChart data={state.netWorthHistory} title="Portfolio vs Market Index (% from start)" compare />
      <HoldingsTable coins={COIN_CONFIGS} holdings={state.holdings} coinStates={state.coins} />
    </div>
  );
}

export function MarketView({
  state,
  preview,
  onSelectCoin,
  onTrade,
}: {
  state: GameState;
  preview: ((side: "buy" | "sell", amount: number) => TradePreview) | null;
  onSelectCoin: (id: GameState["selectedCoin"]) => void;
  onTrade: (side: "buy" | "sell", amount: number) => void;
}) {
  const selected = COIN_CONFIGS.find((c) => c.id === state.selectedCoin) ?? COIN_CONFIGS[0];
  const relatedNews = state.news.filter((n) => n.coinId === selected.id).slice(0, 5);
  const coinSeries = state.coins[selected.id].history.map((p) => ({ t: p.t, value: p.price }));

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {COIN_CONFIGS.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              state={state.coins[coin.id]}
              selected={state.selectedCoin === coin.id}
              onSelect={() => onSelectCoin(coin.id)}
            />
          ))}
        </div>

        <PerformanceChart data={coinSeries} title={`${selected.name} (${selected.id}) Share Price`} />

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-200">Recent Related News</h3>
          <div className="space-y-2 text-sm">
            {relatedNews.length ? (
              relatedNews.map((n) => (
                <div key={n.id} className="rounded-md bg-zinc-800/60 p-2">
                  <p className="text-zinc-200">{n.headline}</p>
                  <p className="text-xs text-zinc-400">{fmtDateTime(n.t)}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-400">No coin-specific headlines yet.</p>
            )}
          </div>
        </div>
      </div>

      <TradeTicket
        coin={selected}
        state={state.coins[selected.id]}
        holding={state.holdings[selected.id]}
        cash={state.cash}
        previewFactory={preview}
        onTrade={onTrade}
      />
    </div>
  );
}

export function NewsView({ state }: { state: GameState }) {
  return (
    <div className="space-y-3">
      {state.news.map((n) => (
        <details key={n.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-zinc-100">{n.headline}</p>
              <p className="text-xs text-zinc-400">{fmtDateTime(n.t)}</p>
            </div>
          </summary>
          <p className="mt-2 text-sm text-zinc-300">{n.detail}</p>
          <p className="mt-1 text-xs text-zinc-400">Sentiment: {n.sentiment} · Impact: {(n.impact * 100).toFixed(1)}%</p>
        </details>
      ))}
    </div>
  );
}

export function InsiderView({ state }: { state: GameState }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-3">
        {state.insiderTips.map((tip) => (
          <div key={tip.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-100">{tip.coinId} · {tip.sourceType}</p>
              <p className="text-xs text-zinc-400">ETA ~{tip.expectedReactionMinutes}m</p>
            </div>
            <p className="mt-1 text-sm text-zinc-300">{tip.message}</p>
            <p className="mt-1 text-xs text-zinc-400">Hint: {tip.confidenceHint}</p>
            {tip.resolved ? (
              <p className={`mt-2 text-xs ${tip.wasAccurate ? "text-emerald-400" : "text-rose-400"}`}>
                Outcome: {tip.wasAccurate ? "Accurate" : "Misleading"}
              </p>
            ) : (
              <p className="mt-2 text-xs text-amber-300">Awaiting market reaction…</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-200">Source Accuracy</h3>
        <div className="space-y-2 text-xs">
          {Object.values(state.sourceStats).map((s) => {
            const acc = s.resolvedTips > 0 ? s.accurateTips / s.resolvedTips : 0;
            return (
              <div key={s.type} className="rounded-md bg-zinc-800/60 p-2">
                <p className="text-zinc-200">{s.type}</p>
                <p className="text-zinc-400">Resolved: {s.resolvedTips}/{s.tipsTotal}</p>
                <p className={acc >= 0.5 ? "text-emerald-400" : "text-rose-400"}>Accuracy: {(acc * 100).toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MissionsView({ state }: { state: GameState }) {
  return (
    <div className="space-y-3">
      {state.missions.map((m) => (
        <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-100">{m.title}</p>
            <span className={`rounded px-2 py-1 text-xs ${m.completed ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>
              {m.completed ? "Completed" : "Open"}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-300">{m.description}</p>
          <p className="mt-2 text-xs text-indigo-300">Reward: {m.reward}</p>
        </div>
      ))}
    </div>
  );
}

export function HistoryView({ state, netWorth }: { state: GameState; netWorth: number }) {
  const bestTrade = state.trades.filter((t) => t.side === "sell").sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0))[0];
  const worstTrade = state.trades.filter((t) => t.side === "sell").sort((a, b) => (a.pnl ?? 0) - (b.pnl ?? 0))[0];

  let peak = state.netWorthHistory[0]?.value ?? netWorth;
  let drawdown = 0;
  for (const p of state.netWorthHistory) {
    peak = Math.max(peak, p.value);
    drawdown = Math.min(drawdown, (p.value - peak) / peak);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Best Trade" value={bestTrade ? fmtDollar(bestTrade.pnl ?? 0) : "-"} tone="good" />
        <KpiCard label="Worst Trade" value={worstTrade ? fmtDollar(worstTrade.pnl ?? 0) : "-"} tone="bad" />
        <KpiCard label="Largest Drawdown" value={fmtPct(drawdown)} tone="bad" />
        <KpiCard label="Run Summary" value={`${state.trades.length} trades`} />
      </div>

      <PerformanceChart data={state.netWorthHistory} title="Net Worth vs Market (% from start)" compare />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-200">Trade History</h3>
        <div className="max-h-72 overflow-auto text-xs">
          {state.trades.map((t) => (
            <div key={t.id} className="flex items-center justify-between border-t border-zinc-800 py-2 text-zinc-300 first:border-t-0">
              <span>{fmtDateTime(t.t)} · {t.side.toUpperCase()} {t.coinId}</span>
              <span>{fmtDollar(t.total)} {t.side === "sell" && t.pnl !== undefined ? `(${t.pnl >= 0 ? "+" : ""}${fmtDollar(t.pnl)})` : ""}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-200">Major Decisions Timeline</h3>
        <div className="space-y-2 text-sm text-zinc-300">
          {state.majorDecisions.map((d, i) => (
            <p key={`${d.t}-${i}`}>{fmtDateTime(d.t)} — {d.text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsView({
  difficulty,
  soundEnabled,
  onDifficulty,
  onSound,
  onNewRun,
  onReset,
}: {
  difficulty: "Casual" | "Realistic" | "Chaos";
  soundEnabled: boolean;
  onDifficulty: (d: "Casual" | "Realistic" | "Chaos") => void;
  onSound: () => void;
  onNewRun: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-200">Difficulty Mode</h3>
        <div className="flex gap-2">
          {(["Casual", "Realistic", "Chaos"] as const).map((d) => (
            <button
              key={d}
              onClick={() => onDifficulty(d)}
              className={`rounded-md px-3 py-2 text-sm ${difficulty === d ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-300"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-200">Audio</h3>
        <button onClick={onSound} className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-200">
          Sound: {soundEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-200">Run Control</h3>
        <div className="flex gap-2">
          <button onClick={onNewRun} className="rounded-md bg-amber-500/20 px-3 py-2 text-sm text-amber-300">New Run</button>
          <button onClick={onReset} className="rounded-md bg-rose-500/20 px-3 py-2 text-sm text-rose-300">Reset Progress</button>
        </div>
      </div>
    </div>
  );
}
