import type { EditEvent, Scenario, ValueItem } from '../types';

export interface LiveVariable {
  label: string;
  count: number;
}

// The input the user keeps returning to edit is treated as "the biggest
// live variable" — the thing still genuinely undecided, worth naming.
export function biggestLiveVariable(
  editHistory: EditEvent[],
  scenarios: Scenario[],
  values: ValueItem[],
): LiveVariable | null {
  if (editHistory.length === 0) return null;

  const counts = new Map<string, number>();
  editHistory.forEach((e) => {
    const key = `${e.fieldType}:${e.scenarioId ?? ''}:${e.valueId ?? ''}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  let topKey: string | null = null;
  let topCount = 0;
  counts.forEach((count, key) => {
    if (count > topCount) {
      topCount = count;
      topKey = key;
    }
  });
  if (!topKey) return null;

  const edit = editHistory.find(
    (e) => `${e.fieldType}:${e.scenarioId ?? ''}:${e.valueId ?? ''}` === topKey,
  );
  if (!edit) return null;

  const scenario = scenarios.find((s) => s.id === edit.scenarioId);
  const value = values.find((v) => v.id === edit.valueId);

  let label: string;
  if (edit.fieldType === 'branch-split') {
    label = 'the overall odds you put on leaving vs. staying';
  } else if (edit.fieldType === 'scenario-probability' && scenario) {
    label = `the probability you assign to "${scenario.name}"`;
  } else if (edit.fieldType === 'scenario-score' && scenario && value) {
    label = `how you're scoring "${scenario.name}" on "${value.name}"`;
  } else if (edit.fieldType === 'value-weight' && value) {
    label = `the weight you put on "${value.name}"`;
  } else {
    label = 'one input you keep returning to';
  }

  return { label, count: topCount };
}
