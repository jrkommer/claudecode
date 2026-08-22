export interface ValueItem {
  id: string;
  name: string;
  description?: string;
  weight: number; // raw weight, normalized to 100 for display/calc
}

// Optional grouping used only by presets that frame the decision as a
// binary fork (e.g. stay vs. leave) even though more than two scenarios
// exist. Scenarios without a branch are treated as ungrouped.
export type ScenarioBranch = 'stay' | 'leave';

export interface Scenario {
  id: string;
  name: string;
  description?: string; // shown as an info-icon tooltip next to the name
  category: string; // maps into base-rate hint categories
  scores: Record<string, number>; // valueId -> 1-10
  probability: number; // 0-100, user assigned
  branch?: ScenarioBranch;
  probabilityHint?: string; // overrides the category base-rate hint when set
}

export type EditFieldType = 'value-weight' | 'scenario-score' | 'scenario-probability' | 'branch-split';

export interface EditEvent {
  id: string;
  timestamp: string; // ISO
  fieldType: EditFieldType;
  scenarioId?: string; // which scenario this edit affects/favors
  valueId?: string;
  oldValue: number;
  newValue: number;
  postView: boolean; // true if made after results were first viewed
  favoredScenarioId?: string; // scenario whose weighted rank this edit improved, if any
  favoredBranch?: ScenarioBranch; // set instead of favoredScenarioId for branch-split edits
}

// Top-level split answering "out of 100 possible futures, how many end in
// each branch?" — the first question in the branch expected-value
// calculation. Only meaningful when scenarios carry a `branch` tag.
export interface BranchSplit {
  stay: number;
  leave: number;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date the evidence pertains to (user-set)
  createdAt: string; // ISO timestamp of entry creation
  scenarioId?: string;
  entryType?: string; // structured category, options depend on active preset
  title: string;
  content: string;
  tags: string[];
}

export type ContractStatus = 'draft' | 'cooling_off' | 'locked' | 'amending' | 'revoked';

export interface ContractDraftFields {
  decisionSummary: string;
  chosenScenarioId: string | null;
  commitmentText: string;
  conditions: string;
  ruleDeadline: string | null; // ISO date: "if by this date, the log shows X..."
}

export interface Contract extends ContractDraftFields {
  id: string;
  coolingOffHours: number;
  createdAt: string;
  coolingOffEndsAt: string;
  status: ContractStatus;
  history: { timestamp: string; action: string }[];
  // While status === 'amending', the fields above stay as originally locked
  // ("the original always displayed alongside") and the in-progress edit
  // lives here until the cooling-off period elapses and it's applied.
  pendingAmendment: ContractDraftFields | null;
  amendmentCoolingOffEndsAt: string | null;
}

export interface SafetyScreenAnswers {
  immediateDanger: boolean | null;
  selfHarmRisk: boolean | null;
  abuseCoercion: boolean | null;
  completedAt: string | null;
  acknowledgedResources: boolean;
}

export interface Trial {
  startedAt: string;
  days: number;
}

export interface TimelineWaypoint {
  year: number;
  value: number; // 0-10 scale, matches expected-value scoring elsewhere
}

export interface CustomTimelineData {
  adult: Record<string, TimelineWaypoint[]>; // seriesKey -> waypoints
  kids: Record<string, TimelineWaypoint[]>;
  adultSeriesLabels: Record<string, string>;
  kidsSeriesLabels: Record<string, string>;
  calloutAnnotation?: string;
}

export type PresetId = 'divorce-recovery';

export interface CrossroadsState {
  safety: SafetyScreenAnswers;
  values: ValueItem[];
  scenarios: Scenario[];
  editHistory: EditEvent[];
  resultsFirstViewedAt: string | null;
  initialLeaderScenarioId: string | null;
  journal: JournalEntry[];
  contract: Contract | null;
  trial: Trial | null;
  activePreset: PresetId | null;
  customTimelineData: CustomTimelineData | null;
  branchSplit: BranchSplit | null;
  createdAt: string;
  updatedAt: string;
}
