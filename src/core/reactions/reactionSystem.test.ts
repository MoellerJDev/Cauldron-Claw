import { describe, expect, it } from 'vitest';
import { createIngredient } from '../ingredients/createIngredient';
import { applyIngredientReaction } from './reactionSystem';

describe('applyIngredientReaction', () => {
  it('transforms Herb into Ash when exposed to fire', () => {
    const herb = createIngredient('ingredient-1', 'herb');

    const result = applyIngredientReaction(herb, 'fire');

    expect(result.transformed).toBe(true);
    expect(result.ingredient).toEqual({
      id: 'ingredient-1',
      kind: 'ash',
    });
    expect(result.fromKind).toBe('herb');
    expect(result.toKind).toBe('ash');
  });

  it('leaves non-reactive ingredients unchanged for fire in the spike', () => {
    const bone = createIngredient('ingredient-2', 'bone');

    const result = applyIngredientReaction(bone, 'fire');

    expect(result.transformed).toBe(false);
    expect(result.ingredient).toBe(bone);
    expect(result.fromKind).toBe('bone');
    expect(result.toKind).toBe('bone');
  });
});

