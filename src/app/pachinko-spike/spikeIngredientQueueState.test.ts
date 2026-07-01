import { describe, expect, it } from 'vitest';
import {
  createInitialSpikeIngredientQueueState,
  dropSelectedSpikeIngredient,
  resetSpikeIngredientQueueState,
  selectSpikeQueuedIngredient,
} from './spikeIngredientQueueState';

describe('spike ingredient queue state', () => {
  it('starts with Herb, Bone, and Mushroom with Herb selected', () => {
    const state = createInitialSpikeIngredientQueueState();

    expect(state.selectedKind).toBe('herb');
    expect(state.entries).toEqual([
      { kind: 'herb', label: 'Herb', dropped: false },
      { kind: 'bone', label: 'Bone', dropped: false },
      { kind: 'mushroom', label: 'Mushroom', dropped: false },
    ]);
  });

  it('selects an available ingredient', () => {
    const state = selectSpikeQueuedIngredient(
      createInitialSpikeIngredientQueueState(),
      'bone',
    );

    expect(state.selectedKind).toBe('bone');
    expect(state.entries.every((entry) => !entry.dropped)).toBe(true);
  });

  it('dropping an ingredient marks it used and advances selection', () => {
    const selected = selectSpikeQueuedIngredient(
      createInitialSpikeIngredientQueueState(),
      'bone',
    );

    const result = dropSelectedSpikeIngredient(selected);

    expect(result.accepted).toBe(true);
    expect(result.ingredientKind).toBe('bone');
    expect(result.state.entries).toContainEqual({
      kind: 'bone',
      label: 'Bone',
      dropped: true,
    });
    expect(result.state.selectedKind).toBe('herb');
  });

  it('does not allow a used ingredient to be selected or dropped again', () => {
    const selected = selectSpikeQueuedIngredient(
      createInitialSpikeIngredientQueueState(),
      'mushroom',
    );
    const dropped = dropSelectedSpikeIngredient(selected);

    expect(() =>
      selectSpikeQueuedIngredient(dropped.state, 'mushroom'),
    ).toThrow('Cannot select already dropped ingredient: mushroom');

    const blocked = dropSelectedSpikeIngredient({
      ...dropped.state,
      selectedKind: 'mushroom',
    });

    expect(blocked.accepted).toBe(false);
    expect(blocked.state.entries).toBe(dropped.state.entries);
  });

  it('has no selected ingredient after all three drops are used', () => {
    const first = dropSelectedSpikeIngredient(
      createInitialSpikeIngredientQueueState(),
    );
    const second = dropSelectedSpikeIngredient(first.state);
    const third = dropSelectedSpikeIngredient(second.state);

    expect(first.ingredientKind).toBe('herb');
    expect(second.ingredientKind).toBe('bone');
    expect(third.ingredientKind).toBe('mushroom');
    expect(third.state.selectedKind).toBeUndefined();
    expect(third.state.entries.every((entry) => entry.dropped)).toBe(true);
  });

  it('resets to the initial queue', () => {
    const dropped = dropSelectedSpikeIngredient(
      createInitialSpikeIngredientQueueState(),
    );

    expect(dropped.state.entries[0]?.dropped).toBe(true);
    expect(resetSpikeIngredientQueueState()).toEqual(
      createInitialSpikeIngredientQueueState(),
    );
  });
});
