"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PerformanceChart({
  data,
  title,
  compare,
}: {
  data: Array<{ t: number; value: number; marketIndex?: number }>;
  title: string;
  compare?: boolean;
}) {
  const rows = data.map((d) => ({ ...d, time: new Date(d.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }));

  return (
    <div className="h-72 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-200">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#818cf8" dot={false} strokeWidth={2} />
          {compare ? <Line type="monotone" dataKey="marketIndex" stroke="#22d3ee" dot={false} strokeWidth={2} /> : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
