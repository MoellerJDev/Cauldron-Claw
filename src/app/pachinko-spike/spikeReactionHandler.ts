import { INGREDIENT_DEFS } from '../../data/ingredients';
import type { Ingredient } from '../../core/ingredients/types';
import { applyIngredientReaction } from '../../core/reactions/reactionSystem';
import type { PhysicsEvent } from '../../sim/PhysicsEvent';

type ReactionTouchEvent = Extract<
  PhysicsEvent,
  { type: 'ingredient-touched-reaction' }
>;

export interface SpikeReactionResolution {
  ingredient: Ingredient;
  logEntry: string;
  transformed: boolean;
}

export function resolveSpikeReaction(
  ingredient: Ingredient,
  event: ReactionTouchEvent,
): SpikeReactionResolution {
  const reaction = applyIngredientReaction(ingredient, event.reactionKind);
  const fromLabel = INGREDIENT_DEFS[reaction.fromKind].label;

  if (!reaction.transformed) {
    return {
      ingredient,
      logEntry: `${fromLabel} touched Fire Peg with no transformation.`,
      transformed: false,
    };
  }

  const toLabel = INGREDIENT_DEFS[reaction.toKind].label;

  return {
    ingredient: reaction.ingredient,
    logEntry: `${fromLabel} touched Fire Peg and became ${toLabel}.`,
    transformed: true,
  };
}
