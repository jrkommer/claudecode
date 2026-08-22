import { useEffect, useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { formatCountdown, formatDate, formatDateTime } from '../utils/date';
import { Badge, Button, Card, Label, SectionTitle, TextArea, TextInput } from './ui';

const COOLING_OFF_PRESETS = [
  { label: '24 hours', hours: 24 },
  { label: '72 hours (recommended)', hours: 72 },
  { label: '7 days', hours: 168 },
];

export function CommitmentContract() {
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const contract = useCrossroadsStore((s) => s.contract);
  const startContract = useCrossroadsStore((s) => s.startContract);
  const updateContractDraft = useCrossroadsStore((s) => s.updateContractDraft);
  const beginCoolingOff = useCrossroadsStore((s) => s.beginCoolingOff);
  const returnContractToDraft = useCrossroadsStore((s) => s.returnContractToDraft);
  const lockContract = useCrossroadsStore((s) => s.lockContract);
  const revokeContract = useCrossroadsStore((s) => s.revokeContract);
  const requestAmendment = useCrossroadsStore((s) => s.requestAmendment);
  const updatePendingAmendment = useCrossroadsStore((s) => s.updatePendingAmendment);
  const applyAmendment = useCrossroadsStore((s) => s.applyAmendment);
  const cancelAmendment = useCrossroadsStore((s) => s.cancelAmendment);

  const [decisionSummary, setDecisionSummary] = useState('');
  const [chosenScenarioId, setChosenScenarioId] = useState('');
  const [commitmentText, setCommitmentText] = useState('');
  const [conditions, setConditions] = useState('');
  const [ruleDeadline, setRuleDeadline] = useState('');
  const [coolingOffHours, setCoolingOffHours] = useState(72);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!contract || (contract.status !== 'cooling_off' && contract.status !== 'amending')) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [contract]);

  if (scenarios.length === 0) {
    return (
      <Card>
        <SectionTitle title="Pre-commitment contract" subtitle="Add scenarios first before writing a commitment." />
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card>
        <SectionTitle
          title="Write your pre-commitment contract"
          subtitle="Putting the decision in writing, with a cooling-off period before it's official, guards against acting on a temporary mood or a burst of enthusiasm. This is a personal commitment device, not a legal document."
        />
        <div className="space-y-3">
          <div>
            <Label htmlFor="c-summary">Decision summary</Label>
            <TextInput
              id="c-summary"
              placeholder="One sentence describing the decision"
              value={decisionSummary}
              onChange={(e) => setDecisionSummary(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="c-scenario">Chosen scenario</Label>
            <select
              id="c-scenario"
              value={chosenScenarioId}
              onChange={(e) => setChosenScenarioId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select the scenario you're committing to</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="c-text">Commitment statement</Label>
            <TextArea
              id="c-text"
              rows={3}
              placeholder="I will..."
              value={commitmentText}
              onChange={(e) => setCommitmentText(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="c-conditions">Conditions / what would make you reconsider (optional)</Label>
            <TextArea
              id="c-conditions"
              rows={2}
              placeholder="e.g. If X happens by [date], I will revisit this."
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="c-deadline">Decision rule date (optional)</Label>
            <TextInput
              id="c-deadline"
              type="date"
              value={ruleDeadline}
              onChange={(e) => setRuleDeadline(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              "If by this date, the log shows X, I will Y" — the date your rule refers to.
            </p>
          </div>
          <div>
            <Label htmlFor="c-cooling">Cooling-off period before this can be locked in</Label>
            <select
              id="c-cooling"
              value={coolingOffHours}
              onChange={(e) => setCoolingOffHours(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {COOLING_OFF_PRESETS.map((p) => (
                <option key={p.hours} value={p.hours}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() =>
              startContract({
                decisionSummary,
                chosenScenarioId,
                commitmentText,
                conditions,
                ruleDeadline: ruleDeadline || null,
                coolingOffHours,
              })
            }
            disabled={!decisionSummary.trim() || !chosenScenarioId || !commitmentText.trim()}
          >
            Save draft
          </Button>
        </div>
      </Card>
    );
  }

  const chosenScenario = scenarios.find((s) => s.id === contract.chosenScenarioId);
  const coolingOffDone = new Date(contract.coolingOffEndsAt).getTime() <= now;
  const amendmentCoolingOffDone = contract.amendmentCoolingOffEndsAt
    ? new Date(contract.amendmentCoolingOffEndsAt).getTime() <= now
    : false;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle title="Your pre-commitment contract" />
          <Badge
            tone={
              contract.status === 'locked'
                ? 'good'
                : contract.status === 'revoked'
                  ? 'bad'
                  : contract.status === 'cooling_off' || contract.status === 'amending'
                    ? 'warn'
                    : 'neutral'
            }
          >
            {contract.status.replace('_', ' ')}
          </Badge>
        </div>

        {contract.status === 'draft' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="d-summary">Decision summary</Label>
              <TextInput
                id="d-summary"
                value={contract.decisionSummary}
                onChange={(e) => updateContractDraft({ decisionSummary: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="d-text">Commitment statement</Label>
              <TextArea
                id="d-text"
                rows={3}
                value={contract.commitmentText}
                onChange={(e) => updateContractDraft({ commitmentText: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="d-conditions">Conditions</Label>
              <TextArea
                id="d-conditions"
                rows={2}
                value={contract.conditions}
                onChange={(e) => updateContractDraft({ conditions: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="d-deadline">Decision rule date</Label>
              <TextInput
                id="d-deadline"
                type="date"
                value={contract.ruleDeadline ?? ''}
                onChange={(e) => updateContractDraft({ ruleDeadline: e.target.value || null })}
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Chosen scenario: <strong>{chosenScenario?.name ?? 'unknown'}</strong> &middot; Cooling-off:{' '}
              {contract.coolingOffHours}h
            </p>
            <Button onClick={() => beginCoolingOff()}>Start cooling-off period</Button>
          </div>
        )}

        {contract.status === 'cooling_off' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">{contract.commitmentText}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chosen scenario: <strong>{chosenScenario?.name ?? 'unknown'}</strong>
            </p>
            {contract.conditions && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Conditions: {contract.conditions}</p>
            )}
            {contract.ruleDeadline && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Decision rule date: {formatDate(contract.ruleDeadline)}</p>
            )}
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {coolingOffDone ? 'Cooling-off period complete.' : `Time remaining: ${formatCountdown(contract.coolingOffEndsAt)}`}
              </p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                Locks in on {formatDateTime(contract.coolingOffEndsAt)}. This gives you space to notice if you're
                acting on a passing mood rather than a settled decision.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => lockContract()} disabled={!coolingOffDone}>
                Lock in commitment
              </Button>
              <Button variant="secondary" onClick={() => returnContractToDraft()}>
                Make changes (restarts cooling-off)
              </Button>
            </div>
          </div>
        )}

        {contract.status === 'locked' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">{contract.commitmentText}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chosen scenario: <strong>{chosenScenario?.name ?? 'unknown'}</strong>
            </p>
            {contract.conditions && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Conditions: {contract.conditions}</p>
            )}
            {contract.ruleDeadline && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Decision rule date: {formatDate(contract.ruleDeadline)}</p>
            )}
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/30">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                Locked in. This is a personal commitment device, not a legal or binding contract — you can still
                change or revoke it, but doing so is a deliberate act.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => requestAmendment()}>
                Request changes (72h cooling-off)
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Revoke this locked commitment? This should be a deliberate choice, not an impulsive one.')) {
                    revokeContract();
                  }
                }}
              >
                Revoke commitment
              </Button>
            </div>
          </div>
        )}

        {contract.status === 'amending' && contract.pendingAmendment && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <h4 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Original (locked {formatDateTime(contract.createdAt)})
              </h4>
              <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">{contract.commitmentText}</p>
              {contract.conditions && <p className="text-xs text-slate-500 dark:text-slate-400">Conditions: {contract.conditions}</p>}
              {contract.ruleDeadline && (
                <p className="text-xs text-slate-500 dark:text-slate-400">By: {formatDate(contract.ruleDeadline)}</p>
              )}
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
              <h4 className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">Pending changes</h4>
              <TextArea
                rows={3}
                value={contract.pendingAmendment.commitmentText}
                onChange={(e) => updatePendingAmendment({ commitmentText: e.target.value })}
                className="mb-2"
              />
              <TextArea
                rows={2}
                placeholder="Conditions"
                value={contract.pendingAmendment.conditions}
                onChange={(e) => updatePendingAmendment({ conditions: e.target.value })}
                className="mb-2"
              />
              <TextInput
                type="date"
                value={contract.pendingAmendment.ruleDeadline ?? ''}
                onChange={(e) => updatePendingAmendment({ ruleDeadline: e.target.value || null })}
              />
              <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">
                {amendmentCoolingOffDone
                  ? 'Cooling-off complete — you can apply these changes.'
                  : `Applies in ${formatCountdown(contract.amendmentCoolingOffEndsAt!)}.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => applyAmendment()} disabled={!amendmentCoolingOffDone}>
                  Apply changes
                </Button>
                <Button variant="secondary" onClick={() => cancelAmendment()}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {contract.status === 'revoked' && (
          <p className="text-sm text-slate-500 dark:text-slate-400">This commitment was revoked. You can write a new one below.</p>
        )}
      </Card>

      <Card>
        <SectionTitle title="History" />
        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {contract.history.map((h, i) => (
            <li key={i}>
              <span className="text-slate-400">{formatDateTime(h.timestamp)}</span> — {h.action}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
