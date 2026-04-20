export function fmtDollar(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(2)}%`;
}

export function fmtDateTime(t: number) {
  return new Date(t).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
