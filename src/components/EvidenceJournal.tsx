import { useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { formatDate, formatDateTime, todayIsoDate } from '../utils/date';
import { Badge, Button, Card, Label, SectionTitle, TextArea, TextInput } from './ui';

export function EvidenceJournal() {
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const journal = useCrossroadsStore((s) => s.journal);
  const addJournalEntry = useCrossroadsStore((s) => s.addJournalEntry);
  const removeJournalEntry = useCrossroadsStore((s) => s.removeJournalEntry);

  const [date, setDate] = useState(todayIsoDate());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scenarioId, setScenarioId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

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
      scenarioId: scenarioId || undefined,
    });
    setTitle('');
    setContent('');
    setTagsInput('');
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Evidence journal"
          subtitle="Log dated observations, conversations, or new information as it arrives. A running record makes it easier to see whether your view has genuinely shifted, or whether you're just remembering things that support what you already wanted."
        />

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
