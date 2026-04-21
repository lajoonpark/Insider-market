"use client";

export function TutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold text-white">Welcome to Insider Market</h2>
        <p className="mt-2 text-sm text-zinc-400">A 24/7 fictional stock market — no real money, no real data. Just strategy.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-300">
          <li>When you <strong className="text-zinc-100">sell</strong> shares, the proceeds are added straight to your cash balance.</li>
          <li>Buy price is always above sell price — that gap is the <strong className="text-zinc-100">spread</strong>.</li>
          <li>News and rumours move share prices with different strengths and durations.</li>
          <li>Insider leaks can be true, false, or only partially accurate.</li>
          <li>Use time acceleration to speed through quiet periods and crunch decisions.</li>
          <li>Balance fear and greed to avoid costly panic trades.</li>
        </ul>
        <button
          onClick={onClose}
          className="mt-6 rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
        >
          Start Trading
        </button>
      </div>
    </div>
  );
}
