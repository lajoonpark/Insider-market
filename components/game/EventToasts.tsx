"use client";

import { NotificationToast } from "@/lib/game/types";

export function EventToasts({ toasts }: { toasts: NotificationToast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.slice(0, 4).map((toast) => (
        <div key={toast.id} className="rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 shadow-lg">
          <p className="text-xs text-zinc-400">{toast.type.toUpperCase()}</p>
          <p className="text-sm font-medium text-zinc-100">{toast.title}</p>
          <p className="text-xs text-zinc-300">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
