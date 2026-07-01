import type { IngredientId } from '../core/ingredients/types';
import type { ReactionKind } from '../core/reactions/types';

export type PhysicsEvent =
  | {
      type: 'ingredient-hit-peg';
      ingredientId: IngredientId;
      pegId: string;
    }
  | {
      type: 'ingredient-touched-reaction';
      ingredientId: IngredientId;
      reactionObjectId: string;
      reactionKind: ReactionKind;
    }
  | {
      type: 'ingredient-entered-cauldron';
      ingredientId: IngredientId;
    }
  | {
      type: 'ingredient-grabbed';
      ingredientId: IngredientId;
    }
  | {
      type: 'ingredient-released';
      ingredientId: IngredientId;
    };
