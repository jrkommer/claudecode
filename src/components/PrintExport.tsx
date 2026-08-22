import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { normalizedWeights, weightedScore } from '../utils/scoring';
import { formatDate, formatDateTime } from '../utils/date';
import { Button, Card, SectionTitle } from './ui';
import { PlainLanguageSummary } from './PlainLanguageSummary';

export function PrintExport() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const journal = useCrossroadsStore((s) => s.journal);
  const contract = useCrossroadsStore((s) => s.contract);

  const weights = normalizedWeights(values);
  const sortedJournal = [...journal].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <SectionTitle
          title="Export for therapy / offline review"
          subtitle="Renders your full model and log below. Use your browser's print dialog and choose “Save as PDF” to export."
        />
        <Button onClick={() => window.print()}>Print / Save as PDF</Button>
      </Card>

      <Card>
        <SectionTitle title="Values & weights" />
        <table className="w-full border-collapse text-sm">
          <tbody>
            {values.map((v) => (
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
                {scenarios.map((sc) => (
                  <th key={sc.id} className="border-b border-slate-200 p-1.5 text-left dark:border-slate-700">
                    {sc.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((v) => (
                <tr key={v.id}>
                  <td className="border-b border-slate-100 p-1.5 dark:border-slate-700/60">{v.name}</td>
                  {scenarios.map((sc) => (
                    <td key={sc.id} className="border-b border-slate-100 p-1.5 dark:border-slate-700/60">
                      {sc.scores[v.id] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-1.5 text-right font-semibold">Weighted total</td>
                {scenarios.map((sc) => (
                  <td key={sc.id} className="p-1.5 font-semibold">
                    {weightedScore(sc, values).toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-1.5 text-right font-semibold">Probability</td>
                {scenarios.map((sc) => (
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
        {contract ? (
          <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <p>Status: {contract.status.replace('_', ' ')}</p>
            <p>{contract.commitmentText}</p>
            {contract.conditions && <p>Conditions: {contract.conditions}</p>}
            {contract.ruleDeadline && <p>Decision rule date: {formatDate(contract.ruleDeadline)}</p>}
            <div className="mt-2">
              <p className="font-medium">History</p>
              <ul className="list-disc pl-5">
                {contract.history.map((h, i) => (
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
