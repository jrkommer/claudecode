import { useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { formatDate, formatDateTime, todayIsoDate } from '../utils/date';
import { DEFAULT_EVIDENCE_TYPES, DIVORCE_EVIDENCE_TYPES, DIVORCE_PRESET_ID } from '../data/divorcePreset';
import { ABUSE_RESOURCES } from '../data/crisisResources';
import { Badge, Button, Card, Label, SectionTitle, TextArea, TextInput } from './ui';

const DAY_MS = 24 * 60 * 60 * 1000;
const COERCION_TYPE = 'Coercion/pressure';
const COERCION_NUDGE_THRESHOLD = 2;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS);
}

export function EvidenceJournal() {
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const journal = useCrossroadsStore((s) => s.journal);
  const contract = useCrossroadsStore((s) => s.contract);
  const trial = useCrossroadsStore((s) => s.trial);
  const activePreset = useCrossroadsStore((s) => s.activePreset);
  const addJournalEntry = useCrossroadsStore((s) => s.addJournalEntry);
  const removeJournalEntry = useCrossroadsStore((s) => s.removeJournalEntry);
  const startTrial = useCrossroadsStore((s) => s.startTrial);
  const clearTrial = useCrossroadsStore((s) => s.clearTrial);

  const [date, setDate] = useState(todayIsoDate());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scenarioId, setScenarioId] = useState('');
  const [entryType, setEntryType] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [trialStartDate, setTrialStartDate] = useState(todayIsoDate());
  const [trialDays, setTrialDays] = useState(90);
  const [showReview, setShowReview] = useState(false);

  const entryTypes = activePreset === DIVORCE_PRESET_ID ? DIVORCE_EVIDENCE_TYPES : DEFAULT_EVIDENCE_TYPES;

  function handleAdd() {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    addJournalEntry({
      date,
      title: title.trim(),
      content: content.trim(),
      tags,
      entryType: entryType || undefined,
      scenarioId: scenarioId || undefined,
    });
    setTitle('');
    setContent('');
    setTagsInput('');
  }

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * DAY_MS);
  const priorWeekStart = new Date(now.getTime() - 14 * DAY_MS);
  const thisWeekCount = journal.filter((e) => new Date(e.date) >= weekStart).length;
  const lastWeekCount = journal.filter((e) => {
    const d = new Date(e.date);
    return d >= priorWeekStart && d < weekStart;
  }).length;

  const coercionCount = journal.filter((e) => e.entryType === COERCION_TYPE).length;

  const trialStart = trial ? new Date(trial.startedAt) : null;
  const trialEnd = trial ? new Date(trial.startedAt).getTime() + trial.days * DAY_MS : null;
  const trialElapsedDays = trialStart ? daysBetween(trialStart, now) : 0;
  const trialComplete = trial ? now.getTime() >= trialEnd! : false;
  const trialEntries =
    trial && trialStart
      ? journal
          .filter((e) => {
            const d = new Date(e.date);
            return d >= trialStart && d.getTime() <= trialEnd!;
          })
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
      : [];

  return (
    <div className="space-y-6">
      {coercionCount >= COERCION_NUDGE_THRESHOLD && (
        <Card className="border-rose-300 dark:border-rose-700">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="bad">Please read</Badge>
          </div>
          <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
            You've logged {coercionCount} entries tagged "{COERCION_TYPE}." If you're feeling pressured, controlled,
            or unsafe, this tool isn't equipped to help with that directly — these confidential resources are.
          </p>
          <div className="space-y-2">
            {ABUSE_RESOURCES.map((r) => (
              <div key={r.name} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
                <p className="font-medium text-slate-900 dark:text-slate-100">{r.name}</p>
                <p className="font-semibold text-teal-700 dark:text-teal-400">{r.contact}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle
          title="90-day trial mode"
          subtitle="Set a window to gather evidence before revisiting the decision, then review the log against your pre-commitment contract once it's up."
        />
        {!trial ? (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="trial-start">Start date</Label>
              <TextInput
                id="trial-start"
                type="date"
                value={trialStartDate}
                onChange={(e) => setTrialStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="trial-days">Length (days)</Label>
              <TextInput
                id="trial-days"
                type="number"
                min={1}
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value) || 90)}
                className="w-28"
              />
            </div>
            <Button onClick={() => startTrial(trialDays, new Date(trialStartDate).toISOString())}>Start trial</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {trialComplete
                  ? `Trial complete — day ${trial.days} of ${trial.days}.`
                  : `Day ${Math.max(0, trialElapsedDays)} of ${trial.days}.`}
              </p>
              <Badge tone={trialComplete ? 'good' : 'neutral'}>{trialComplete ? 'Ready to review' : 'In progress'}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setShowReview((v) => !v)}>
                {showReview ? 'Hide review' : 'Review trial'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (window.confirm('End this trial? You can start a new one any time.')) {
                    clearTrial();
                    setShowReview(false);
                  }
                }}
              >
                End trial
              </Button>
            </div>

            {showReview && (
              <div className="mt-3 space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Your pre-commitment rule</h4>
                  {contract ? (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <p>{contract.commitmentText || '(no commitment statement yet)'}</p>
                      {contract.conditions && <p className="mt-1 text-slate-500 dark:text-slate-400">Conditions: {contract.conditions}</p>}
                      {contract.ruleDeadline && (
                        <p className="mt-1 text-slate-500 dark:text-slate-400">By: {formatDate(contract.ruleDeadline)}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No contract written yet — see the Commitment tab.</p>
                  )}
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Log entries during the trial ({trialEntries.length})
                  </h4>
                  {trialEntries.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No entries logged during this window yet.</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {trialEntries.map((e) => (
                        <li key={e.id}>
                          <span className="text-slate-400">{formatDate(e.date)}</span>
                          {e.entryType && <span className="ml-1"><Badge>{e.entryType}</Badge></span>} — {e.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Compare what actually happened against your rule above. Does the log support the outcome your
                  contract names — or not? That's the question the trial exists to answer.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle
          title="Evidence journal"
          subtitle="Log dated observations, conversations, or new information as it arrives. A running record makes it easier to see whether your view has genuinely shifted, or whether you're just remembering things that support what you already wanted."
        />

        <div className="mb-4 flex flex-wrap gap-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
          <span className="text-slate-600 dark:text-slate-400">
            This week: <strong className="text-slate-900 dark:text-slate-100">{thisWeekCount}</strong>
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Last week: <strong className="text-slate-900 dark:text-slate-100">{lastWeekCount}</strong>
          </span>
        </div>

        <div className="mb-6 space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="entry-date">Date evidence pertains to</Label>
              <TextInput id="entry-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="entry-scenario">Related scenario (optional)</Label>
              <select
                id="entry-scenario"
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
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
          </div>
          <div>
            <Label htmlFor="entry-type">Entry type</Label>
            <select
              id="entry-type"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Unspecified</option>
              {entryTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="entry-title">Title</Label>
            <TextInput
              id="entry-title"
              placeholder="e.g. Talked to a friend who made a similar move"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="entry-content">What happened / what you learned</Label>
            <TextArea id="entry-content" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="entry-tags">Tags (comma separated)</Label>
            <TextInput
              id="entry-tags"
              placeholder="e.g. finances, conversation, research"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} disabled={!title.trim() || !content.trim()}>
            Add entry
          </Button>
        </div>

        {journal.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No journal entries yet.</p>
        ) : (
          <div className="space-y-3">
            {journal.map((entry) => {
              const scenario = scenarios.find((s) => s.id === entry.scenarioId);
              return (
                <div key={entry.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.title}</span>
                      {entry.entryType && <Badge tone="warn">{entry.entryType}</Badge>}
                      {scenario && <Badge>{scenario.name}</Badge>}
                    </div>
                    <button
                      onClick={() => removeJournalEntry(entry.id)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      remove
                    </button>
                  </div>
                  <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{entry.content}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>Evidence date: {formatDate(entry.date)}</span>
                    <span>&middot;</span>
                    <span>Logged {formatDateTime(entry.createdAt)}</span>
                    {entry.tags.map((t) => (
                      <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-700">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
