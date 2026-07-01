import type {
  Ingredient,
  IngredientId,
  IngredientKind,
} from '../../core/ingredients/types';

export interface SpikeCauldronIngredient {
  ingredientId: IngredientId;
  bodyId: string;
  kind: IngredientKind;
  enteredCauldron: boolean;
}

export interface SpikeCauldronState {
  ingredients: readonly SpikeCauldronIngredient[];
}

export interface CauldronEntryResult {
  state: SpikeCauldronState;
  entry: SpikeCauldronIngredient | undefined;
  enteredNow: boolean;
}

export function createEmptySpikeCauldronState(): SpikeCauldronState {
  return {
    ingredients: [],
  };
}

export function clearSpikeCauldronState(): SpikeCauldronState {
  return createEmptySpikeCauldronState();
}

export function trackDroppedIngredient(
  state: SpikeCauldronState,
  ingredient: Ingredient,
  bodyId: string,
): SpikeCauldronState {
  return {
    ingredients: [
      ...state.ingredients,
      {
        ingredientId: ingredient.id,
        bodyId,
        kind: ingredient.kind,
        enteredCauldron: false,
      },
    ],
  };
}

export function updateTrackedIngredientKind(
  state: SpikeCauldronState,
  ingredient: Ingredient,
): SpikeCauldronState {
  return {
    ingredients: state.ingredients.map((entry) =>
      entry.ingredientId === ingredient.id
        ? {
            ...entry,
            kind: ingredient.kind,
          }
        : entry,
    ),
  };
}

export function markIngredientEnteredCauldron(
  state: SpikeCauldronState,
  ingredientId: IngredientId,
): CauldronEntryResult {
  let entry: SpikeCauldronIngredient | undefined;
  let enteredNow = false;

  const ingredients = state.ingredients.map((candidate) => {
    if (candidate.ingredientId !== ingredientId) {
      return candidate;
    }

    if (candidate.enteredCauldron) {
      entry = candidate;
      return candidate;
    }

    enteredNow = true;
    entry = {
      ...candidate,
      enteredCauldron: true,
    };
    return entry;
  });

  return {
    state: { ingredients },
    entry,
    enteredNow,
  };
}
