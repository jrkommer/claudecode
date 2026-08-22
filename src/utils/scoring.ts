import type { BranchSplit, Scenario, ScenarioBranch, ValueItem } from '../types';

export function normalizedWeights(values: ValueItem[]): Record<string, number> {
  const total = values.reduce((sum, v) => sum + Math.max(0, v.weight), 0);
  const result: Record<string, number> = {};
  if (total <= 0) {
    values.forEach((v) => (result[v.id] = 0));
    return result;
  }
  values.forEach((v) => {
    result[v.id] = (Math.max(0, v.weight) / total) * 100;
  });
  return result;
}

// Weighted total score for a scenario, on a 0-10 scale.
export function weightedScore(scenario: Scenario, values: ValueItem[]): number {
  const weights = normalizedWeights(values);
  let total = 0;
  values.forEach((v) => {
    const score = scenario.scores[v.id] ?? 0;
    total += (weights[v.id] / 100) * score;
  });
  return total;
}

// Expected value = weighted score * user-assigned probability, 0-10 scale.
export function expectedValue(scenario: Scenario, values: ValueItem[]): number {
  return weightedScore(scenario, values) * (scenario.probability / 100);
}

export function rankScenarios(
  scenarios: Scenario[],
  values: ValueItem[],
  by: 'weighted' | 'expected' = 'expected',
): Scenario[] {
  return [...scenarios].sort((a, b) => {
    const scoreA = by === 'weighted' ? weightedScore(a, values) : expectedValue(a, values);
    const scoreB = by === 'weighted' ? weightedScore(b, values) : expectedValue(b, values);
    return scoreB - scoreA;
  });
}

// Proper expectation decomposition for a binary-fork preset (stay/leave):
// P(branch) x [ Σ over that branch's scenarios of (relative-likelihood-
// within-branch x weightedScore) ]. The top-level P(branch) split is a
// direct user answer (branchSplit). Each scenario's own `probability`
// field is reinterpreted here as its likelihood *relative to the other
// scenarios in its branch* — renormalized to sum to 100% within the
// branch, so the two questions compose into a real law-of-total-
// expectation calculation instead of an arbitrary sum.
export function branchExpectedValue(
  scenarios: Scenario[],
  values: ValueItem[],
  branchSplit: BranchSplit,
): Record<ScenarioBranch, number> {
  const result: Record<ScenarioBranch, number> = { stay: 0, leave: 0 };
  (['stay', 'leave'] as const).forEach((branch) => {
    const members = scenarios.filter((s) => s.branch === branch);
    if (members.length === 0) return;
    const probSum = members.reduce((sum, s) => sum + Math.max(0, s.probability), 0);
    const branchWeightedScore = members.reduce((sum, s) => {
      const relativeLikelihood = probSum > 0 ? Math.max(0, s.probability) / probSum : 1 / members.length;
      return sum + relativeLikelihood * weightedScore(s, values);
    }, 0);
    result[branch] = (branchSplit[branch] / 100) * branchWeightedScore;
  });
  return result;
}

export function leadingScenarioId(
  scenarios: Scenario[],
  values: ValueItem[],
  by: 'weighted' | 'expected' = 'expected',
): string | null {
  if (scenarios.length === 0) return null;
  const ranked = rankScenarios(scenarios, values, by);
  return ranked[0]?.id ?? null;
}
