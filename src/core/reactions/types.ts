import type { Ingredient, IngredientKind } from '../ingredients/types';

export type ReactionKind = 'fire';

export interface IngredientReactionResult {
  ingredient: Ingredient;
  reactionKind: ReactionKind;
  transformed: boolean;
  fromKind: IngredientKind;
  toKind: IngredientKind;
}

