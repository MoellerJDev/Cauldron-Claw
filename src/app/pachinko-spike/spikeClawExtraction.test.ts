import { describe, expect, it } from 'vitest';
import type { SimObjectSnapshot } from '../../sim/SimObject';
import type { SpikeCauldronState } from './spikeCauldronState';
import { findSpikeClawGrabbedIngredients } from './spikeClawExtraction';

describe('spike claw extraction', () => {
  it('selects cauldron ingredients inside the grab area', () => {
    const grabbed = findSpikeClawGrabbedIngredients({
      cauldronState: createCauldronState([
        {
          ingredientId: 'spike-herb-1',
          bodyId: 'spike-herb-1',
          kind: 'herb',
          enteredCauldron: true,
          extracted: false,
        },
      ]),
      snapshots: [createIngredientSnapshot('spike-herb-1', 300, 430)],
      grabArea: {
        x: 310,
        y: 430,
        width: 100,
        height: 100,
      },
    });

    expect(grabbed).toEqual([
      {
        ingredientId: 'spike-herb-1',
        bodyId: 'spike-herb-1',
        kind: 'herb',
      },
    ]);
  });

  it('ignores cauldron ingredients outside the grab area', () => {
    const grabbed = findSpikeClawGrabbedIngredients({
      cauldronState: createCauldronState([
        {
          ingredientId: 'spike-bone-2',
          bodyId: 'spike-bone-2',
          kind: 'bone',
          enteredCauldron: true,
          extracted: false,
        },
      ]),
      snapshots: [createIngredientSnapshot('spike-bone-2', 500, 430)],
      grabArea: {
        x: 310,
        y: 430,
        width: 100,
        height: 100,
      },
    });

    expect(grabbed).toEqual([]);
  });

  it('ignores ingredients that have not entered or are already extracted', () => {
    const grabbed = findSpikeClawGrabbedIngredients({
      cauldronState: createCauldronState([
        {
          ingredientId: 'spike-herb-1',
          bodyId: 'spike-herb-1',
          kind: 'herb',
          enteredCauldron: false,
          extracted: false,
        },
        {
          ingredientId: 'spike-bone-2',
          bodyId: 'spike-bone-2',
          kind: 'bone',
          enteredCauldron: true,
          extracted: true,
        },
      ]),
      snapshots: [
        createIngredientSnapshot('spike-herb-1', 300, 430),
        createIngredientSnapshot('spike-bone-2', 320, 430),
      ],
      grabArea: {
        x: 310,
        y: 430,
        width: 100,
        height: 100,
      },
    });

    expect(grabbed).toEqual([]);
  });

  it('preserves current ingredient kinds for a grabbed batch', () => {
    const grabbed = findSpikeClawGrabbedIngredients({
      cauldronState: createCauldronState([
        {
          ingredientId: 'spike-herb-1',
          bodyId: 'spike-herb-1',
          kind: 'ash',
          enteredCauldron: true,
          extracted: false,
        },
        {
          ingredientId: 'spike-mushroom-3',
          bodyId: 'spike-mushroom-3',
          kind: 'mushroom',
          enteredCauldron: true,
          extracted: false,
        },
      ]),
      snapshots: [
        createIngredientSnapshot('spike-herb-1', 290, 430),
        createIngredientSnapshot('spike-mushroom-3', 330, 430),
      ],
      grabArea: {
        x: 310,
        y: 430,
        width: 100,
        height: 100,
      },
    });

    expect(grabbed).toEqual([
      {
        ingredientId: 'spike-herb-1',
        bodyId: 'spike-herb-1',
        kind: 'ash',
      },
      {
        ingredientId: 'spike-mushroom-3',
        bodyId: 'spike-mushroom-3',
        kind: 'mushroom',
      },
    ]);
  });
});

function createCauldronState(
  ingredients: SpikeCauldronState['ingredients'],
): SpikeCauldronState {
  return {
    ingredients,
  };
}

function createIngredientSnapshot(
  id: string,
  x: number,
  y: number,
): SimObjectSnapshot {
  return {
    id,
    kind: 'ingredient',
    x,
    y,
    isStatic: false,
    ingredientId: id,
    angle: 0,
    shape: {
      type: 'circle',
      radius: 12,
    },
  };
}
