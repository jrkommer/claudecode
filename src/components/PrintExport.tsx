import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { useSnapshot } from '../utils/useSnapshot';
import { normalizedWeights, weightedScore } from '../utils/scoring';
import { formatDate, formatDateTime } from '../utils/date';
import { Button, Card, SectionTitle } from './ui';
import { PlainLanguageSummary } from './PlainLanguageSummary';

export function PrintExport() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const journal = useCrossroadsStore((s) => s.journal);
  const contract = useCrossroadsStore((s) => s.contract);
  const isLive = useCrossroadsStore((s) => s.liveRefreshEnabled);
  const refreshNow = useCrossroadsStore((s) => s.refreshNow);

  const snap = useSnapshot({ values, scenarios, journal, contract });
  const { values: snapValues, scenarios: snapScenarios, journal: snapJournal, contract: snapContract } = snap;

  const weights = normalizedWeights(snapValues);
  const sortedJournal = [...snapJournal].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <SectionTitle
          title="Export for therapy / offline review"
          subtitle="Renders your full model and log below. Use your browser's print dialog and choose “Save as PDF” to export."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => window.print()}>Print / Save as PDF</Button>
          {!isLive && (
            <Button variant="ghost" onClick={() => refreshNow()}>
              Refresh now
            </Button>
          )}
        </div>
        {!isLive && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Showing a snapshot from when this tab was last opened or refreshed.
          </p>
        )}
      </Card>

      <Card>
        <SectionTitle title="Values & weights" />
        <table className="w-full border-collapse text-sm">
          <tbody>
            {snapValues.map((v) => (
              <tr key={v.id}>
                <td className="border-b border-slate-100 py-1.5 pr-3 text-slate-700 dark:border-slate-700/60 dark:text-slate-300">
                  {v.name}
                  {v.description && <span className="text-slate-400"> — {v.description}</span>}
                </td>
                <td className="border-b border-slate-100 py-1.5 text-right font-semibold text-slate-800 dark:border-slate-700/60 dark:text-slate-100">
                  {weights[v.id]?.toFixed(0) ?? 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <SectionTitle title="Scenario scores" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 p-1.5 text-left dark:border-slate-700">Value</th>
                {snapScenarios.map((sc) => (
                  <th key={sc.id} className="border-b border-slate-200 p-1.5 text-left dark:border-slate-700">
                    {sc.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapValues.map((v) => (
                <tr key={v.id}>
                  <td className="border-b border-slate-100 p-1.5 dark:border-slate-700/60">{v.name}</td>
                  {snapScenarios.map((sc) => (
                    <td key={sc.id} className="border-b border-slate-100 p-1.5 dark:border-slate-700/60">
                      {sc.scores[v.id] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-1.5 text-right font-semibold">Weighted total</td>
                {snapScenarios.map((sc) => (
                  <td key={sc.id} className="p-1.5 font-semibold">
                    {weightedScore(sc, snapValues).toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-1.5 text-right font-semibold">Probability</td>
                {snapScenarios.map((sc) => (
                  <td key={sc.id} className="p-1.5 font-semibold">
                    {sc.probability}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <PlainLanguageSummary />

      <Card>
        <SectionTitle title={`Evidence log (${sortedJournal.length} entries)`} />
        {sortedJournal.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No entries yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedJournal.map((e) => (
              <div key={e.id} className="border-b border-slate-100 pb-2 text-sm dark:border-slate-700/60">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {formatDate(e.date)} — {e.title}
                  {e.entryType && <span className="text-slate-400"> ({e.entryType})</span>}
                </p>
                <p className="text-slate-600 dark:text-slate-400">{e.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Commitment contract" />
        {snapContract ? (
          <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <p>Status: {snapContract.status.replace('_', ' ')}</p>
            <p>{snapContract.commitmentText}</p>
            {snapContract.conditions && <p>Conditions: {snapContract.conditions}</p>}
            {snapContract.ruleDeadline && <p>Decision rule date: {formatDate(snapContract.ruleDeadline)}</p>}
            <div className="mt-2">
              <p className="font-medium">History</p>
              <ul className="list-disc pl-5">
                {snapContract.history.map((h, i) => (
                  <li key={i}>
                    {formatDateTime(h.timestamp)} — {h.action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No contract written yet.</p>
        )}
      </Card>
    </div>
  );
}
