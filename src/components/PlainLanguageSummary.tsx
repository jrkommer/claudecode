import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { expectedValue, rankScenarios, weightedScore } from '../utils/scoring';
import { biggestLiveVariable } from '../utils/summary';
import { formatDate } from '../utils/date';
import { Card, SectionTitle } from './ui';

export function PlainLanguageSummary() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const editHistory = useCrossroadsStore((s) => s.editHistory);
  const contract = useCrossroadsStore((s) => s.contract);

  if (values.length === 0 || scenarios.length === 0) {
    return (
      <Card>
        <SectionTitle title="Plain-language summary" subtitle="Add values and scenarios first to generate a summary here." />
      </Card>
    );
  }

  const ranked = rankScenarios(scenarios, values, 'expected');
  const doorsWord = scenarios.length === 4 ? 'four doors' : `${scenarios.length} options`;
  const liveVariable = biggestLiveVariable(editHistory, scenarios, values);

  return (
    <Card>
      <SectionTitle
        title="Your model, in plain language"
        subtitle="A prose rendering of exactly what you've entered — nothing more. Useful to read out loud, or bring to a conversation, to check whether it still sounds right."
      />
      <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          You're weighing {doorsWord}: {scenarios.map((s) => `"${s.name}"`).join(', ')}. Based on the values and
          weights you've set, and the probabilities you've assigned, here's how your own model currently ranks
          them, by expected value (weighted score x probability):
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          {ranked.map((sc, i) => (
            <li key={sc.id}>
              <strong>{sc.name}</strong> — expected value {expectedValue(sc, values).toFixed(2)} (weighted score{' '}
              {weightedScore(sc, values).toFixed(2)}/10 at {sc.probability}% probability){i === 0 ? ', currently leading' : ''}
              .
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
        {contract ? (
          <p>
            Your contract says: {contract.commitmentText || '(no commitment statement written yet)'}
            {contract.conditions && ` Conditions: ${contract.conditions}.`}
            {contract.ruleDeadline && ` By ${formatDate(contract.ruleDeadline)}.`} Current status:{' '}
            <strong>{contract.status.replace('_', ' ')}</strong>.
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
  );
}
