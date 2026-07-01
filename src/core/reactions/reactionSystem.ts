import type { Ingredient, IngredientKind } from '../ingredients/types';
import type { IngredientReactionResult, ReactionKind } from './types';

export function applyIngredientReaction(
  ingredient: Ingredient,
  reactionKind: ReactionKind,
): IngredientReactionResult {
  const toKind = getReactionOutputKind(ingredient.kind, reactionKind);

  if (toKind === ingredient.kind) {
    return {
      ingredient,
      reactionKind,
      transformed: false,
      fromKind: ingredient.kind,
      toKind,
    };
  }

  return {
    ingredient: {
      ...ingredient,
      kind: toKind,
    },
    reactionKind,
    transformed: true,
    fromKind: ingredient.kind,
    toKind,
  };
}

function getReactionOutputKind(
  ingredientKind: IngredientKind,
  reactionKind: ReactionKind,
): IngredientKind {
  if (reactionKind === 'fire' && ingredientKind === 'herb') {
    return 'ash';
  }

  return ingredientKind;
}

