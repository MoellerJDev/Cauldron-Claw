import type { RunState } from '../../core/run-state/types';
import type { IngredientKind } from '../../core/ingredients/types';
import { INGREDIENT_DEFS } from '../../data/ingredients';
import { getSpikeDropLane, type SpikeDropLaneId } from './spikeConfig';

export function createSpikeResetRunState(baseState: RunState): RunState {
  return {
    ...baseState,
    round: {
      ...baseState.round,
      phase: 'pachinko-resolving',
    },
    log: ['Run initialized.', 'Spike reset. Cauldron cleared.'],
  };
}

export function appendSpikeLog(state: RunState, entry: string): RunState {
  return {
    ...state,
    log: [...state.log, entry],
  };
}

export function formatSpikeDropLogEntry(
  dropNumber: number,
  laneId: SpikeDropLaneId,
  ingredientKind: IngredientKind = 'herb',
): string {
  return `Drop ${dropNumber}: ${INGREDIENT_DEFS[ingredientKind].label} dropped from ${
    getSpikeDropLane(laneId).label
  } lane.`;
}

export function formatSpikeClawGrabLogEntry(
  grabbedIngredients: readonly { kind: IngredientKind }[],
): string {
  if (grabbedIngredients.length === 0) {
    return 'Claw grabbed nothing.';
  }

  const labels = grabbedIngredients.map(
    (ingredient) => INGREDIENT_DEFS[ingredient.kind].label,
  );

  return `Claw grabbed ${labels.join(', ')}.`;
}
