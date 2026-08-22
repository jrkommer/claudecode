import type { Scenario, ValueItem } from '../types';

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

export function leadingScenarioId(
  scenarios: Scenario[],
  values: ValueItem[],
  by: 'weighted' | 'expected' = 'expected',
): string | null {
  if (scenarios.length === 0) return null;
  const ranked = rankScenarios(scenarios, values, by);
  return ranked[0]?.id ?? null;
}
