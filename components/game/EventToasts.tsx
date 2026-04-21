"use client";

import { useEffect, useState } from "react";
import { NotificationToast } from "@/lib/game/types";

const TOAST_AUTO_DISMISS_MS = 5000;

export function EventToasts({ toasts }: { toasts: NotificationToast[] }) {
  const [dismissed, setDismissed] = useState<Record<string, true>>({});

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.slice(0, 4).map((toast) => (
        <ToastRow
          key={toast.id}
          toast={toast}
          hidden={Boolean(dismissed[toast.id])}
          onDismiss={() => setDismissed((prev) => ({ ...prev, [toast.id]: true }))}
        />
      ))}
    </div>
  );
}

function ToastRow({
  toast,
  hidden,
  onDismiss,
}: {
  toast: NotificationToast;
  hidden: boolean;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(false), TOAST_AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (hidden || !visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setVisible(false);
        onDismiss();
      }}
      className="pointer-events-auto rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 text-left shadow-lg"
    >
      <p className="text-xs text-zinc-400">{toast.type.toUpperCase()}</p>
      <p className="text-sm font-medium text-zinc-100">{toast.title}</p>
      <p className="text-xs text-zinc-300">{toast.message}</p>
    </button>
  );
}
