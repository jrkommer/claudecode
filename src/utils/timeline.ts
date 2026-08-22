import type { EditEvent, Scenario, ValueItem } from '../types';
import { expectedValue } from './scoring';

export interface HistoryPoint {
  timestamp: string;
  label: string;
  values: Record<string, number>; // scenarioId -> expected value at this point
}

// Replays edit history chronologically to reconstruct expected-value
// trajectories per scenario, starting from each scenario's defaults
// (score 5 on every value, weight 5, probability 50) at scenario creation.
export function replayHistory(
  editHistory: EditEvent[],
  scenarios: Scenario[],
  values: ValueItem[],
): HistoryPoint[] {
  if (scenarios.length === 0 || values.length === 0) return [];

  const scenarioWeightsCopy: ValueItem[] = values.map((v) => ({ ...v, weight: 5 }));
  const scenarioStates: Record<string, Scenario> = {};
  scenarios.forEach((s) => {
    const scores: Record<string, number> = {};
    values.forEach((v) => (scores[v.id] = 5));
    scenarioStates[s.id] = { ...s, scores, probability: 50 };
  });

  const sorted = [...editHistory].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const points: HistoryPoint[] = [];
  const snapshot = (timestamp: string): HistoryPoint => {
    const vals: Record<string, number> = {};
    scenarios.forEach((s) => {
      vals[s.id] = expectedValue(scenarioStates[s.id], scenarioWeightsCopy);
    });
    return {
      timestamp,
      label: new Date(timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      values: vals,
    };
  };

  points.push(snapshot(sorted[0]?.timestamp ?? new Date().toISOString()));

  sorted.forEach((edit) => {
    if (edit.fieldType === 'value-weight' && edit.valueId) {
      const idx = scenarioWeightsCopy.findIndex((v) => v.id === edit.valueId);
      if (idx >= 0) scenarioWeightsCopy[idx] = { ...scenarioWeightsCopy[idx], weight: edit.newValue };
    } else if (edit.fieldType === 'scenario-score' && edit.scenarioId && edit.valueId) {
      const s = scenarioStates[edit.scenarioId];
      if (s) s.scores = { ...s.scores, [edit.valueId]: edit.newValue };
    } else if (edit.fieldType === 'scenario-probability' && edit.scenarioId) {
      const s = scenarioStates[edit.scenarioId];
      if (s) s.probability = edit.newValue;
    }
    points.push(snapshot(edit.timestamp));
  });

  return points;
}

export interface ProjectionPoint {
  label: string;
  years: number;
  low: number;
  expected: number;
  high: number;
}

const HORIZONS = [
  { label: 'Now', years: 0 },
  { label: '6 months', years: 0.5 },
  { label: '1 year', years: 1 },
  { label: '2 years', years: 2 },
  { label: '5 years', years: 5 },
];

// Illustrative fan-chart projection: the expected line stays flat at the
// current expected value, while the uncertainty band widens with horizon
// and with lower assigned probability. This is explicitly NOT a forecast —
// it visualizes "the further out and the less certain, the wider the range
// of plausible outcomes."
export function projectScenario(scenario: Scenario, values: ValueItem[]): ProjectionPoint[] {
  const expected = expectedValue(scenario, values);
  const uncertainty = 1 - scenario.probability / 100;
  return HORIZONS.map((h) => {
    const halfWidth = 5 * uncertainty * (0.15 + 0.35 * Math.sqrt(h.years));
    return {
      label: h.label,
      years: h.years,
      low: Math.max(0, expected - halfWidth),
      expected,
      high: Math.min(10, expected + halfWidth),
    };
  });
}
