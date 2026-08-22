import type { SafetyScreenAnswers } from '../types';

export function isSafetyPassed(safety: SafetyScreenAnswers): boolean {
  if (!safety.completedAt) return false;
  const flagged = safety.immediateDanger || safety.selfHarmRisk || safety.abuseCoercion;
  if (!flagged) return true;
  return safety.acknowledgedResources;
}
