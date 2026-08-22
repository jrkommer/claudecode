import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { useSnapshot } from '../utils/useSnapshot';
import { effectiveProbability, expectedValue, rankScenarios, weightedScore } from '../utils/scoring';
import { biggestLiveVariable } from '../utils/summary';
import { formatDate } from '../utils/date';
import { Button, Card, SectionTitle } from './ui';

export function PlainLanguageSummary() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const editHistory = useCrossroadsStore((s) => s.editHistory);
  const contract = useCrossroadsStore((s) => s.contract);
  const branchSplit = useCrossroadsStore((s) => s.branchSplit);
  const isLive = useCrossroadsStore((s) => s.liveRefreshEnabled);
  const refreshNow = useCrossroadsStore((s) => s.refreshNow);

  const snap = useSnapshot({ values, scenarios, editHistory, contract, branchSplit });

  if (snap.values.length === 0 || snap.scenarios.length === 0) {
    return (
      <Card>
        <SectionTitle title="Plain-language summary" subtitle="Add values and scenarios first to generate a summary here." />
      </Card>
    );
  }

  const ranked = rankScenarios(snap.scenarios, snap.values, 'expected', snap.branchSplit);
  const doorsWord = snap.scenarios.length === 4 ? 'four doors' : `${snap.scenarios.length} options`;
  const liveVariable = biggestLiveVariable(snap.editHistory, snap.scenarios, snap.values);

  return (
    <div className="space-y-4">
      {!isLive && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 print:hidden">
          <span>Showing a snapshot from when this tab was last opened or refreshed.</span>
          <Button variant="ghost" onClick={() => refreshNow()}>
            Refresh now
          </Button>
        </div>
      )}
      <Card>
        <SectionTitle
          title="Your model, in plain language"
          subtitle="A prose rendering of exactly what you've entered — nothing more. Useful to read out loud, or bring to a conversation, to check whether it still sounds right."
        />
        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            You're weighing {doorsWord}: {snap.scenarios.map((s) => `"${s.name}"`).join(', ')}. Based on the values
            and weights you've set, and the probabilities you've assigned, here's how your own model currently ranks
            them, by expected value (weighted score x probability):
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            {ranked.map((sc, i) => (
              <li key={sc.id}>
                <strong>{sc.name}</strong> — expected value{' '}
                {expectedValue(sc, snap.values, snap.scenarios, snap.branchSplit).toFixed(2)} (weighted score{' '}
                {weightedScore(sc, snap.values).toFixed(2)}/10 at{' '}
                {effectiveProbability(sc, snap.scenarios, snap.branchSplit).toFixed(0)}% probability)
                {i === 0 ? ', currently leading' : ''}.
              </li>
            ))}
          </ol>
          {liveVariable && (
            <p>
              The input you keep coming back to is {liveVariable.label} — you've adjusted it {liveVariable.count}{' '}
              time{liveVariable.count === 1 ? '' : 's'}. That's worth paying attention to: it's usually a sign of
              where the real uncertainty still lives, whether that's new evidence still arriving or a feeling still
              being processed.
            </p>
          )}
          {snap.contract ? (
            <p>
              Your contract says: {snap.contract.commitmentText || '(no commitment statement written yet)'}
              {snap.contract.conditions && ` Conditions: ${snap.contract.conditions}.`}
              {snap.contract.ruleDeadline && ` By ${formatDate(snap.contract.ruleDeadline)}.`} Current status:{' '}
              <strong>{snap.contract.status.replace('_', ' ')}</strong>.
            </p>
          ) : (
            <p>You haven't written a pre-commitment contract yet — see the Commitment tab when you're ready.</p>
          )}
          <p className="italic text-slate-500 dark:text-slate-400">
            This is a mirror of your own inputs, not a verdict. If it doesn't sound right, that's information too —
            go change the inputs that don't match how you actually feel.
          </p>
        </div>
      </Card>
    </div>
  );
}
