import { useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { SCENARIO_CATEGORIES } from '../data/baseRates';
import { normalizedWeights, weightedScore } from '../utils/scoring';
import { Button, Card, Label, SectionTitle, TextInput } from './ui';

export function ScenarioGrid() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const addScenario = useCrossroadsStore((s) => s.addScenario);
  const updateScenarioMeta = useCrossroadsStore((s) => s.updateScenarioMeta);
  const updateScenarioScore = useCrossroadsStore((s) => s.updateScenarioScore);
  const removeScenario = useCrossroadsStore((s) => s.removeScenario);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(SCENARIO_CATEGORIES[0].id);

  const weights = normalizedWeights(values);

  function handleAdd() {
    if (!name.trim()) return;
    addScenario(name.trim(), category);
    setName('');
  }

  if (values.length === 0) {
    return (
      <Card>
        <SectionTitle title="Scenarios" subtitle="Add your values first, then come back to define the paths you're weighing." />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Your crossroads: up to four scenarios"
          subtitle="Define the distinct paths you're weighing (e.g. Stay, Move to City B, Start the business, Take the offer). Score each one against every value on a 1-10 scale."
        />

        {scenarios.length < 4 && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label htmlFor="scenario-name">Scenario name</Label>
              <TextInput
                id="scenario-name"
                placeholder="e.g. Take the new job"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <Label htmlFor="scenario-category">Closest category</Label>
              <select
                id="scenario-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {SCENARIO_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={!name.trim()} className="w-full sm:w-auto">
                Add scenario
              </Button>
            </div>
          </div>
        )}
        {scenarios.length >= 4 && (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            You've reached the four-scenario limit. Remove one below to add a different path.
          </p>
        )}

        {scenarios.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No scenarios yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 p-2 text-left font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Value (weight)
                  </th>
                  {scenarios.map((sc) => (
                    <th key={sc.id} className="border-b border-slate-200 p-2 text-left dark:border-slate-700">
                      <div className="mb-1 flex items-center gap-1.5">
                        <TextInput
                          value={sc.name}
                          onChange={(e) => updateScenarioMeta(sc.id, { name: e.target.value })}
                          className="font-semibold"
                        />
                        {sc.description && (
                          <span
                            title={sc.description}
                            className="flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-600 dark:text-slate-200"
                            aria-label={sc.description}
                          >
                            i
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeScenario(sc.id)}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {values.map((v) => (
                  <tr key={v.id}>
                    <td className="border-b border-slate-100 p-2 font-medium text-slate-700 dark:border-slate-700/60 dark:text-slate-300">
                      {v.name} <span className="text-slate-400">({weights[v.id]?.toFixed(0) ?? 0}%)</span>
                    </td>
                    {scenarios.map((sc) => (
                      <td key={sc.id} className="border-b border-slate-100 p-2 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            step={1}
                            value={sc.scores[v.id] ?? 5}
                            onChange={(e) => updateScenarioScore(sc.id, v.id, Number(e.target.value))}
                            className="h-2 w-24 cursor-pointer accent-teal-600"
                          />
                          <span className="w-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {sc.scores[v.id] ?? 5}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-2 text-right font-semibold text-slate-800 dark:text-slate-100">Weighted total</td>
                  {scenarios.map((sc) => (
                    <td key={sc.id} className="p-2 font-semibold text-teal-700 dark:text-teal-400">
                      {weightedScore(sc, values).toFixed(2)} / 10
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
