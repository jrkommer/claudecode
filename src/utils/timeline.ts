import type { BranchSplit, EditEvent, Scenario, ValueItem } from '../types';
import { effectiveProbability, expectedValue } from './scoring';

export interface HistoryPoint {
  timestamp: string;
  label: string;
  values: Record<string, number>; // scenarioId -> expected value at this point
}

const NEUTRAL_BRANCH_SPLIT: BranchSplit = { stay: 50, leave: 50 };

// Replays edit history chronologically to reconstruct expected-value
// trajectories per scenario, starting from each scenario's defaults
// (score 5 on every value, weight 5, probability 50, and — when branches
// are in play — a neutral 50/50 split) and applying every edit event
// (including branch-split answers) in the order it happened.
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
  const hasBranches = scenarios.some((s) => s.branch);
  let branchSplitState: BranchSplit | null = hasBranches ? NEUTRAL_BRANCH_SPLIT : null;

  const sorted = [...editHistory].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const points: HistoryPoint[] = [];
  const allStates = () => Object.values(scenarioStates);
  const snapshot = (timestamp: string): HistoryPoint => {
    const vals: Record<string, number> = {};
    scenarios.forEach((s) => {
      vals[s.id] = expectedValue(scenarioStates[s.id], scenarioWeightsCopy, allStates(), branchSplitState);
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
    } else if (edit.fieldType === 'branch-split') {
      branchSplitState = { stay: edit.newValue, leave: 100 - edit.newValue };
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
// of plausible outcomes." Pass `scenarios` + `branchSplit` so a branch-
// tagged scenario's effective probability (not just its own raw field)
// drives the band width.
export function projectScenario(
  scenario: Scenario,
  values: ValueItem[],
  scenarios?: Scenario[],
  branchSplit?: BranchSplit | null,
): ProjectionPoint[] {
  const expected = expectedValue(scenario, values, scenarios, branchSplit);
  const probability = scenarios ? effectiveProbability(scenario, scenarios, branchSplit) : scenario.probability;
  const uncertainty = 1 - probability / 100;
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
