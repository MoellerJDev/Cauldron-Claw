import { describe, expect, it } from 'vitest';
import { createIngredient } from '../../core/ingredients/createIngredient';
import {
  clearSpikeCauldronState,
  createEmptySpikeCauldronState,
  markIngredientEnteredCauldron,
  trackDroppedIngredient,
  updateTrackedIngredientKind,
} from './spikeCauldronState';

describe('spike cauldron state', () => {
  it('records cauldron entry only once for the same ingredient', () => {
    const herb = createIngredient('spike-herb-1', 'herb');
    const tracked = trackDroppedIngredient(
      createEmptySpikeCauldronState(),
      herb,
      'spike-herb-1',
    );

    const firstEntry = markIngredientEnteredCauldron(tracked, herb.id);
    const duplicateEntry = markIngredientEnteredCauldron(
      firstEntry.state,
      herb.id,
    );

    expect(firstEntry.enteredNow).toBe(true);
    expect(duplicateEntry.enteredNow).toBe(false);
    expect(duplicateEntry.state.ingredients).toHaveLength(1);
    expect(duplicateEntry.state.ingredients[0]?.enteredCauldron).toBe(true);
  });

  it('records a transformed ingredient with its current kind', () => {
    const herb = createIngredient('spike-herb-1', 'herb');
    const ash = createIngredient('spike-herb-1', 'ash');
    const tracked = trackDroppedIngredient(
      createEmptySpikeCauldronState(),
      herb,
      'spike-herb-1',
    );
    const transformed = updateTrackedIngredientKind(tracked, ash);

    const entryResult = markIngredientEnteredCauldron(
      transformed,
      'spike-herb-1',
    );

    expect(entryResult.entry).toEqual({
      ingredientId: 'spike-herb-1',
      bodyId: 'spike-herb-1',
      kind: 'ash',
      enteredCauldron: true,
    });
  });

  it('clears tracked cauldron contents', () => {
    const herb = createIngredient('spike-herb-1', 'herb');
    const tracked = trackDroppedIngredient(
      createEmptySpikeCauldronState(),
      herb,
      'spike-herb-1',
    );

    expect(tracked.ingredients).toHaveLength(1);
    expect(clearSpikeCauldronState().ingredients).toEqual([]);
  });

  it('tracks multiple ingredients independently', () => {
    const herbOne = createIngredient('spike-herb-1', 'herb');
    const herbTwo = createIngredient('spike-herb-2', 'herb');
    const ashTwo = createIngredient('spike-herb-2', 'ash');
    const withFirst = trackDroppedIngredient(
      createEmptySpikeCauldronState(),
      herbOne,
      'spike-herb-1',
    );
    const withSecond = trackDroppedIngredient(
      withFirst,
      herbTwo,
      'spike-herb-2',
    );
    const transformedSecond = updateTrackedIngredientKind(withSecond, ashTwo);

    const firstEntered = markIngredientEnteredCauldron(
      transformedSecond,
      herbOne.id,
    );
    const secondEntered = markIngredientEnteredCauldron(
      firstEntered.state,
      herbTwo.id,
    );

    expect(secondEntered.state.ingredients).toEqual([
      {
        ingredientId: 'spike-herb-1',
        bodyId: 'spike-herb-1',
        kind: 'herb',
        enteredCauldron: true,
      },
      {
        ingredientId: 'spike-herb-2',
        bodyId: 'spike-herb-2',
        kind: 'ash',
        enteredCauldron: true,
      },
    ]);
  });
});
