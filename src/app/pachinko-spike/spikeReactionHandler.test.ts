import { describe, expect, it } from 'vitest';
import { createIngredient } from '../../core/ingredients/createIngredient';
import { FIRE_PEG_ID } from './spikeConfig';
import { resolveSpikeReaction } from './spikeReactionHandler';

describe('resolveSpikeReaction', () => {
  it('transforms Herb into Ash when Herb touches the Fire Peg', () => {
    const herb = createIngredient('spike-herb-1', 'herb');

    const result = resolveSpikeReaction(herb, {
      type: 'ingredient-touched-reaction',
      ingredientId: herb.id,
      reactionObjectId: FIRE_PEG_ID,
      reactionKind: 'fire',
    });

    expect(result.transformed).toBe(true);
    expect(result.ingredient).toEqual({
      id: 'spike-herb-1',
      kind: 'ash',
    });
    expect(result.logEntry).toBe('Herb touched Fire Peg and became Ash.');
  });
});
