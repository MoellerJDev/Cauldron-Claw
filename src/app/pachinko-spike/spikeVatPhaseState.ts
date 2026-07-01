import type { SpikeGrabbedIngredient } from './spikeClawPhaseState';
import {
  isSpikeDebugVatId,
  type SpikeDebugVatId,
} from './spikeConfig';
import type { SpikeVatScoringResult } from './spikeVatScoring';

export interface SpikeVatPhaseState {
  selectedVatId: SpikeDebugVatId;
  submitted: boolean;
  lastScoringResult: SpikeVatScoringResult | undefined;
}

export interface SpikeVatSubmitResult {
  state: SpikeVatPhaseState;
  accepted: boolean;
}

export function createInitialSpikeVatPhaseState(
  selectedVatId: SpikeDebugVatId = 'healing',
): SpikeVatPhaseState {
  return {
    selectedVatId,
    submitted: false,
    lastScoringResult: undefined,
  };
}

export function resetSpikeVatPhaseState(): SpikeVatPhaseState {
  return createInitialSpikeVatPhaseState();
}

export function selectSpikeVat(
  state: SpikeVatPhaseState,
  selectedVatId: SpikeDebugVatId,
): SpikeVatPhaseState {
  if (!isSpikeDebugVatId(selectedVatId)) {
    throw new Error(`Unknown spike debug vat: ${String(selectedVatId)}`);
  }

  return {
    ...state,
    selectedVatId,
  };
}

export function canSelectSpikeVat(
  state: SpikeVatPhaseState,
  grabbedIngredients: readonly SpikeGrabbedIngredient[],
): boolean {
  return grabbedIngredients.length > 0 && !state.submitted;
}

export function canSubmitSpikeVatBatch(
  state: SpikeVatPhaseState,
  grabbedIngredients: readonly SpikeGrabbedIngredient[],
): boolean {
  return grabbedIngredients.length > 0 && !state.submitted;
}

export function submitSpikeVatBatch(
  state: SpikeVatPhaseState,
  grabbedIngredients: readonly SpikeGrabbedIngredient[],
  scoringResult: SpikeVatScoringResult,
): SpikeVatSubmitResult {
  if (!canSubmitSpikeVatBatch(state, grabbedIngredients)) {
    return {
      state,
      accepted: false,
    };
  }

  return {
    accepted: true,
    state: {
      ...state,
      submitted: true,
      lastScoringResult: scoringResult,
    },
  };
}
