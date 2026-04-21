"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function fmtYAxis(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function fmtYAxisPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`;
}

function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

export function PerformanceChart({
  data,
  title,
  compare,
}: {
  data: Array<{ t: number; value: number; marketIndex?: number }>;
  title: string;
  compare?: boolean;
}) {
  const [mode, setMode] = useState<"value" | "pct">("value");
  // compare mode always uses % so both series share the same scale
  const effectiveMode = compare ? "pct" : mode;

  const sampled = useMemo(() => {
    const startValue = data[0]?.value ?? 1;
    const startIndex = data[0]?.marketIndex ?? 100;
    const rows = data.map((d) => ({
      time: new Date(d.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      portfolio:
        effectiveMode === "value"
          ? d.value
          : ((d.value - startValue) / Math.max(startValue, 1)) * 100,
      market:
        d.marketIndex !== undefined
          ? effectiveMode === "pct"
            ? ((d.marketIndex - startIndex) / Math.max(startIndex, 1)) * 100
            : d.marketIndex
          : undefined,
    }));
    return downsample(rows, 300);
  }, [data, effectiveMode]);

  const yFormatter = effectiveMode === "value" ? fmtYAxis : fmtYAxisPct;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
        <div className="flex items-center gap-3">
          {compare && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="inline-block h-0.5 w-4 rounded bg-indigo-400" />
                Portfolio
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="inline-block h-0.5 w-4 rounded bg-cyan-400" />
                Market Index
              </span>
            </div>
          )}
          {!compare && (
            <div className="flex gap-1">
              <button
                onClick={() => setMode("value")}
                className={`rounded px-2 py-0.5 text-xs transition ${mode === "value" ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
              >
                USD
              </button>
              <button
                onClick={() => setMode("pct")}
                className={`rounded px-2 py-0.5 text-xs transition ${mode === "pct" ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
              >
                %
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sampled} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#71717a" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={yFormatter}
              tick={{ fontSize: 10, fill: "#71717a" }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#a1a1aa", marginBottom: 4 }}
              formatter={(v: unknown) => {
                const num = Number(v ?? 0);
                return effectiveMode === "value"
                  ? `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
              }}
            />
            {effectiveMode === "pct" && (
              <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
            )}
            <Line
              type="monotone"
              dataKey="portfolio"
              stroke="#818cf8"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
              name="Portfolio"
            />
            {compare ? (
              <Line
                type="monotone"
                dataKey="market"
                stroke="#22d3ee"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name="Market"
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
