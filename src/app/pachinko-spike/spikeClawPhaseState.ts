import type { IngredientId, IngredientKind } from '../../core/ingredients/types';
import {
  isSpikeClawPositionId,
  type SpikeClawPositionId,
} from './spikeConfig';
import type { SpikeSetupPhase } from './spikeDropPhaseState';

export interface SpikeGrabbedIngredient {
  ingredientId: IngredientId;
  bodyId: string;
  kind: IngredientKind;
}

export interface SpikeClawPhaseState {
  selectedPositionId: SpikeClawPositionId;
  grabUsed: boolean;
  grabbedIngredients: readonly SpikeGrabbedIngredient[];
}

export interface SpikeClawGrabResult {
  state: SpikeClawPhaseState;
  accepted: boolean;
}

export function createInitialSpikeClawPhaseState(
  selectedPositionId: SpikeClawPositionId = 'center',
): SpikeClawPhaseState {
  return {
    selectedPositionId,
    grabUsed: false,
    grabbedIngredients: [],
  };
}

export function resetSpikeClawPhaseState(): SpikeClawPhaseState {
  return createInitialSpikeClawPhaseState();
}

export function selectSpikeClawPosition(
  state: SpikeClawPhaseState,
  selectedPositionId: SpikeClawPositionId,
): SpikeClawPhaseState {
  if (!isSpikeClawPositionId(selectedPositionId)) {
    throw new Error(`Unknown spike claw position: ${String(selectedPositionId)}`);
  }

  return {
    ...state,
    selectedPositionId,
  };
}

export function canUseSpikeClawGrab(
  state: SpikeClawPhaseState,
  setupPhase: SpikeSetupPhase,
): boolean {
  return setupPhase === 'ready-for-claw' && !state.grabUsed;
}

export function useSpikeClawGrab(
  state: SpikeClawPhaseState,
  setupPhase: SpikeSetupPhase,
  grabbedIngredients: readonly SpikeGrabbedIngredient[],
): SpikeClawGrabResult {
  if (!canUseSpikeClawGrab(state, setupPhase)) {
    return {
      state,
      accepted: false,
    };
  }

  return {
    accepted: true,
    state: {
      ...state,
      grabUsed: true,
      grabbedIngredients,
    },
  };
}
