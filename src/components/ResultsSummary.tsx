import { useEffect } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { expectedValue, rankScenarios, weightedScore } from '../utils/scoring';
import { Badge, Card, SectionTitle } from './ui';
import { BiasDetector } from './BiasDetector';

export function ResultsSummary() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const markResultsViewed = useCrossroadsStore((s) => s.markResultsViewed);

  useEffect(() => {
    markResultsViewed();
  }, [markResultsViewed]);

  if (values.length === 0 || scenarios.length === 0) {
    return (
      <Card>
        <SectionTitle title="Results" subtitle="Add values and scenarios first to see a ranked comparison here." />
      </Card>
    );
  }

  const ranked = rankScenarios(scenarios, values, 'expected');

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Ranked comparison"
          subtitle="Expected value combines your weighted scores with your probability estimates: weighted score x probability. It's a decision aid, not a verdict — use it to check your intuition, not replace it."
        />
        <div className="space-y-3">
          {ranked.map((sc, i) => (
            <div
              key={sc.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <Badge tone={i === 0 ? 'good' : 'neutral'}>#{i + 1}</Badge>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{sc.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Weighted score {weightedScore(sc, values).toFixed(2)} / 10 &middot; probability {sc.probability}%
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-teal-700 dark:text-teal-400">
                {expectedValue(sc, values).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <BiasDetector />
    </div>
  );
}
