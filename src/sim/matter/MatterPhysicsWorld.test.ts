import { describe, expect, it } from 'vitest';
import type { SimObject } from '../SimObject';
import { MatterPhysicsWorld } from './MatterPhysicsWorld';

describe('MatterPhysicsWorld collision event contract', () => {
  it('emits peg and reaction events when an ingredient touches a reaction peg', () => {
    const world = new MatterPhysicsWorld();

    world.addObject(createIngredientObject('spike-herb-1'));
    world.addObject({
      id: 'fire-peg-test',
      kind: 'reaction-peg',
      x: 100,
      y: 100,
      isStatic: true,
      reactionKind: 'fire',
      shape: {
        type: 'circle',
        radius: 15,
      },
    });

    const events = world.step(16);

    expect(events).toContainEqual({
      type: 'ingredient-hit-peg',
      ingredientId: 'spike-herb-1',
      pegId: 'fire-peg-test',
    });
    expect(events).toContainEqual({
      type: 'ingredient-touched-reaction',
      ingredientId: 'spike-herb-1',
      reactionObjectId: 'fire-peg-test',
      reactionKind: 'fire',
    });
  });

  it('emits only a peg event when an ingredient touches a neutral peg', () => {
    const world = new MatterPhysicsWorld();

    world.addObject(createIngredientObject('spike-herb-1'));
    world.addObject({
      id: 'neutral-peg-test',
      kind: 'peg',
      x: 100,
      y: 100,
      isStatic: true,
      shape: {
        type: 'circle',
        radius: 15,
      },
    });

    const events = world.step(16);

    expect(events).toEqual([
      {
        type: 'ingredient-hit-peg',
        ingredientId: 'spike-herb-1',
        pegId: 'neutral-peg-test',
      },
    ]);
  });

  it('emits an ingredient-entered-cauldron event when an ingredient touches a cauldron sensor', () => {
    const world = new MatterPhysicsWorld();

    world.addObject(createIngredientObject('spike-herb-1'));
    world.addObject({
      id: 'cauldron-sensor-test',
      kind: 'cauldron-sensor',
      x: 100,
      y: 100,
      isStatic: true,
      isSensor: true,
      shape: {
        type: 'rectangle',
        width: 50,
        height: 50,
      },
    });

    const events = world.step(16);

    expect(events).toContainEqual({
      type: 'ingredient-entered-cauldron',
      ingredientId: 'spike-herb-1',
    });
  });
});

function createIngredientObject(ingredientId: string): SimObject {
  return {
    id: ingredientId,
    kind: 'ingredient',
    x: 100,
    y: 100,
    isStatic: false,
    ingredientId,
    shape: {
      type: 'circle',
      radius: 12,
    },
  };
}
