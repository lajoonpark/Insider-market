"use client";

export function TutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold text-white">Welcome to Insider Market</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-300">
          <li>Buy price is always above sell price due to spread.</li>
          <li>News and rumors move prices with different strengths.</li>
          <li>Insider leaks can be true, false, or partially true.</li>
          <li>Use time acceleration to speed up opportunities and risks.</li>
          <li>Balance fear and greed to avoid poor execution.</li>
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
