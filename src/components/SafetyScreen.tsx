import { useState } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { ABUSE_RESOURCES, IMMEDIATE_DANGER_RESOURCES, SELF_HARM_RESOURCES } from '../data/crisisResources';
import { Badge, Button, Card, SectionTitle } from './ui';

type YesNo = 'yes' | 'no' | 'unset';

interface Question {
  key: 'immediateDanger' | 'selfHarmRisk' | 'abuseCoercion';
  text: string;
}

const QUESTIONS: Question[] = [
  {
    key: 'immediateDanger',
    text: 'Are you, or is someone you care about, in immediate physical danger right now?',
  },
  {
    key: 'selfHarmRisk',
    text: 'Are you currently having thoughts of harming yourself or ending your life?',
  },
  {
    key: 'abuseCoercion',
    text: 'Is this decision connected to abuse, coercion, or someone controlling or threatening you?',
  },
];

function ResourceList({ title, resources }: { title: string; resources: { name: string; contact: string; description: string }[] }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="space-y-2">
        {resources.map((r) => (
          <div key={r.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-slate-100">{r.name}</p>
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">{r.contact}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SafetyScreen() {
  const safety = useCrossroadsStore((s) => s.safety);
  const answerSafety = useCrossroadsStore((s) => s.answerSafety);
  const acknowledgeSafetyResources = useCrossroadsStore((s) => s.acknowledgeSafetyResources);

  const [answers, setAnswers] = useState<Record<string, YesNo>>({
    immediateDanger: 'unset',
    selfHarmRisk: 'unset',
    abuseCoercion: 'unset',
  });

  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== 'unset');

  const alreadyCompleted = safety.completedAt !== null;
  const priorFlagged = safety.immediateDanger || safety.selfHarmRisk || safety.abuseCoercion;

  function submit() {
    answerSafety({
      immediateDanger: answers.immediateDanger === 'yes',
      selfHarmRisk: answers.selfHarmRisk === 'yes',
      abuseCoercion: answers.abuseCoercion === 'yes',
    });
  }

  const showResources = alreadyCompleted && priorFlagged && !safety.acknowledgedResources;

  // Case 1: not yet answered — show the screening questions.
  if (!alreadyCompleted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <SectionTitle
            title="Before we begin: a quick safety check"
            subtitle="Crossroads is a structured thinking tool for weighing life decisions. It is not a crisis service, and it can't help with situations involving immediate danger, self-harm risk, or abuse. Answering honestly helps make sure you get the right kind of help first."
          />
          <div className="space-y-5">
            {QUESTIONS.map((q) => (
              <div key={q.key}>
                <p className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">{q.text}</p>
                <div className="flex gap-2">
                  {(['no', 'yes'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [q.key]: opt }))}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                        answers[q.key] === opt
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-slate-400">Your answers stay on this device only.</p>
            <Button onClick={submit} disabled={!allAnswered}>
              Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Case 2: flagged and not yet acknowledged — show resources, block modeling.
  if (showResources) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Badge tone="bad">Please read this first</Badge>
          </div>
          <SectionTitle
            title="Support is available right now"
            subtitle="Based on your answers, what you're facing may be more urgent than a values-and-scenarios exercise can help with. These are real, confidential resources staffed by people trained for exactly this — please consider reaching out before working through a decision framework."
          />
          {safety.immediateDanger && <ResourceList title="Immediate danger" resources={IMMEDIATE_DANGER_RESOURCES} />}
          {safety.selfHarmRisk && <ResourceList title="Thoughts of self-harm" resources={SELF_HARM_RESOURCES} />}
          {safety.abuseCoercion && <ResourceList title="Abuse or coercion" resources={ABUSE_RESOURCES} />}

          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
            Crossroads is a self-help planning tool, not a substitute for professional, medical, or emergency support. If
            your situation changes or gets worse, please contact one of the resources above or your local emergency
            number.
          </div>

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Start over
            </Button>
            <Button variant="ghost" onClick={() => acknowledgeSafetyResources()}>
              I've seen these resources and want to continue anyway
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Case 3: passed (no flags, or flags acknowledged). App renders the main
  // app once isSafetyPassed(safety) is true, so nothing left to show here.
  return null;
}
