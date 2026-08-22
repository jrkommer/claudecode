import type { EditEvent, Scenario } from '../types';

const MIN_ATTRIBUTED_EDITS = 4;
const DOMINANCE_THRESHOLD = 0.7; // share of attributable post-view edits favoring one scenario

// Given an edit and the state *before* it was applied, figure out which
// scenario (if any) the edit relatively favors. Increases favor directly;
// decreases are attributed only where unambiguous (weight decreases favor
// whichever scenario was weakest on that value). Self-score/probability
// decreases are left unattributed since with 3-4 scenarios it's ambiguous
// who benefits.
export function favoredScenarioForEdit(
  edit: Omit<EditEvent, 'id' | 'timestamp' | 'postView' | 'favoredScenarioId'>,
  scenariosBefore: Scenario[],
): string | undefined {
  const increased = edit.newValue > edit.oldValue;
  const decreased = edit.newValue < edit.oldValue;
  if (!increased && !decreased) return undefined;

  if (edit.fieldType === 'scenario-score' || edit.fieldType === 'scenario-probability') {
    if (increased && edit.scenarioId) return edit.scenarioId;
    return undefined;
  }

  if (edit.fieldType === 'value-weight' && edit.valueId) {
    const withScore = scenariosBefore
      .map((s) => ({ id: s.id, score: s.scores[edit.valueId!] ?? 0 }))
      .sort((a, b) => b.score - a.score);
    if (withScore.length === 0) return undefined;
    const target = increased ? withScore[0] : withScore[withScore.length - 1];
    // Only attribute if there's a clear (non-tied) extreme.
    const tieCount = withScore.filter((s) => s.score === target.score).length;
    if (tieCount > 1) return undefined;
    return target.id;
  }

  return undefined;
}

export interface BiasAnalysis {
  hasEnoughData: boolean;
  totalPostViewEdits: number;
  attributedEdits: number;
  counts: Record<string, number>;
  dominantScenarioId: string | null;
  dominantShare: number;
  initialLeaderId: string | null;
  flag: 'none' | 'reinforcing' | 'reversing';
  message: string | null;
}

export function analyzeBias(
  editHistory: EditEvent[],
  scenarios: Scenario[],
  initialLeaderId: string | null,
): BiasAnalysis {
  const postView = editHistory.filter((e) => e.postView);
  const attributed = postView.filter((e) => e.favoredScenarioId);
  const counts: Record<string, number> = {};
  attributed.forEach((e) => {
    const id = e.favoredScenarioId!;
    counts[id] = (counts[id] ?? 0) + 1;
  });

  let dominantScenarioId: string | null = null;
  let dominantShare = 0;
  Object.entries(counts).forEach(([id, count]) => {
    const share = attributed.length > 0 ? count / attributed.length : 0;
    if (share > dominantShare) {
      dominantShare = share;
      dominantScenarioId = id;
    }
  });

  const hasEnoughData = attributed.length >= MIN_ATTRIBUTED_EDITS;
  let flag: BiasAnalysis['flag'] = 'none';
  let message: string | null = null;

  if (hasEnoughData && dominantScenarioId && dominantShare >= DOMINANCE_THRESHOLD) {
    const name = scenarios.find((s) => s.id === dominantScenarioId)?.name ?? 'one scenario';
    if (initialLeaderId && dominantScenarioId !== initialLeaderId) {
      flag = 'reversing';
      message = `${Math.round(dominantShare * 100)}% of your edits since viewing results have favored "${name}" — a scenario that was NOT leading when you first saw the results. This pattern can indicate you're adjusting inputs to justify a conclusion you'd already leaned toward, rather than updating on new information. Consider reviewing whether these edits reflect genuinely new evidence.`;
    } else {
      flag = 'reinforcing';
      message = `${Math.round(dominantShare * 100)}% of your edits since viewing results have favored "${name}", which was already leading. This can be legitimate refinement, but it's worth double-checking each edit reflects real new information rather than a desire to widen the margin.`;
    }
  }

  return {
    hasEnoughData,
    totalPostViewEdits: postView.length,
    attributedEdits: attributed.length,
    counts,
    dominantScenarioId,
    dominantShare,
    initialLeaderId,
    flag,
    message,
  };
}

export { MIN_ATTRIBUTED_EDITS, DOMINANCE_THRESHOLD };
