import { useRef, useState } from 'react';
import { useCrossroadsStore } from './store/useCrossroadsStore';
import { SafetyScreen } from './components/SafetyScreen';
import { isSafetyPassed } from './utils/safety';
import { ValuesElicitation } from './components/ValuesElicitation';
import { ScenarioGrid } from './components/ScenarioGrid';
import { ProbabilityPanel } from './components/ProbabilityPanel';
import { ResultsSummary } from './components/ResultsSummary';
import { EvidenceJournal } from './components/EvidenceJournal';
import { CommitmentContract } from './components/CommitmentContract';
import { TimelineChart } from './components/TimelineChart';
import { Button } from './components/ui';
import { downloadStateAsJson, parseImportedState } from './utils/storage';
import type { CrossroadsState } from './types';

const TABS = [
  { id: 'values', label: 'Values' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'probabilities', label: 'Probabilities' },
  { id: 'results', label: 'Results & Bias' },
  { id: 'journal', label: 'Evidence Journal' },
  { id: 'contract', label: 'Commitment' },
  { id: 'timeline', label: 'Timeline' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function AppShell() {
  const [tab, setTab] = useState<TabId>('values');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importState = useCrossroadsStore((s) => s.importState);
  const resetAll = useCrossroadsStore((s) => s.resetAll);

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
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Crossroads</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A structured thinking tool for major life decisions. Everything stays on this device.
              </p>
            </div>
            <div className="flex gap-2">
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
          {TABS.map((t) => (
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {tab === 'values' && <ValuesElicitation />}
        {tab === 'scenarios' && <ScenarioGrid />}
        {tab === 'probabilities' && <ProbabilityPanel />}
        {tab === 'results' && <ResultsSummary />}
        {tab === 'journal' && <EvidenceJournal />}
        {tab === 'contract' && <CommitmentContract />}
        {tab === 'timeline' && <TimelineChart />}
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
