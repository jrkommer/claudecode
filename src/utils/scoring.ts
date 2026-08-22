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

// A scenario's likelihood relative to the other scenarios sharing its
// branch, renormalized to sum to 100% within that branch. Shared by
// effectiveProbability and branchExpectedValue so the two stay consistent.
function relativeLikelihoodWithinBranch(scenario: Scenario, branchMembers: Scenario[]): number {
  if (branchMembers.length <= 1) return 1;
  const probSum = branchMembers.reduce((sum, s) => sum + Math.max(0, s.probability), 0);
  return probSum > 0 ? Math.max(0, scenario.probability) / probSum : 1 / branchMembers.length;
}

// The probability actually used for expected-value math. When a scenario
// belongs to a branch and a top-level branchSplit answer exists, this
// composes the two questions — P(branch) x relative-likelihood-within-
// branch — instead of the scenario's own (now relative) probability field.
// Falls back to the scenario's raw probability when there's no branch or
// no branchSplit yet, so ungrouped/generic scenarios are unaffected.
export function effectiveProbability(
  scenario: Scenario,
  scenarios: Scenario[],
  branchSplit: BranchSplit | null | undefined,
): number {
  if (!scenario.branch || !branchSplit) return scenario.probability;
  const members = scenarios.filter((s) => s.branch === scenario.branch);
  return branchSplit[scenario.branch] * relativeLikelihoodWithinBranch(scenario, members);
}

// Expected value = weighted score * effective probability, 0-10 scale.
// Pass `scenarios` + `branchSplit` so a branch-tagged scenario's expected
// value reflects the top-level stay/leave split; omit them (or pass no
// branchSplit) to use the scenario's own probability directly.
export function expectedValue(
  scenario: Scenario,
  values: ValueItem[],
  scenarios?: Scenario[],
  branchSplit?: BranchSplit | null,
): number {
  const probability = scenarios ? effectiveProbability(scenario, scenarios, branchSplit) : scenario.probability;
  return weightedScore(scenario, values) * (probability / 100);
}

export function rankScenarios(
  scenarios: Scenario[],
  values: ValueItem[],
  by: 'weighted' | 'expected' = 'expected',
  branchSplit?: BranchSplit | null,
): Scenario[] {
  return [...scenarios].sort((a, b) => {
    const scoreA = by === 'weighted' ? weightedScore(a, values) : expectedValue(a, values, scenarios, branchSplit);
    const scoreB = by === 'weighted' ? weightedScore(b, values) : expectedValue(b, values, scenarios, branchSplit);
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
    const branchWeightedScore = members.reduce(
      (sum, s) => sum + relativeLikelihoodWithinBranch(s, members) * weightedScore(s, values),
      0,
    );
    result[branch] = (branchSplit[branch] / 100) * branchWeightedScore;
  });
  return result;
}

export function leadingScenarioId(
  scenarios: Scenario[],
  values: ValueItem[],
  by: 'weighted' | 'expected' = 'expected',
  branchSplit?: BranchSplit | null,
): string | null {
  if (scenarios.length === 0) return null;
  const ranked = rankScenarios(scenarios, values, by, branchSplit);
  return ranked[0]?.id ?? null;
}
