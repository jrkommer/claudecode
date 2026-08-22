import { useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { normalizedWeights } from '../utils/scoring';
import { Button, Card, Label, SectionTitle, TextInput } from './ui';

export function ValuesElicitation() {
  const values = useCrossroadsStore((s) => s.values);
  const addValue = useCrossroadsStore((s) => s.addValue);
  const updateValueWeight = useCrossroadsStore((s) => s.updateValueWeight);
  const updateValueName = useCrossroadsStore((s) => s.updateValueName);
  const removeValue = useCrossroadsStore((s) => s.removeValue);

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
                    max={10}
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
