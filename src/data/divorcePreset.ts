import type { CustomTimelineData, ValueItem, TimelineWaypoint } from '../types';

export const DIVORCE_PRESET_ID = 'divorce-recovery' as const;

export const DIVORCE_EXAMPLE_BANNER =
  'Example values — one real person\'s model. Replace with yours.';

export const DIVORCE_PROBABILITY_BANNER = 'Illustrative — your odds are yours.';

export const DIVORCE_VALUES: Omit<ValueItem, 'id'>[] = [
  { name: "Kids' wellbeing", weight: 25 },
  { name: 'Emotional closeness', weight: 22 },
  { name: 'Self-respect', weight: 16 },
  { name: 'Physical intimacy', weight: 10 },
  { name: 'Daily parenting presence', description: '"Pancake mornings"', weight: 10 },
  { name: 'Financial stability', weight: 7 },
  { name: 'Friends & community', weight: 5 },
  { name: 'Personal freedom', weight: 5 },
];

// Column order matches DIVORCE_VALUES above.
const REBUILD_BETTER_SCORES = [9, 8, 7, 8, 10, 8.5, 8, 7];
const LEAVE_REBUILD_SCORES = [6, 8.5, 8, 9, 5.5, 6, 6, 8.5];
const SCARRED_NORMAL_SCORES = [8, 4.5, 4, 2.5, 10, 8.5, 7, 5.5];
const FROZEN_SCORES = [5, 2.5, 3, 2, 9, 7.5, 6, 4];

export interface DivorceScenarioSeed {
  name: string;
  description: string; // tooltip
  branch: 'stay' | 'leave';
  scores: number[];
  probability: number;
  probabilityHint: string;
}

export const DIVORCE_SCENARIOS: DivorceScenarioSeed[] = [
  {
    name: 'Rebuild & better than ever',
    description:
      'Full repair: both partners do the work, and the relationship that emerges is more honest and closer than before the betrayal.',
    branch: 'stay',
    scores: REBUILD_BETTER_SCORES,
    probability: 20,
    probabilityHint:
      'Couples staying together post-affair: ~60-75% (general base rate). Rebuild-to-better specifically requires recovery × identity rebuild × new compatibility — multiply, don\'t average, since a weak link in any one factor caps the whole outcome.',
  },
  {
    name: 'Leave & rebuild with someone else',
    description:
      'The relationship ends; you rebuild a separate life and, eventually, possibly a new relationship.',
    branch: 'leave',
    scores: LEAVE_REBUILD_SCORES,
    probability: 65,
    probabilityHint:
      '5-yr divorce rate with full disclosure + therapy: ~43%, vs ~80% when the affair stays hidden. Disclosure and support change the odds substantially either direction you go.',
  },
  {
    name: 'Scarred normal',
    description:
      'There is no going back to "old normal" after betrayal — this is staying without full repair. The knowledge stays, managed rather than resolved.',
    branch: 'stay',
    scores: SCARRED_NORMAL_SCORES,
    probability: 40,
    probabilityHint:
      'Affair recovery timeline: 2-5 years; feelings typically return in year 2-3, not year 1. A "scarred normal" reached quickly is often relief mistaken for repair — worth naming which one it is.',
  },
  {
    name: 'Frozen drift',
    description: 'The only door that opens by itself — staying by default, without deciding to.',
    branch: 'stay',
    scores: FROZEN_SCORES,
    probability: 30,
    probabilityHint:
      'No published base rate for indefinite non-decision — by definition, "frozen" avoids the outcomes the other three paths eventually measure. That absence of data is itself informative.',
  },
];

export const DIVORCE_EVIDENCE_TYPES = [
  'Surprise/engagement',
  'Warmth flicker',
  'Partner initiative (own rebuild)',
  'Repair behavior',
  'Coercion/pressure',
  'How they received a no',
  'Tripwire event',
];

export const DEFAULT_EVIDENCE_TYPES = ['Milestone', 'Conversation', 'Concern', 'Other'];

function waypoints(years: number[], values: number[]): TimelineWaypoint[] {
  return years.map((year, i) => ({ year, value: values[i] }));
}

const YEARS = [0, 1, 2, 3, 4, 5, 7, 10, 12, 15, 20];

export const DIVORCE_TIMELINE: CustomTimelineData = {
  adultSeriesLabels: {
    'rebuild-better': 'Rebuild & better than ever',
    'leave-rebuild': 'Leave & rebuild with someone else',
    'scarred-normal': 'Scarred normal',
    frozen: 'Frozen drift',
  },
  adult: {
    'rebuild-better': waypoints(YEARS, [4.5, 5.8, 6.9, 8.2, 8.3, 8.3, 8.0, 7.8, 7.8, 8.1, 8.5]),
    'leave-rebuild': waypoints(YEARS, [5.5, 4.2, 5.5, 6.5, 7.2, 7.4, 7.5, 7.5, 7.5, 7.5, 7.5]),
    'scarred-normal': waypoints(YEARS, [5.5, 5.7, 5.7, 5.7, 5.7, 5.7, 5.6, 5.6, 3.8, 3.6, 3.5]),
    frozen: waypoints(YEARS, [4.5, 4.4, 4.3, 4.2, 4.1, 4.0, 3.9, 3.7, 3.6, 3.55, 3.5]),
  },
  kidsSeriesLabels: {
    'rebuild-better': 'Rebuild & better than ever',
    'friendly-divorce': 'Friendly divorce',
    'unfriendly-divorce': 'Unfriendly divorce',
    'gray-holds': 'Gray, holds',
    'gray-collapses-late': 'Gray, collapses late',
    frozen: 'Frozen drift',
  },
  kids: {
    'rebuild-better': waypoints(YEARS, [7.5, 7.8, 8.1, 8.3, 8.4, 8.5, 8.3, 7.9, 8.0, 8.5, 8.7]),
    'friendly-divorce': waypoints(YEARS, [6.5, 5.0, 5.8, 5.5, 5.7, 6.0, 7.0, 7.6, 7.8, 8.0, 8.0]),
    'unfriendly-divorce': waypoints(YEARS, [6.0, 4.5, 4.7, 5.0, 5.3, 5.6, 6.0, 6.3, 6.4, 6.5, 6.5]),
    'gray-holds': waypoints(YEARS, [6.8, 6.8, 6.8, 6.8, 6.8, 6.8, 6.8, 6.8, 6.8, 6.8, 6.8]),
    'gray-collapses-late': waypoints(YEARS, [7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.3, 5.5, 6.2, 6.5]),
    frozen: waypoints(YEARS, [6.0, 5.8, 5.6, 5.4, 5.2, 5.0, 4.9, 4.8, 4.7, 4.65, 4.6]),
  },
  calloutAnnotation:
    'For kids, HOW a divorce happens matters more than WHETHER — friendly ranks 2nd, hostile ranks 4th, below a cold intact home.',
};

export const DIVORCE_ABOUT_TEXT = {
  premise:
    'The model doesn\'t decide. It shows you what your own inputs already believe — so you can test that against evidence, with help.',
  disclosure:
    'Every default in this module — the values, the weights, the scenario scores, the probabilities, the timeline curves — belongs to one illustrative example profile, not to you. They exist to show the tool working, and to give you something concrete to react to and disagree with. Replace all of it. The base-rate hints beside the probability inputs are general, widely-cited research figures, not a prediction about your relationship; individual variation is large, and reputable estimates for things like post-affair outcomes vary noticeably by study and population.',
};
