"use client";

import { useEffect, useMemo, useState } from "react";
import { NotificationToast } from "@/lib/game/types";

export function EventToasts({ toasts }: { toasts: NotificationToast[] }) {
  const [bornAt, setBornAt] = useState<Record<string, number>>({});
  const [dismissed, setDismissed] = useState<Record<string, true>>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const ts = Date.now();
    setBornAt((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const toast of toasts) {
        if (next[toast.id] !== undefined) continue;
        next[toast.id] = ts;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [toasts]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const visibleToasts = useMemo(() => {
    return toasts
      .filter((toast) => !dismissed[toast.id])
      .filter((toast) => now - (bornAt[toast.id] ?? now) < 5000)
      .slice(0, 4);
  }, [bornAt, dismissed, now, toasts]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {visibleToasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => setDismissed((prev) => ({ ...prev, [toast.id]: true }))}
          className="pointer-events-auto rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 text-left shadow-lg"
        >
          <p className="text-xs text-zinc-400">{toast.type.toUpperCase()}</p>
          <p className="text-sm font-medium text-zinc-100">{toast.title}</p>
          <p className="text-xs text-zinc-300">{toast.message}</p>
        </button>
      ))}
    </div>
  );
}
