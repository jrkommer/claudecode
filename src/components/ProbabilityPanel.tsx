import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { getCategoryHint, SCENARIO_CATEGORIES } from '../data/baseRates';
import { Card, SectionTitle } from './ui';

export function ProbabilityPanel() {
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const updateScenarioProbability = useCrossroadsStore((s) => s.updateScenarioProbability);
  const updateScenarioMeta = useCrossroadsStore((s) => s.updateScenarioMeta);

  if (scenarios.length === 0) {
    return (
      <Card>
        <SectionTitle title="Probabilities" subtitle="Add scenarios first, then estimate the odds each one goes well." />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="How likely is each path to go well?"
          subtitle="For each scenario, estimate the probability that things play out favorably. Reference hints below are broad, illustrative base rates from general research — not a prediction for your specific situation — meant to sanity-check your gut estimate against typical outside-view patterns."
        />
        <div className="space-y-6">
          {scenarios.map((sc) => {
            const hint = getCategoryHint(sc.category);
            return (
              <div key={sc.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{sc.name}</h3>
                  <select
                    value={sc.category}
                    onChange={(e) => updateScenarioMeta(sc.id, { category: e.target.value })}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {SCENARIO_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={sc.probability}
                    onChange={(e) => updateScenarioProbability(sc.id, Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer accent-teal-600"
                  />
                  <span className="w-14 shrink-0 text-right text-lg font-semibold text-teal-700 dark:text-teal-400">
                    {sc.probability}%
                  </span>
                </div>

                {hint && (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                    <p className="mb-1 font-medium text-slate-700 dark:text-slate-300">Reference base-rate hint</p>
                    <p>{hint.hint}</p>
                    <p className="mt-1 italic text-slate-400">{hint.source}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
