import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BranchSplit,
  ContractDraftFields,
  CrossroadsState,
  CustomTimelineData,
  EditFieldType,
  JournalEntry,
  PresetId,
  Scenario,
} from '../types';
import { newId } from '../utils/id';
import { favoredScenarioForEdit } from '../utils/bias';
import { leadingScenarioId } from '../utils/scoring';
import {
  DIVORCE_BRANCH_SPLIT,
  DIVORCE_PRESET_ID,
  DIVORCE_SCENARIOS,
  DIVORCE_TIMELINE,
  DIVORCE_VALUES,
} from '../data/divorcePreset';

const DEFAULT_COOLING_OFF_HOURS = 72;
const AMENDMENT_COOLING_OFF_HOURS = 72;

function nowIso(): string {
  return new Date().toISOString();
}

interface StoreActions {
  answerSafety: (patch: Partial<CrossroadsState['safety']>) => void;
  acknowledgeSafetyResources: () => void;

  addValue: (name: string, description?: string) => void;
  updateValueWeight: (id: string, weight: number) => void;
  updateValueName: (id: string, name: string, description?: string) => void;
  removeValue: (id: string) => void;

  addScenario: (name: string, category: string, description?: string) => void;
  updateScenarioMeta: (id: string, patch: Partial<Pick<Scenario, 'name' | 'description' | 'category'>>) => void;
  updateScenarioScore: (scenarioId: string, valueId: string, score: number) => void;
  updateScenarioProbability: (scenarioId: string, probability: number) => void;
  removeScenario: (id: string) => void;
  updateBranchSplit: (stay: number) => void;

  markResultsViewed: () => void;

  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  removeJournalEntry: (id: string) => void;

  startContract: (patch: ContractDraftFields & { coolingOffHours?: number }) => void;
  updateContractDraft: (patch: Partial<ContractDraftFields>) => void;
  beginCoolingOff: (coolingOffHours?: number) => void;
  returnContractToDraft: () => void;
  lockContract: () => void;
  revokeContract: () => void;
  requestAmendment: () => void;
  updatePendingAmendment: (patch: Partial<ContractDraftFields>) => void;
  applyAmendment: () => void;
  cancelAmendment: () => void;

  startTrial: (days: number, startedAt?: string) => void;
  clearTrial: () => void;

  updateTimelinePoint: (chart: 'adult' | 'kids', seriesKey: string, year: number, value: number) => void;

  loadPreset: (presetId: PresetId) => void;
  clearModel: () => void;

  resetAll: () => void;
  importState: (state: CrossroadsState) => void;
}

export type CrossroadsStore = CrossroadsState & StoreActions;

function initialState(): CrossroadsState {
  return {
    safety: {
      immediateDanger: null,
      selfHarmRisk: null,
      abuseCoercion: null,
      completedAt: null,
      acknowledgedResources: false,
    },
    values: [],
    scenarios: [],
    editHistory: [],
    resultsFirstViewedAt: null,
    initialLeaderScenarioId: null,
    journal: [],
    contract: null,
    trial: null,
    activePreset: null,
    customTimelineData: null,
    branchSplit: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

// Fields that reset when loading a preset or clearing the model, without
// touching the safety screen (already passed) or account-level metadata.
function blankModelFields(): Pick<
  CrossroadsState,
  | 'values'
  | 'scenarios'
  | 'editHistory'
  | 'resultsFirstViewedAt'
  | 'initialLeaderScenarioId'
  | 'journal'
  | 'contract'
  | 'trial'
  | 'activePreset'
  | 'customTimelineData'
  | 'branchSplit'
> {
  return {
    values: [],
    scenarios: [],
    editHistory: [],
    resultsFirstViewedAt: null,
    initialLeaderScenarioId: null,
    journal: [],
    contract: null,
    trial: null,
    activePreset: null,
    customTimelineData: null,
    branchSplit: null,
  };
}

export const useCrossroadsStore = create<CrossroadsStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      answerSafety: (patch) =>
        set((state) => ({
          safety: { ...state.safety, ...patch, completedAt: nowIso() },
          updatedAt: nowIso(),
        })),

      acknowledgeSafetyResources: () =>
        set((state) => ({
          safety: { ...state.safety, acknowledgedResources: true },
          updatedAt: nowIso(),
        })),

      addValue: (name, description) =>
        set((state) => ({
          values: [...state.values, { id: newId(), name, description, weight: 5 }],
          updatedAt: nowIso(),
        })),

      updateValueWeight: (id, weight) => {
        const state = get();
        const before = state.values.find((v) => v.id === id);
        if (!before) return;
        const postView = !!state.resultsFirstViewedAt;
        const favoredScenarioId = postView
          ? favoredScenarioForEdit(
              { fieldType: 'value-weight', valueId: id, oldValue: before.weight, newValue: weight },
              state.scenarios,
            )
          : undefined;
        set((s) => ({
          values: s.values.map((v) => (v.id === id ? { ...v, weight } : v)),
          editHistory: [
            ...s.editHistory,
            {
              id: newId(),
              timestamp: nowIso(),
              fieldType: 'value-weight' as EditFieldType,
              valueId: id,
              oldValue: before.weight,
              newValue: weight,
              postView,
              favoredScenarioId,
            },
          ],
          updatedAt: nowIso(),
        }));
      },

      updateValueName: (id, name, description) =>
        set((state) => ({
          values: state.values.map((v) => (v.id === id ? { ...v, name, description } : v)),
          updatedAt: nowIso(),
        })),

      removeValue: (id) =>
        set((state) => ({
          values: state.values.filter((v) => v.id !== id),
          scenarios: state.scenarios.map((s) => {
            const { [id]: _removed, ...rest } = s.scores;
            return { ...s, scores: rest };
          }),
          updatedAt: nowIso(),
        })),

      addScenario: (name, category, description) =>
        set((state) => {
          if (state.scenarios.length >= 4) return state;
          const scores: Record<string, number> = {};
          state.values.forEach((v) => (scores[v.id] = 5));
          return {
            scenarios: [
              ...state.scenarios,
              { id: newId(), name, category, description, scores, probability: 50 },
            ],
            updatedAt: nowIso(),
          };
        }),

      updateScenarioMeta: (id, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          updatedAt: nowIso(),
        })),

      updateScenarioScore: (scenarioId, valueId, score) => {
        const state = get();
        const scenario = state.scenarios.find((s) => s.id === scenarioId);
        if (!scenario) return;
        const oldValue = scenario.scores[valueId] ?? 0;
        const postView = !!state.resultsFirstViewedAt;
        const favoredScenarioId = postView
          ? favoredScenarioForEdit(
              { fieldType: 'scenario-score', scenarioId, valueId, oldValue, newValue: score },
              state.scenarios,
            )
          : undefined;
        set((s) => ({
          scenarios: s.scenarios.map((sc) =>
            sc.id === scenarioId ? { ...sc, scores: { ...sc.scores, [valueId]: score } } : sc,
          ),
          editHistory: [
            ...s.editHistory,
            {
              id: newId(),
              timestamp: nowIso(),
              fieldType: 'scenario-score' as EditFieldType,
              scenarioId,
              valueId,
              oldValue,
              newValue: score,
              postView,
              favoredScenarioId,
            },
          ],
          updatedAt: nowIso(),
        }));
      },

      updateScenarioProbability: (scenarioId, probability) => {
        const state = get();
        const scenario = state.scenarios.find((s) => s.id === scenarioId);
        if (!scenario) return;
        const oldValue = scenario.probability;
        const postView = !!state.resultsFirstViewedAt;
        const favoredScenarioId = postView
          ? favoredScenarioForEdit(
              { fieldType: 'scenario-probability', scenarioId, oldValue, newValue: probability },
              state.scenarios,
            )
          : undefined;
        set((s) => ({
          scenarios: s.scenarios.map((sc) => (sc.id === scenarioId ? { ...sc, probability } : sc)),
          editHistory: [
            ...s.editHistory,
            {
              id: newId(),
              timestamp: nowIso(),
              fieldType: 'scenario-probability' as EditFieldType,
              scenarioId,
              oldValue,
              newValue: probability,
              postView,
              favoredScenarioId,
            },
          ],
          updatedAt: nowIso(),
        }));
      },

      removeScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          updatedAt: nowIso(),
        })),

      updateBranchSplit: (stay) => {
        const state = get();
        const oldStay = state.branchSplit?.stay ?? 50;
        const clamped = Math.max(0, Math.min(100, stay));
        const postView = !!state.resultsFirstViewedAt;
        const favoredBranch = postView
          ? clamped > oldStay
            ? 'stay'
            : clamped < oldStay
              ? 'leave'
              : undefined
          : undefined;
        const next: BranchSplit = { stay: clamped, leave: 100 - clamped };
        set((s) => ({
          branchSplit: next,
          editHistory: [
            ...s.editHistory,
            {
              id: newId(),
              timestamp: nowIso(),
              fieldType: 'branch-split' as EditFieldType,
              oldValue: oldStay,
              newValue: clamped,
              postView,
              favoredBranch,
            },
          ],
          updatedAt: nowIso(),
        }));
      },

      markResultsViewed: () =>
        set((state) => {
          if (state.resultsFirstViewedAt) return state;
          return {
            resultsFirstViewedAt: nowIso(),
            initialLeaderScenarioId: leadingScenarioId(state.scenarios, state.values),
            updatedAt: nowIso(),
          };
        }),

      addJournalEntry: (entry) =>
        set((state) => ({
          journal: [
            { ...entry, id: newId(), createdAt: nowIso() },
            ...state.journal,
          ],
          updatedAt: nowIso(),
        })),

      removeJournalEntry: (id) =>
        set((state) => ({
          journal: state.journal.filter((j) => j.id !== id),
          updatedAt: nowIso(),
        })),

      startContract: (patch) =>
        set(() => {
          const created = nowIso();
          const { coolingOffHours, ...draft } = patch;
          return {
            contract: {
              id: newId(),
              ...draft,
              coolingOffHours: coolingOffHours || DEFAULT_COOLING_OFF_HOURS,
              createdAt: created,
              coolingOffEndsAt: created,
              status: 'draft',
              history: [{ timestamp: created, action: 'Draft created' }],
              pendingAmendment: null,
              amendmentCoolingOffEndsAt: null,
            },
            updatedAt: nowIso(),
          };
        }),

      updateContractDraft: (patch) =>
        set((state) => {
          if (!state.contract || state.contract.status !== 'draft') return state;
          return {
            contract: { ...state.contract, ...patch },
            updatedAt: nowIso(),
          };
        }),

      beginCoolingOff: (coolingOffHours) =>
        set((state) => {
          if (!state.contract) return state;
          const hours = coolingOffHours ?? state.contract.coolingOffHours;
          const start = nowIso();
          const ends = new Date(Date.now() + hours * 3600 * 1000).toISOString();
          return {
            contract: {
              ...state.contract,
              coolingOffHours: hours,
              coolingOffEndsAt: ends,
              status: 'cooling_off',
              history: [
                ...state.contract.history,
                { timestamp: start, action: `Cooling-off period started (${hours}h)` },
              ],
            },
            updatedAt: nowIso(),
          };
        }),

      returnContractToDraft: () =>
        set((state) => {
          if (!state.contract || state.contract.status !== 'cooling_off') return state;
          const ts = nowIso();
          return {
            contract: {
              ...state.contract,
              status: 'draft',
              history: [
                ...state.contract.history,
                { timestamp: ts, action: 'Returned to draft for edits (cooling-off reset)' },
              ],
            },
            updatedAt: nowIso(),
          };
        }),

      lockContract: () =>
        set((state) => {
          if (!state.contract) return state;
          if (state.contract.status !== 'cooling_off') return state;
          if (new Date(state.contract.coolingOffEndsAt).getTime() > Date.now()) return state;
          const ts = nowIso();
          return {
            contract: {
              ...state.contract,
              status: 'locked',
              history: [...state.contract.history, { timestamp: ts, action: 'Locked in' }],
            },
            updatedAt: nowIso(),
          };
        }),

      revokeContract: () =>
        set((state) => {
          if (!state.contract) return state;
          const ts = nowIso();
          return {
            contract: {
              ...state.contract,
              status: 'revoked',
              history: [...state.contract.history, { timestamp: ts, action: 'Revoked' }],
            },
            updatedAt: nowIso(),
          };
        }),

      requestAmendment: () =>
        set((state) => {
          if (!state.contract || state.contract.status !== 'locked') return state;
          const ts = nowIso();
          const ends = new Date(Date.now() + AMENDMENT_COOLING_OFF_HOURS * 3600 * 1000).toISOString();
          const { decisionSummary, chosenScenarioId, commitmentText, conditions, ruleDeadline } = state.contract;
          return {
            contract: {
              ...state.contract,
              status: 'amending',
              pendingAmendment: { decisionSummary, chosenScenarioId, commitmentText, conditions, ruleDeadline },
              amendmentCoolingOffEndsAt: ends,
              history: [
                ...state.contract.history,
                { timestamp: ts, action: `Amendment requested — ${AMENDMENT_COOLING_OFF_HOURS}h cooling-off started` },
              ],
            },
            updatedAt: nowIso(),
          };
        }),

      updatePendingAmendment: (patch) =>
        set((state) => {
          if (!state.contract || state.contract.status !== 'amending' || !state.contract.pendingAmendment) {
            return state;
          }
          return {
            contract: {
              ...state.contract,
              pendingAmendment: { ...state.contract.pendingAmendment, ...patch },
            },
            updatedAt: nowIso(),
          };
        }),

      applyAmendment: () =>
        set((state) => {
          if (!state.contract || state.contract.status !== 'amending' || !state.contract.pendingAmendment) {
            return state;
          }
          if (
            state.contract.amendmentCoolingOffEndsAt &&
            new Date(state.contract.amendmentCoolingOffEndsAt).getTime() > Date.now()
          ) {
            return state;
          }
          const ts = nowIso();
          return {
            contract: {
              ...state.contract,
              ...state.contract.pendingAmendment,
              status: 'locked',
              pendingAmendment: null,
              amendmentCoolingOffEndsAt: null,
              history: [...state.contract.history, { timestamp: ts, action: 'Amendment applied' }],
            },
            updatedAt: nowIso(),
          };
        }),

      cancelAmendment: () =>
        set((state) => {
          if (!state.contract || state.contract.status !== 'amending') return state;
          const ts = nowIso();
          return {
            contract: {
              ...state.contract,
              status: 'locked',
              pendingAmendment: null,
              amendmentCoolingOffEndsAt: null,
              history: [...state.contract.history, { timestamp: ts, action: 'Amendment cancelled' }],
            },
            updatedAt: nowIso(),
          };
        }),

      startTrial: (days, startedAt) =>
        set(() => ({
          trial: { startedAt: startedAt ?? nowIso(), days },
          updatedAt: nowIso(),
        })),

      clearTrial: () =>
        set(() => ({
          trial: null,
          updatedAt: nowIso(),
        })),

      updateTimelinePoint: (chart, seriesKey, year, value) =>
        set((state) => {
          if (!state.customTimelineData) return state;
          const series = state.customTimelineData[chart][seriesKey];
          if (!series) return state;
          const updated = series.map((p) => (p.year === year ? { ...p, value } : p));
          const next: CustomTimelineData = {
            ...state.customTimelineData,
            [chart]: { ...state.customTimelineData[chart], [seriesKey]: updated },
          };
          return { customTimelineData: next, updatedAt: nowIso() };
        }),

      loadPreset: (presetId) =>
        set((state) => {
          if (presetId !== DIVORCE_PRESET_ID) return state;
          const values = DIVORCE_VALUES.map((v) => ({ ...v, id: newId() }));
          const valueIdByIndex = values.map((v) => v.id);
          const scenarios: Scenario[] = DIVORCE_SCENARIOS.map((seed) => {
            const scores: Record<string, number> = {};
            seed.scores.forEach((score, i) => {
              scores[valueIdByIndex[i]] = score;
            });
            return {
              id: newId(),
              name: seed.name,
              description: seed.description,
              category: 'relationship',
              scores,
              probability: seed.probability,
              branch: seed.branch,
              probabilityHint: seed.probabilityHint,
            };
          });
          return {
            ...blankModelFields(),
            values,
            scenarios,
            activePreset: presetId,
            customTimelineData: DIVORCE_TIMELINE,
            branchSplit: DIVORCE_BRANCH_SPLIT,
            updatedAt: nowIso(),
          };
        }),

      clearModel: () =>
        set(() => ({
          ...blankModelFields(),
          updatedAt: nowIso(),
        })),

      resetAll: () => set(() => initialState()),

      importState: (imported) => set(() => imported),
    }),
    {
      name: 'crossroads-decision-store',
      version: 3,
    },
  ),
);

export function useLeadingScenarioId(by: 'weighted' | 'expected' = 'expected') {
  return useCrossroadsStore((s) => leadingScenarioId(s.scenarios, s.values, by));
}
