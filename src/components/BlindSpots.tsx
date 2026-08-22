import { useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { formatDateTime } from '../utils/date';
import { Badge, Button, Card, Label, SectionTitle, TextArea, TextInput } from './ui';

const WEAK_LINK_THRESHOLD = 50;

export function BlindSpots() {
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const assumptions = useCrossroadsStore((s) => s.assumptions);
  const premortems = useCrossroadsStore((s) => s.premortems);
  const addAssumption = useCrossroadsStore((s) => s.addAssumption);
  const updateAssumptionConfidence = useCrossroadsStore((s) => s.updateAssumptionConfidence);
  const removeAssumption = useCrossroadsStore((s) => s.removeAssumption);
  const addPremortem = useCrossroadsStore((s) => s.addPremortem);
  const removePremortem = useCrossroadsStore((s) => s.removePremortem);

  const [premortemText, setPremortemText] = useState('');
  const [premortemScenarioId, setPremortemScenarioId] = useState('');

  const [assumptionText, setAssumptionText] = useState('');
  const [assumptionConfidence, setAssumptionConfidence] = useState(50);
  const [assumptionScenarioId, setAssumptionScenarioId] = useState('');

  function handleAddPremortem() {
    if (!premortemText.trim()) return;
    addPremortem(premortemText.trim(), premortemScenarioId || undefined);
    setPremortemText('');
  }

  function handleAddAssumption() {
    if (!assumptionText.trim()) return;
    addAssumption(assumptionText.trim(), assumptionConfidence, assumptionScenarioId || undefined);
    setAssumptionText('');
    setAssumptionConfidence(50);
  }

  const sortedAssumptions = [...assumptions].sort((a, b) => a.confidence - b.confidence);
  const weakLinks = sortedAssumptions.filter((a) => a.confidence < WEAK_LINK_THRESHOLD);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Blind spots"
          subtitle="A model only reasons about what you put into it. These two exercises are deliberately kept out of the scoring math — they exist to surface what might be missing from the model entirely, not to produce another number."
        />
      </Card>

      <Card>
        <SectionTitle
          title="Premortem"
          subtitle="It's a year from now, and this decision went badly. Write the story of why. Not a prediction — a way to surface risks you haven't scored anywhere yet."
        />
        <div className="mb-6 space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div>
            <Label htmlFor="pm-scenario">If it went badly, which path was it? (optional)</Label>
            <select
              id="pm-scenario"
              value={premortemScenarioId}
              onChange={(e) => setPremortemScenarioId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">General / decision-level</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="pm-text">The story of why it went badly</Label>
            <TextArea
              id="pm-text"
              rows={3}
              placeholder="Looking back, the first sign of trouble was..."
              value={premortemText}
              onChange={(e) => setPremortemText(e.target.value)}
            />
          </div>
          <Button onClick={handleAddPremortem} disabled={!premortemText.trim()}>
            Add premortem
          </Button>
        </div>

        {premortems.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No premortems yet.</p>
        ) : (
          <div className="space-y-3">
            {premortems.map((p) => {
              const scenario = scenarios.find((s) => s.id === p.scenarioId);
              return (
                <div key={p.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {scenario ? <Badge>{scenario.name}</Badge> : <Badge tone="neutral">General</Badge>}
                      <span className="text-xs text-slate-400">{formatDateTime(p.createdAt)}</span>
                    </div>
                    <button onClick={() => removePremortem(p.id)} className="text-xs text-rose-500 hover:underline">
                      remove
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{p.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle
          title="Assumption audit"
          subtitle="List the things your scores and decision quietly depend on being true — then rate how sure you actually are, not how sure you'd like to be. The lowest-confidence ones are the weak links worth testing before you lock anything in."
        />
        <div className="mb-6 space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div>
            <Label htmlFor="as-text">Assumption</Label>
            <TextInput
              id="as-text"
              placeholder='e.g. "My partner would actually follow through on couples therapy"'
              value={assumptionText}
              onChange={(e) => setAssumptionText(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="as-scenario">Related scenario (optional)</Label>
            <select
              id="as-scenario"
              value={assumptionScenarioId}
              onChange={(e) => setAssumptionScenarioId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">General / not scenario-specific</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="as-confidence">How confident are you this is actually true?</Label>
            <div className="flex items-center gap-3">
              <input
                id="as-confidence"
                type="range"
                min={0}
                max={100}
                step={5}
                value={assumptionConfidence}
                onChange={(e) => setAssumptionConfidence(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer accent-teal-600"
              />
              <span className="w-14 shrink-0 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                {assumptionConfidence}%
              </span>
            </div>
          </div>
          <Button onClick={handleAddAssumption} disabled={!assumptionText.trim()}>
            Add assumption
          </Button>
        </div>

        {assumptions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No assumptions logged yet.</p>
        ) : (
          <div className="space-y-4">
            {weakLinks.length > 0 && (
              <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 dark:border-rose-700 dark:bg-rose-900/30">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="bad">Weak links</Badge>
                  <p className="text-sm text-rose-900 dark:text-rose-200">
                    {weakLinks.length} assumption{weakLinks.length === 1 ? '' : 's'} under {WEAK_LINK_THRESHOLD}%
                    confidence — worth verifying before you lock in.
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {sortedAssumptions.map((a) => {
                const scenario = scenarios.find((s) => s.id === a.scenarioId);
                const isWeak = a.confidence < WEAK_LINK_THRESHOLD;
                return (
                  <div
                    key={a.id}
                    className={`rounded-lg border p-4 ${
                      isWeak
                        ? 'border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-900/10'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {scenario && <Badge>{scenario.name}</Badge>}
                        {isWeak && <Badge tone="bad">Weak link</Badge>}
                      </div>
                      <button
                        onClick={() => removeAssumption(a.id)}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        remove
                      </button>
                    </div>
                    <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">{a.text}</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={a.confidence}
                        onChange={(e) => updateAssumptionConfidence(a.id, Number(e.target.value))}
                        className="h-2 flex-1 cursor-pointer accent-teal-600"
                      />
                      <span
                        className={`w-14 shrink-0 text-right text-sm font-semibold ${
                          isWeak ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {a.confidence}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
