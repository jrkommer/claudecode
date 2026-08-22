export interface ValueItem {
  id: string;
  name: string;
  description?: string;
  weight: number; // raw weight, normalized to 100 for display/calc
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  category: string; // maps into base-rate hint categories
  scores: Record<string, number>; // valueId -> 1-10
  probability: number; // 0-100, user assigned
}

export type EditFieldType = 'value-weight' | 'scenario-score' | 'scenario-probability';

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
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date the evidence pertains to (user-set)
  createdAt: string; // ISO timestamp of entry creation
  scenarioId?: string;
  title: string;
  content: string;
  tags: string[];
}

export type ContractStatus = 'draft' | 'cooling_off' | 'locked' | 'revoked';

export interface Contract {
  id: string;
  decisionSummary: string;
  chosenScenarioId: string | null;
  commitmentText: string;
  conditions: string;
  coolingOffHours: number;
  createdAt: string;
  coolingOffEndsAt: string;
  status: ContractStatus;
  history: { timestamp: string; action: string }[];
}

export interface SafetyScreenAnswers {
  immediateDanger: boolean | null;
  selfHarmRisk: boolean | null;
  abuseCoercion: boolean | null;
  completedAt: string | null;
  acknowledgedResources: boolean;
}

export interface CrossroadsState {
  safety: SafetyScreenAnswers;
  values: ValueItem[];
  scenarios: Scenario[];
  editHistory: EditEvent[];
  resultsFirstViewedAt: string | null;
  initialLeaderScenarioId: string | null;
  journal: JournalEntry[];
  contract: Contract | null;
  createdAt: string;
  updatedAt: string;
}
