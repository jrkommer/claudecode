export interface ScenarioCategory {
  id: string;
  label: string;
  hint: string;
  source: string;
}

// Illustrative general reference points only — not personalized predictions.
// These exist to give users a rough outside-view anchor to compare their
// own probability estimate against, and to counter overconfidence /
// planning-fallacy bias. They are deliberately broad ranges.
export const SCENARIO_CATEGORIES: ScenarioCategory[] = [
  {
    id: 'career-change',
    label: 'Career / field change',
    hint: 'People who voluntarily switch careers report being glad they did roughly 60-70% of the time in follow-up surveys, but it commonly takes 1-2 years to feel "settled" in the new path.',
    source: 'General workforce transition survey literature (illustrative, not a guarantee)',
  },
  {
    id: 'relocation',
    label: 'Relocation / moving',
    hint: 'Long-distance moves show high early satisfaction that often dips around month 3-6 ("honeymoon drop") before recovering by month 12-18 for most movers.',
    source: 'Relocation adjustment research (illustrative pattern, individual variation is large)',
  },
  {
    id: 'relationship',
    label: 'Relationship / marriage decision',
    hint: 'Relationship satisfaction after major transitions (moving in together, marriage, ending a relationship) is heavily driven by pre-existing communication patterns more than the decision itself.',
    source: 'Relationship psychology literature (illustrative, highly individual)',
  },
  {
    id: 'entrepreneurship',
    label: 'Starting a business / venture',
    hint: 'A commonly cited (and debated) figure is that roughly 1 in 5 new businesses close within the first year, and about half close within five years — survival rates vary a lot by industry and funding.',
    source: 'Small business survival statistics (illustrative, varies widely by sector)',
  },
  {
    id: 'education',
    label: 'Further education / degree',
    hint: 'Return on additional education varies enormously by field; the strongest predictor of satisfaction is usually alignment with a clear next role, not the credential alone.',
    source: 'Higher-ed outcomes literature (illustrative)',
  },
  {
    id: 'health',
    label: 'Health / lifestyle change',
    hint: 'Most self-directed lifestyle changes (diet, exercise, habit change) without ongoing support or accountability have a well-documented high relapse rate within the first 6 months.',
    source: 'Behavior change research (illustrative, structured support improves odds)',
  },
  {
    id: 'financial',
    label: 'Financial / investment decision',
    hint: 'Individual investors and decision-makers systematically overestimate their own probability of a favorable outcome relative to base rates ("optimism bias") — worth explicitly discounting your gut number.',
    source: 'Behavioral finance literature (illustrative)',
  },
  {
    id: 'family',
    label: 'Family / caregiving decision',
    hint: 'Major family/caregiving transitions typically have a higher early-stress period (roughly the first 3-6 months) followed by adaptation as new routines form.',
    source: 'Family transitions research (illustrative)',
  },
  {
    id: 'other',
    label: 'Other / general',
    hint: 'Across decision domains, people are commonly overconfident in single-point probability estimates — consider stating a range instead of one number.',
    source: 'General judgment & decision-making literature (illustrative)',
  },
];

export function getCategoryHint(categoryId: string): ScenarioCategory | undefined {
  return SCENARIO_CATEGORIES.find((c) => c.id === categoryId);
}
