import { useEffect } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { useSnapshot } from '../utils/useSnapshot';
import { effectiveProbability, expectedValue, rankScenarios, weightedScore } from '../utils/scoring';
import { Badge, Button, Card, SectionTitle } from './ui';
import { BiasDetector } from './BiasDetector';

export function ResultsSummary() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const branchSplit = useCrossroadsStore((s) => s.branchSplit);
  const editHistory = useCrossroadsStore((s) => s.editHistory);
  const initialLeaderScenarioId = useCrossroadsStore((s) => s.initialLeaderScenarioId);
  const resultsFirstViewedAt = useCrossroadsStore((s) => s.resultsFirstViewedAt);
  const activePreset = useCrossroadsStore((s) => s.activePreset);
  const isLive = useCrossroadsStore((s) => s.liveRefreshEnabled);
  const refreshNow = useCrossroadsStore((s) => s.refreshNow);
  const markResultsViewed = useCrossroadsStore((s) => s.markResultsViewed);

  useEffect(() => {
    markResultsViewed();
  }, [markResultsViewed]);

  const snap = useSnapshot({
    values,
    scenarios,
    branchSplit,
    editHistory,
    initialLeaderScenarioId,
    resultsFirstViewedAt,
    activePreset,
  });

  if (snap.values.length === 0 || snap.scenarios.length === 0) {
    return (
      <Card>
        <SectionTitle title="Results" subtitle="Add values and scenarios first to see a ranked comparison here." />
      </Card>
    );
  }

  const ranked = rankScenarios(snap.scenarios, snap.values, 'expected', snap.branchSplit);

  return (
    <div className="space-y-6">
      {!isLive && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <span>Showing a snapshot from when this tab was last opened or refreshed — not necessarily your latest edits.</span>
          <Button variant="ghost" onClick={() => refreshNow()}>
            Refresh now
          </Button>
        </div>
      )}

      <Card>
        <SectionTitle
          title="Ranked comparison"
          subtitle="Expected value combines your weighted scores with your probability estimates: weighted score x probability. For a branch-tagged scenario with a stay/leave split set on the Probabilities tab, the effective probability below already factors that split in. It's a decision aid, not a verdict — use it to check your intuition, not replace it."
        />
        <div className="space-y-3">
          {ranked.map((sc, i) => {
            const probability = effectiveProbability(sc, snap.scenarios, snap.branchSplit);
            const probabilityIsEffective = sc.branch && snap.branchSplit;
            return (
              <div
                key={sc.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Badge tone={i === 0 ? 'good' : 'neutral'}>#{i + 1}</Badge>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{sc.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Weighted score {weightedScore(sc, snap.values).toFixed(2)} / 10 &middot;{' '}
                      {probabilityIsEffective ? 'effective probability' : 'probability'} {probability.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-teal-700 dark:text-teal-400">
                  {expectedValue(sc, snap.values, snap.scenarios, snap.branchSplit).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <BiasDetector
        editHistory={snap.editHistory}
        scenarios={snap.scenarios}
        initialLeaderScenarioId={snap.initialLeaderScenarioId}
        resultsFirstViewedAt={snap.resultsFirstViewedAt}
        activePreset={snap.activePreset}
      />
    </div>
  );
}
