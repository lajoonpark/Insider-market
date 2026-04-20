"use client";

import { EventToasts } from "@/components/game/EventToasts";
import { TutorialModal } from "@/components/game/TutorialModal";
import {
  DashboardView,
  HistoryView,
  InsiderView,
  MarketView,
  MissionsView,
  NewsView,
  SettingsView,
} from "@/components/game/views";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useGameEngine } from "@/hooks/useGameEngine";

export default function Home() {
  const { state, settings, derived, preview, actions } = useGameEngine();

  const totalPnL = derived.netWorth - 10_000;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar nav={state.nav} fear={state.fear} greed={state.greed} onSelect={actions.setNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          currentTime={state.currentTime}
          cash={state.cash}
          netWorth={derived.netWorth}
          totalPnL={totalPnL}
          paused={state.paused}
          timeSpeed={state.timeSpeed}
          onPause={actions.togglePause}
          onSpeed={actions.setSpeed}
        />

        <main className="flex-1 overflow-auto p-4">
          {state.nav === "dashboard" ? <DashboardView state={state} derived={derived} /> : null}
          {state.nav === "market" ? (
            <MarketView
              state={state}
              preview={preview}
              onSelectCoin={actions.selectCoin}
              onTrade={(side, amount) => actions.runTrade(side, state.selectedCoin, amount)}
            />
          ) : null}
          {state.nav === "news" ? <NewsView state={state} /> : null}
          {state.nav === "insider" ? <InsiderView state={state} /> : null}
          {state.nav === "missions" ? <MissionsView state={state} /> : null}
          {state.nav === "history" ? <HistoryView state={state} netWorth={derived.netWorth} /> : null}
          {state.nav === "settings" ? (
            <SettingsView
              difficulty={settings.difficulty}
              soundEnabled={settings.soundEnabled}
              onDifficulty={actions.setDifficulty}
              onSound={actions.toggleSound}
              onNewRun={actions.newRun}
              onReset={actions.resetProgress}
            />
          ) : null}
        </main>
      </div>

      <EventToasts toasts={state.notifications} />
      <TutorialModal open={!settings.tutorialSeen} onClose={actions.dismissTutorial} />
    </div>
  );
}
