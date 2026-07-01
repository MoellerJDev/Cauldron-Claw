import { INGREDIENT_DEFS } from '../../data/ingredients';
import type { IngredientKind } from '../../core/ingredients/types';

export type SpikeQueuedIngredientKind = Extract<
  IngredientKind,
  'herb' | 'bone' | 'mushroom'
>;

export interface SpikeIngredientQueueEntry {
  kind: SpikeQueuedIngredientKind;
  label: string;
  dropped: boolean;
}

export interface SpikeIngredientQueueState {
  entries: readonly SpikeIngredientQueueEntry[];
  selectedKind: SpikeQueuedIngredientKind | undefined;
}

export interface SpikeIngredientQueueDropResult {
  state: SpikeIngredientQueueState;
  accepted: boolean;
  ingredientKind?: SpikeQueuedIngredientKind;
}

export const SPIKE_INITIAL_INGREDIENT_QUEUE: readonly SpikeQueuedIngredientKind[] =
  ['herb', 'bone', 'mushroom'];

export function createInitialSpikeIngredientQueueState(): SpikeIngredientQueueState {
  return {
    entries: SPIKE_INITIAL_INGREDIENT_QUEUE.map((kind) => ({
      kind,
      label: INGREDIENT_DEFS[kind].label,
      dropped: false,
    })),
    selectedKind: 'herb',
  };
}

export function resetSpikeIngredientQueueState(): SpikeIngredientQueueState {
  return createInitialSpikeIngredientQueueState();
}

export function isSpikeQueuedIngredientKind(
  value: string,
): value is SpikeQueuedIngredientKind {
  return SPIKE_INITIAL_INGREDIENT_QUEUE.includes(
    value as SpikeQueuedIngredientKind,
  );
}

export function selectSpikeQueuedIngredient(
  state: SpikeIngredientQueueState,
  kind: SpikeQueuedIngredientKind,
): SpikeIngredientQueueState {
  const entry = findQueueEntry(state, kind);

  if (entry === undefined) {
    throw new Error(`Unknown spike ingredient queue entry: ${String(kind)}`);
  }

  if (entry.dropped) {
    throw new Error(`Cannot select already dropped ingredient: ${kind}`);
  }

  return {
    ...state,
    selectedKind: kind,
  };
}

export function canDropSelectedSpikeIngredient(
  state: SpikeIngredientQueueState,
): boolean {
  if (state.selectedKind === undefined) {
    return false;
  }

  return findQueueEntry(state, state.selectedKind)?.dropped === false;
}

export function dropSelectedSpikeIngredient(
  state: SpikeIngredientQueueState,
): SpikeIngredientQueueDropResult {
  if (
    state.selectedKind === undefined ||
    !canDropSelectedSpikeIngredient(state)
  ) {
    return {
      state,
      accepted: false,
    };
  }

  const ingredientKind = state.selectedKind;
  const entries = state.entries.map((entry) =>
    entry.kind === ingredientKind
      ? {
          ...entry,
          dropped: true,
        }
      : entry,
  );

  return {
    accepted: true,
    ingredientKind,
    state: {
      entries,
      selectedKind: entries.find((entry) => !entry.dropped)?.kind,
    },
  };
}

function findQueueEntry(
  state: SpikeIngredientQueueState,
  kind: SpikeQueuedIngredientKind,
): SpikeIngredientQueueEntry | undefined {
  return state.entries.find((entry) => entry.kind === kind);
}
