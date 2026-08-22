import { useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { normalizedWeights } from '../utils/scoring';
import { DIVORCE_EXAMPLE_BANNER, DIVORCE_PRESET_ID } from '../data/divorcePreset';
import { Badge, Button, Card, Label, SectionTitle, TextInput } from './ui';

export function ValuesElicitation() {
  const values = useCrossroadsStore((s) => s.values);
  const activePreset = useCrossroadsStore((s) => s.activePreset);
  const addValue = useCrossroadsStore((s) => s.addValue);
  const updateValueWeight = useCrossroadsStore((s) => s.updateValueWeight);
  const updateValueName = useCrossroadsStore((s) => s.updateValueName);
  const removeValue = useCrossroadsStore((s) => s.removeValue);
  const loadPreset = useCrossroadsStore((s) => s.loadPreset);
  const clearModel = useCrossroadsStore((s) => s.clearModel);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const weights = normalizedWeights(values);

  function handleAdd() {
    if (!name.trim()) return;
    addValue(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Example: divorce / affair-recovery</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loads a full pre-filled model — values, four scenarios, probabilities, and 20-year projections — to
              explore the tool before building your own.
            </p>
          </div>
          <div className="flex gap-2">
            {activePreset === DIVORCE_PRESET_ID ? (
              <Button
                variant="secondary"
                onClick={() => {
                  if (window.confirm('Clear this model and start blank? Nothing outside this device is affected.')) {
                    clearModel();
                  }
                }}
              >
                Clear model
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  if (
                    values.length === 0 ||
                    window.confirm('Load the example model? This replaces your current values, scenarios, and probabilities.')
                  ) {
                    loadPreset(DIVORCE_PRESET_ID);
                  }
                }}
              >
                Load example
              </Button>
            )}
          </div>
        </div>
      </Card>

      {activePreset === DIVORCE_PRESET_ID && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/30">
          <Badge tone="warn">Example</Badge>
          <p className="text-sm text-amber-900 dark:text-amber-200">{DIVORCE_EXAMPLE_BANNER}</p>
        </div>
      )}

      <Card>
        <SectionTitle
          title="What matters to you?"
          subtitle="List the values at stake in this decision (e.g. financial security, autonomy, relationships, health, growth). Then set a relative weight for each — how much it should count compared to the others. Weights are normalized to 100% automatically."
        />

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <Label htmlFor="value-name">Value name</Label>
            <TextInput
              id="value-name"
              placeholder="e.g. Financial security"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <Label htmlFor="value-desc">Notes (optional)</Label>
            <TextInput
              id="value-desc"
              placeholder="What this means to you"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} disabled={!name.trim()} className="w-full sm:w-auto">
              Add value
            </Button>
          </div>
        </div>

        {values.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No values yet. Add at least two to continue.</p>
        ) : (
          <div className="space-y-4">
            {values.map((v) => (
              <div key={v.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <TextInput
                      value={v.name}
                      onChange={(e) => updateValueName(v.id, e.target.value, v.description)}
                      className="mb-1 font-medium"
                    />
                    {v.description !== undefined && (
                      <TextInput
                        value={v.description ?? ''}
                        placeholder="Notes"
                        onChange={(e) => updateValueName(v.id, v.name, e.target.value)}
                        className="text-xs"
                      />
                    )}
                  </div>
                  <Button variant="ghost" onClick={() => removeValue(v.id)}>
                    Remove
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={v.weight}
                    onChange={(e) => updateValueWeight(v.id, Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer accent-teal-600"
                  />
                  <span className="w-20 shrink-0 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {weights[v.id]?.toFixed(0) ?? 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
