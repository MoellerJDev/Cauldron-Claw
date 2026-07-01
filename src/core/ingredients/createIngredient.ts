import type { Ingredient, IngredientId, IngredientKind } from './types';

export function createIngredient(
  id: IngredientId,
  kind: IngredientKind,
): Ingredient {
  return { id, kind };
}

