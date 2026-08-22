import { useRef, useState } from 'react';
import { useCrossroadsStore } from './store/useCrossroadsStore';
import { SafetyScreen } from './components/SafetyScreen';
import { isSafetyPassed } from './utils/safety';
import { ValuesElicitation } from './components/ValuesElicitation';
import { ScenarioGrid } from './components/ScenarioGrid';
import { ProbabilityPanel } from './components/ProbabilityPanel';
import { ResultsSummary } from './components/ResultsSummary';
import { BlindSpots } from './components/BlindSpots';
import { EvidenceJournal } from './components/EvidenceJournal';
import { CommitmentContract } from './components/CommitmentContract';
import { TimelineChart } from './components/TimelineChart';
import { LongHorizonProjections } from './components/LongHorizonProjections';
import { PlainLanguageSummary } from './components/PlainLanguageSummary';
import { PrintExport } from './components/PrintExport';
import { AboutPage } from './components/AboutPage';
import { Button } from './components/ui';
import { downloadStateAsJson, parseImportedState } from './utils/storage';
import type { CrossroadsState } from './types';

const BASE_TABS = [
  { id: 'values', label: 'Values' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'probabilities', label: 'Probabilities' },
  { id: 'results', label: 'Results & Bias' },
  { id: 'blindspots', label: 'Blind Spots' },
  { id: 'journal', label: 'Evidence Journal' },
  { id: 'contract', label: 'Commitment' },
  { id: 'timeline', label: 'Timeline' },
] as const;

const TRAJECTORIES_TAB = { id: 'trajectories', label: 'Trajectories' } as const;

const TAIL_TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'export', label: 'Export' },
  { id: 'about', label: 'About' },
] as const;

type TabId =
  | (typeof BASE_TABS)[number]['id']
  | (typeof TRAJECTORIES_TAB)['id']
  | (typeof TAIL_TABS)[number]['id'];

function AppShell() {
  const [tab, setTab] = useState<TabId>('values');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importState = useCrossroadsStore((s) => s.importState);
  const resetAll = useCrossroadsStore((s) => s.resetAll);
  const hasTrajectories = useCrossroadsStore((s) => s.customTimelineData !== null);
  const liveRefreshEnabled = useCrossroadsStore((s) => s.liveRefreshEnabled);
  const setLiveRefreshEnabled = useCrossroadsStore((s) => s.setLiveRefreshEnabled);
  const refreshNow = useCrossroadsStore((s) => s.refreshNow);

  const tabs = hasTrajectories ? [...BASE_TABS, TRAJECTORIES_TAB, ...TAIL_TABS] : [...BASE_TABS, ...TAIL_TABS];

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImportedState(String(reader.result));
      if (parsed) {
        importState(parsed as CrossroadsState);
      } else {
        window.alert('That file does not look like a valid Crossroads backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (window.confirm('Start a brand new decision? This clears everything currently stored on this device (export a backup first if you want to keep it).')) {
      resetAll();
      setTab('values');
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white print:hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Crossroads</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A structured thinking tool for major life decisions. Everything stays on this device.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
                title="When off, Results, Bias, Summary and Export only refresh when you (re)enter that tab or click Refresh — not on every edit elsewhere."
              >
                <input
                  type="checkbox"
                  checked={liveRefreshEnabled}
                  onChange={(e) => setLiveRefreshEnabled(e.target.checked)}
                  className="h-3.5 w-3.5 accent-teal-600"
                />
                Live updates
              </label>
              <Button
                variant="secondary"
                onClick={() => refreshNow()}
                disabled={liveRefreshEnabled}
                className="disabled:opacity-40"
              >
                Refresh
              </Button>
              <Button variant="secondary" onClick={() => downloadStateAsJson(useCrossroadsStore.getState())}>
                Export backup
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Import
              </Button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
              <Button variant="danger" onClick={handleReset}>
                New decision
              </Button>
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 print:max-w-none print:px-0 print:py-0">
        {tab === 'values' && <ValuesElicitation />}
        {tab === 'scenarios' && <ScenarioGrid />}
        {tab === 'probabilities' && <ProbabilityPanel />}
        {tab === 'results' && <ResultsSummary />}
        {tab === 'blindspots' && <BlindSpots />}
        {tab === 'journal' && <EvidenceJournal />}
        {tab === 'contract' && <CommitmentContract />}
        {tab === 'timeline' && <TimelineChart />}
        {tab === 'trajectories' && <LongHorizonProjections />}
        {tab === 'summary' && <PlainLanguageSummary />}
        {tab === 'export' && <PrintExport />}
        {tab === 'about' && <AboutPage />}
      </main>
    </div>
  );
}

export default function App() {
  const safety = useCrossroadsStore((s) => s.safety);

  if (!isSafetyPassed(safety)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <SafetyScreen />
      </div>
    );
  }

  return <AppShell />;
}
