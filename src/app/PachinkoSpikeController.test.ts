import { describe, expect, it } from 'vitest';
import type { PhysicsEvent } from '../sim/PhysicsEvent';
import type { PhysicsWorld } from '../sim/PhysicsWorld';
import type { SimObject, SimObjectSnapshot } from '../sim/SimObject';
import { PachinkoSpikeController } from './PachinkoSpikeController';
import {
  FIRE_PEG_ID,
  getSpikeDropLane,
  type SpikeDropLaneId,
} from './pachinko-spike/spikeConfig';

class FakePhysicsWorld implements PhysicsWorld {
  resetCount = 0;
  private events: PhysicsEvent[] = [];
  private objects: SimObject[] = [];

  addObject(object: SimObject): void {
    this.objects.push(object);
  }

  step(_deltaMs: number): readonly PhysicsEvent[] {
    return this.events.splice(0);
  }

  getObjectSnapshots(): readonly SimObjectSnapshot[] {
    return this.objects.map((object) => ({
      ...object,
      angle: 0,
    }));
  }

  reset(): void {
    this.resetCount += 1;
    this.events = [];
    this.objects = [];
  }

  queueEvent(event: PhysicsEvent): void {
    this.events.push(event);
  }

  getObject(id: string): SimObject | undefined {
    return this.objects.find((object) => object.id === id);
  }
}

describe('PachinkoSpikeController', () => {
  it('does not transform Herb from neutral peg contact alone', () => {
    const world = new FakePhysicsWorld();
    const controller = new PachinkoSpikeController(world);

    controller.selectDropLane('left');
    controller.dropHerb();
    world.queueEvent({
      type: 'ingredient-hit-peg',
      ingredientId: 'spike-herb-1',
      pegId: 'peg-left-guide',
    });
    world.queueEvent({
      type: 'ingredient-entered-cauldron',
      ingredientId: 'spike-herb-1',
    });

    const model = controller.step(16);

    expect(model.pachinko.ingredients[0]?.kind).toBe('herb');
    expect(model.pachinko.cauldronContents).toContainEqual({
      ingredientId: 'spike-herb-1',
      bodyId: 'spike-herb-1',
      kind: 'herb',
      label: 'Herb',
      enteredCauldron: true,
    });
    expect(model.pachinko.eventLog).toContain(
      'Herb bounced off neutral peg peg-left-guide.',
    );
    expect(model.pachinko.eventLog).not.toContain(
      'Herb touched Fire Peg and became Ash.',
    );
  });

  it('runs the full setup flow through lane drops, reactions, cauldron entry, and reset', () => {
    const world = new FakePhysicsWorld();
    const controller = new PachinkoSpikeController(world);
    const initialModel = controller.getViewModel();

    expect(initialModel.pachinko.setupPhase).toBe('drop-phase');
    expect(initialModel.pachinko.dropsRemaining).toBe(3);
    expect(initialModel.pachinko.selectedLaneId).toBe('center');
    expect(initialModel.pachinko.canDrop).toBe(true);
    expect(initialModel.pachinko.ingredients).toEqual([]);
    expect(initialModel.pachinko.cauldronContents).toEqual([]);

    const dropLanes = ['left', 'center', 'right'] satisfies readonly SpikeDropLaneId[];

    for (const laneId of dropLanes) {
      expect(controller.selectDropLane(laneId).pachinko.selectedLaneId).toBe(
        laneId,
      );
    }

    for (const [index, laneId] of dropLanes.entries()) {
      const dropNumber = index + 1;
      const ingredientId = `spike-herb-${dropNumber}`;

      controller.selectDropLane(laneId);
      const droppedModel = controller.dropHerb();
      const spawnedObject = world.getObject(ingredientId);

      expect(droppedModel.pachinko.selectedLaneId).toBe(laneId);
      expect(droppedModel.pachinko.ingredients).toHaveLength(dropNumber);
      expect(droppedModel.pachinko.ingredients.at(-1)).toMatchObject({
        id: ingredientId,
        kind: 'herb',
      });
      expect(droppedModel.pachinko.dropsRemaining).toBe(3 - dropNumber);
      expect(spawnedObject?.x).toBe(getSpikeDropLane(laneId).x);
      expect(spawnedObject?.y).toBe(74);

      if (laneId === 'center') {
        world.queueEvent({
          type: 'ingredient-hit-peg',
          ingredientId,
          pegId: FIRE_PEG_ID,
        });
        world.queueEvent({
          type: 'ingredient-touched-reaction',
          ingredientId,
          reactionObjectId: FIRE_PEG_ID,
          reactionKind: 'fire',
        });
      } else {
        world.queueEvent({
          type: 'ingredient-hit-peg',
          ingredientId,
          pegId:
            laneId === 'left' ? 'peg-left-guide' : 'peg-right-guide',
        });
      }

      world.queueEvent({
        type: 'ingredient-entered-cauldron',
        ingredientId,
      });

      const steppedModel = controller.step(16);
      const expectedKind = laneId === 'center' ? 'ash' : 'herb';
      const expectedLabel = laneId === 'center' ? 'Ash' : 'Herb';

      expect(steppedModel.pachinko.ingredients.at(-1)?.kind).toBe(
        expectedKind,
      );
      expect(steppedModel.pachinko.cauldronContents.at(-1)).toMatchObject({
        ingredientId,
        kind: expectedKind,
        label: expectedLabel,
        enteredCauldron: true,
      });
      expect(
        steppedModel.pachinko.cauldronContents.filter(
          (entry) => entry.enteredCauldron,
        ),
      ).toHaveLength(dropNumber);
      expect(steppedModel.pachinko.lastPhysicsEvent).toBe(
        `${ingredientId} entered the cauldron sensor.`,
      );
      expect(steppedModel.pachinko.lastDomainEvent).toBe(
        `${expectedLabel} entered the cauldron.`,
      );
    }

    const thirdDropModel = controller.getViewModel();

    expect(
      thirdDropModel.pachinko.cauldronContents.map((entry) => entry.kind),
    ).toEqual(['herb', 'ash', 'herb']);
    expect(thirdDropModel.pachinko.eventLog).toContain(
      'Herb bounced off neutral peg peg-left-guide.',
    );
    expect(thirdDropModel.pachinko.eventLog).toContain('Herb hit Fire Peg.');
    expect(thirdDropModel.pachinko.eventLog).toContain(
      'Herb touched Fire Peg and became Ash.',
    );
    expect(thirdDropModel.pachinko.eventLog).toContain(
      'Herb bounced off neutral peg peg-right-guide.',
    );
    expect(thirdDropModel.pachinko.dropsRemaining).toBe(0);
    expect(thirdDropModel.pachinko.setupPhase).toBe('ready-for-claw');
    expect(thirdDropModel.pachinko.canDrop).toBe(false);

    const fourthDrop = controller.dropHerb();

    expect(fourthDrop.pachinko.ingredients.map((ingredient) => ingredient.id)).toEqual([
      'spike-herb-1',
      'spike-herb-2',
      'spike-herb-3',
    ]);
    expect(fourthDrop.pachinko.dropsRemaining).toBe(0);
    expect(fourthDrop.pachinko.setupPhase).toBe('ready-for-claw');

    const clearedModel = controller.clearSpike();

    expect(clearedModel.pachinko.ingredients).toEqual([]);
    expect(clearedModel.pachinko.cauldronContents).toEqual([]);
    expect(clearedModel.pachinko.setupPhase).toBe('drop-phase');
    expect(clearedModel.pachinko.dropsRemaining).toBe(3);
    expect(clearedModel.pachinko.selectedLaneId).toBe('center');
    expect(clearedModel.pachinko.lastPhysicsEvent).toBeUndefined();
    expect(clearedModel.pachinko.lastDomainEvent).toBeUndefined();
    expect(clearedModel.pachinko.eventLog).toEqual([
      'Run initialized.',
      'Spike reset. Cauldron cleared.',
    ]);
    expect(world.resetCount).toBe(2);
  });
});
