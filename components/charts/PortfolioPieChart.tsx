"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#22d3ee", "#818cf8", "#10b981", "#f59e0b", "#f43f5e", "#a78bfa"];

export function PortfolioPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="h-72 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-200">Asset Allocation</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} innerRadius={58}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `$${Number(v ?? 0).toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
