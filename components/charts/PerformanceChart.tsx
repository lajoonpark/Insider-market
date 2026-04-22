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

const VALUE_ONE_DECIMAL_THRESHOLD = 10;
const VALUE_ONE_DECIMAL_PLACES = 1;
const VALUE_TWO_DECIMAL_PLACES = 2;
const DEFAULT_STEP_PRECISION = 1;
const FLOATING_POINT_EPSILON = 1e-10;

function fmtYAxis(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  if (Math.abs(value) >= VALUE_ONE_DECIMAL_THRESHOLD) return `$${value.toFixed(VALUE_ONE_DECIMAL_PLACES)}`;
  return `$${value.toFixed(VALUE_TWO_DECIMAL_PLACES)}`;
}

function fmtYAxisPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`;
}

function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

function roundToStep(value: number, step: number): number {
  const precision = step < 1 ? Math.max(0, Math.ceil(-Math.log10(step))) : DEFAULT_STEP_PRECISION;
  return Number(value.toFixed(precision));
}

function makeTicks(min: number, max: number, baseStep: number, maxTicks = 12): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) {
    return [
      roundToStep(min - baseStep, baseStep),
      roundToStep(min, baseStep),
      roundToStep(min + baseStep, baseStep),
    ];
  }

  const desiredCount = (max - min) / baseStep;
  const scale = desiredCount > maxTicks ? Math.ceil(desiredCount / maxTicks) : 1;
  const step = baseStep * scale;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  const tickCount = Math.floor((end - start) / step + FLOATING_POINT_EPSILON) + 1;
  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i += 1) {
    const v = start + i * step;
    ticks.push(roundToStep(v, step));
  }
  return ticks;
}

const MINUTES_IN_1H = 60;
const MINUTES_IN_6H = 360;
const MINUTES_IN_24H = 1440;
const FINE_VALUE_RANGE_THRESHOLD = 2;
const MEDIUM_VALUE_RANGE_THRESHOLD = 10;
const FINE_VALUE_STEP = 0.1;
const MEDIUM_VALUE_STEP = 0.5;
const ZOOM_MINUTES: Record<"1H" | "6H" | "24H", number> = {
  "1H": MINUTES_IN_1H,
  "6H": MINUTES_IN_6H,
  "24H": MINUTES_IN_24H,
};

function zoomButtonClass(active: boolean) {
  return `rounded px-2 py-0.5 text-xs transition ${
    active ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
  }`;
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
  const [zoom, setZoom] = useState<"1H" | "6H" | "24H" | "ALL">("ALL");
  // compare mode always uses % so both series share the same scale
  const effectiveMode = compare ? "pct" : mode;
  const zoomedData = useMemo(() => {
    if (zoom === "ALL") return data;
    return data.slice(-ZOOM_MINUTES[zoom]);
  }, [data, zoom]);

  const sampled = useMemo(() => {
    const startValue = zoomedData[0]?.value ?? 1;
    const startIndex = zoomedData[0]?.marketIndex ?? 100;
    const rows = zoomedData.map((d) => ({
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
  }, [zoomedData, effectiveMode]);

  const yFormatter = effectiveMode === "value" ? fmtYAxis : fmtYAxisPct;
  const valueYAxis = useMemo(() => {
    if (effectiveMode !== "value" || sampled.length === 0) return null;

    const values = sampled.flatMap((point) =>
      compare ? [point.portfolio, point.market ?? point.portfolio] : [point.portfolio],
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    const baseStep =
      range <= FINE_VALUE_RANGE_THRESHOLD
        ? FINE_VALUE_STEP
        : range <= MEDIUM_VALUE_RANGE_THRESHOLD
          ? MEDIUM_VALUE_STEP
          : null;
    if (!baseStep) return null;

    const ticks = makeTicks(min, max, baseStep);
    if (ticks.length < 2) return null;

    return {
      ticks,
      domain: [ticks[0], ticks[ticks.length - 1]] as [number, number],
    };
  }, [compare, effectiveMode, sampled]);

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
          <div className="flex gap-1">
            {(["1H", "6H", "24H", "ALL"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setZoom(range)}
                className={zoomButtonClass(zoom === range)}
              >
                {range}
              </button>
            ))}
          </div>
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
              ticks={valueYAxis?.ticks}
              domain={valueYAxis?.domain}
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
