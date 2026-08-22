import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { analyzeBias, MIN_ATTRIBUTED_EDITS } from '../utils/bias';
import { Badge, Card, SectionTitle } from './ui';

export function BiasDetector() {
  const editHistory = useCrossroadsStore((s) => s.editHistory);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const initialLeaderScenarioId = useCrossroadsStore((s) => s.initialLeaderScenarioId);
  const resultsFirstViewedAt = useCrossroadsStore((s) => s.resultsFirstViewedAt);

  const analysis = analyzeBias(editHistory, scenarios, initialLeaderScenarioId);

  if (!resultsFirstViewedAt) return null;

  return (
    <Card>
      <SectionTitle
        title="Edit-direction bias check"
        subtitle="After you first view results, Crossroads quietly tracks which scenario your subsequent edits tend to favor. Chasing a predetermined answer by nudging scores after the fact is a common — and very human — way decisions get rationalized rather than reasoned through."
      />

      {analysis.totalPostViewEdits === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No edits made since you first viewed results yet. This panel will update if you go back and change scores,
          weights, or probabilities.
        </p>
      ) : !analysis.hasEnoughData ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {analysis.attributedEdits} attributable edit{analysis.attributedEdits === 1 ? '' : 's'} since results were
          first viewed. Need at least {MIN_ATTRIBUTED_EDITS} before a pattern can be assessed.
        </p>
      ) : analysis.flag === 'none' ? (
        <div className="flex items-center gap-2">
          <Badge tone="good">No strong bias signal</Badge>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your post-results edits are reasonably spread across scenarios rather than concentrated on one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Badge tone={analysis.flag === 'reversing' ? 'bad' : 'warn'}>
            {analysis.flag === 'reversing' ? 'Possible rationalization pattern' : 'Reinforcement pattern'}
          </Badge>
          <p className="text-sm text-slate-700 dark:text-slate-300">{analysis.message}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scenarios.map((sc) => (
          <div key={sc.id} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-900">
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{sc.name}</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{analysis.counts[sc.id] ?? 0}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">favoring edits</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
