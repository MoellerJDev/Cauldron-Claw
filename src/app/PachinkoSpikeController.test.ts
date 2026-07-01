import { describe, expect, it } from 'vitest';
import type { PhysicsEvent } from '../sim/PhysicsEvent';
import type { PhysicsWorld } from '../sim/PhysicsWorld';
import type { SimObject, SimObjectSnapshot } from '../sim/SimObject';
import { PachinkoSpikeController } from './PachinkoSpikeController';
import { FIRE_PEG_ID, getSpikeDropLane } from './pachinko-spike/spikeConfig';

class FakePhysicsWorld implements PhysicsWorld {
  resetCount = 0;
  private events: PhysicsEvent[] = [];
  private objects: SimObject[] = [];

  addObject(object: SimObject): void {
    this.objects.push(object);
  }

  removeObject(id: string): void {
    this.objects = this.objects.filter((object) => object.id !== id);
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

  setObjectPosition(id: string, x: number, y: number): void {
    this.objects = this.objects.map((object) =>
      object.id === id
        ? {
            ...object,
            x,
            y,
          }
        : object,
    );
  }
}

describe('PachinkoSpikeController', () => {
  it('does not transform Herb from neutral peg contact alone', () => {
    const world = new FakePhysicsWorld();
    const controller = new PachinkoSpikeController(world);

    controller.selectDropLane('left');
    controller.dropSelectedIngredient();
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
    expect(model.pachinko.materialPreview).toEqual({
      healing: 1,
      bone: 0,
      poison: 0,
    });
  });

  it('runs the setup queue through mixed ingredients, reactions, cauldron entry, and reset', () => {
    const world = new FakePhysicsWorld();
    const controller = new PachinkoSpikeController(world);
    const initialModel = controller.getViewModel();

    expect(initialModel.pachinko.setupPhase).toBe('drop-phase');
    expect(initialModel.pachinko.dropsRemaining).toBe(3);
    expect(initialModel.pachinko.selectedLaneId).toBe('center');
    expect(initialModel.pachinko.selectedIngredientKind).toBe('herb');
    expect(initialModel.pachinko.canDrop).toBe(true);
    expect(initialModel.pachinko.claw.selectedPositionId).toBe('center');
    expect(initialModel.pachinko.claw.canGrab).toBe(false);
    expect(initialModel.pachinko.claw.grabUsed).toBe(false);
    expect(initialModel.pachinko.claw.grabbedContents).toEqual([]);
    expect(initialModel.pachinko.vat.selectedVatId).toBe('healing');
    expect(initialModel.pachinko.vat.selectedVatLabel).toBe('Healing Vat');
    expect(initialModel.pachinko.vat.canSelect).toBe(false);
    expect(initialModel.pachinko.vat.canSubmit).toBe(false);
    expect(initialModel.pachinko.vat.submitted).toBe(false);
    expect(initialModel.pachinko.vat.lastScoringResult).toBeUndefined();
    expect(initialModel.pachinko.ingredientQueue).toEqual([
      { kind: 'herb', label: 'Herb', dropped: false, selected: true },
      { kind: 'bone', label: 'Bone', dropped: false, selected: false },
      { kind: 'mushroom', label: 'Mushroom', dropped: false, selected: false },
    ]);
    expect(initialModel.pachinko.ingredients).toEqual([]);
    expect(initialModel.pachinko.cauldronContents).toEqual([]);

    controller.selectDropLane('center');
    let droppedModel = controller.dropSelectedIngredient();
    let spawnedObject = world.getObject('spike-herb-1');

    expect(droppedModel.pachinko.selectedLaneId).toBe('center');
    expect(droppedModel.pachinko.selectedIngredientKind).toBe('bone');
    expect(droppedModel.pachinko.ingredients).toHaveLength(1);
    expect(droppedModel.pachinko.ingredients.at(-1)).toMatchObject({
      id: 'spike-herb-1',
      kind: 'herb',
    });
    expect(droppedModel.pachinko.dropsRemaining).toBe(2);
    expect(spawnedObject?.x).toBe(getSpikeDropLane('center').x);
    expect(spawnedObject?.y).toBe(74);

    world.queueEvent({
      type: 'ingredient-hit-peg',
      ingredientId: 'spike-herb-1',
      pegId: FIRE_PEG_ID,
    });
    world.queueEvent({
      type: 'ingredient-touched-reaction',
      ingredientId: 'spike-herb-1',
      reactionObjectId: FIRE_PEG_ID,
      reactionKind: 'fire',
    });
    world.queueEvent({
      type: 'ingredient-entered-cauldron',
      ingredientId: 'spike-herb-1',
    });

    let steppedModel = controller.step(16);

    expect(steppedModel.pachinko.ingredients.at(-1)?.kind).toBe('ash');
    expect(steppedModel.pachinko.cauldronContents.at(-1)).toMatchObject({
      ingredientId: 'spike-herb-1',
      kind: 'ash',
      label: 'Ash',
      enteredCauldron: true,
    });
    expect(steppedModel.pachinko.materialPreview).toEqual({
      healing: 0,
      bone: 1,
      poison: 0,
    });

    controller.selectDropLane('left');
    droppedModel = controller.dropSelectedIngredient();
    spawnedObject = world.getObject('spike-bone-2');

    expect(droppedModel.pachinko.selectedIngredientKind).toBe('mushroom');
    expect(droppedModel.pachinko.ingredients.at(-1)).toMatchObject({
      id: 'spike-bone-2',
      kind: 'bone',
    });
    expect(droppedModel.pachinko.dropsRemaining).toBe(1);
    expect(spawnedObject?.x).toBe(getSpikeDropLane('left').x);

    world.queueEvent({
      type: 'ingredient-hit-peg',
      ingredientId: 'spike-bone-2',
      pegId: 'peg-left-guide',
    });
    world.queueEvent({
      type: 'ingredient-entered-cauldron',
      ingredientId: 'spike-bone-2',
    });

    steppedModel = controller.step(16);

    expect(steppedModel.pachinko.ingredients.at(-1)?.kind).toBe('bone');
    expect(steppedModel.pachinko.cauldronContents.at(-1)).toMatchObject({
      ingredientId: 'spike-bone-2',
      kind: 'bone',
      label: 'Bone',
      enteredCauldron: true,
    });
    expect(steppedModel.pachinko.materialPreview).toEqual({
      healing: 0,
      bone: 2,
      poison: 0,
    });

    controller.selectDropLane('right');
    droppedModel = controller.dropSelectedIngredient();
    spawnedObject = world.getObject('spike-mushroom-3');

    expect(droppedModel.pachinko.selectedIngredientKind).toBeUndefined();
    expect(droppedModel.pachinko.ingredients.at(-1)).toMatchObject({
      id: 'spike-mushroom-3',
      kind: 'mushroom',
    });
    expect(droppedModel.pachinko.dropsRemaining).toBe(0);
    expect(droppedModel.pachinko.setupPhase).toBe('ready-for-claw');
    expect(spawnedObject?.x).toBe(getSpikeDropLane('right').x);

    world.queueEvent({
      type: 'ingredient-hit-peg',
      ingredientId: 'spike-mushroom-3',
      pegId: 'peg-right-guide',
    });
    world.queueEvent({
      type: 'ingredient-entered-cauldron',
      ingredientId: 'spike-mushroom-3',
    });

    steppedModel = controller.step(16);

    expect(steppedModel.pachinko.cauldronContents.at(-1)).toMatchObject({
      ingredientId: 'spike-mushroom-3',
      kind: 'mushroom',
      label: 'Mushroom',
      enteredCauldron: true,
    });
    expect(steppedModel.pachinko.materialPreview).toEqual({
      healing: 0,
      bone: 2,
      poison: 1,
    });
    expect(steppedModel.pachinko.lastPhysicsEvent).toBe(
      'spike-mushroom-3 entered the cauldron sensor.',
    );
    expect(steppedModel.pachinko.lastDomainEvent).toBe(
      'Mushroom entered the cauldron.',
    );

    const thirdDropModel = controller.getViewModel();

    expect(
      thirdDropModel.pachinko.cauldronContents.map((entry) => entry.kind),
    ).toEqual(['ash', 'bone', 'mushroom']);
    expect(thirdDropModel.pachinko.eventLog).toContain('Herb hit Fire Peg.');
    expect(thirdDropModel.pachinko.eventLog).toContain(
      'Herb touched Fire Peg and became Ash.',
    );
    expect(thirdDropModel.pachinko.eventLog).toContain(
      'Bone bounced off neutral peg peg-left-guide.',
    );
    expect(thirdDropModel.pachinko.eventLog).toContain(
      'Mushroom bounced off neutral peg peg-right-guide.',
    );
    expect(thirdDropModel.pachinko.dropsRemaining).toBe(0);
    expect(thirdDropModel.pachinko.setupPhase).toBe('ready-for-claw');
    expect(thirdDropModel.pachinko.canDrop).toBe(false);

    const fourthDrop = controller.dropSelectedIngredient();

    expect(
      fourthDrop.pachinko.ingredients.map((ingredient) => ingredient.id),
    ).toEqual(['spike-herb-1', 'spike-bone-2', 'spike-mushroom-3']);
    expect(fourthDrop.pachinko.dropsRemaining).toBe(0);
    expect(fourthDrop.pachinko.setupPhase).toBe('ready-for-claw');

    world.setObjectPosition('spike-herb-1', 310, 430);
    world.setObjectPosition('spike-bone-2', 190, 430);
    world.setObjectPosition('spike-mushroom-3', 430, 430);

    let clawModel = controller.selectClawPosition('center');

    expect(clawModel.pachinko.claw.selectedPositionId).toBe('center');
    expect(clawModel.pachinko.claw.canGrab).toBe(true);

    clawModel = controller.grabWithClaw();

    expect(clawModel.pachinko.claw.grabUsed).toBe(true);
    expect(clawModel.pachinko.claw.canGrab).toBe(false);
    expect(clawModel.pachinko.claw.grabbedContents).toEqual([
      {
        ingredientId: 'spike-herb-1',
        bodyId: 'spike-herb-1',
        kind: 'ash',
        label: 'Ash',
      },
    ]);
    expect(clawModel.pachinko.claw.grabbedMaterialPreview).toEqual({
      healing: 0,
      bone: 1,
      poison: 0,
    });
    expect(
      clawModel.pachinko.cauldronContents.map((entry) => entry.kind),
    ).toEqual(['bone', 'mushroom']);
    expect(clawModel.pachinko.materialPreview).toEqual({
      healing: 0,
      bone: 1,
      poison: 1,
    });
    expect(
      clawModel.pachinko.ingredients.map((ingredient) => ingredient.id),
    ).toEqual(['spike-bone-2', 'spike-mushroom-3']);
    expect(clawModel.pachinko.vat.canSelect).toBe(true);
    expect(clawModel.pachinko.vat.canSubmit).toBe(true);
    expect(clawModel.pachinko.vat.submitted).toBe(false);
    expect(world.getObject('spike-herb-1')).toBeUndefined();
    expect(clawModel.pachinko.eventLog).toContain('Claw grabbed Ash.');

    let vatModel = controller.selectVat('bone');

    expect(vatModel.pachinko.vat.selectedVatId).toBe('bone');
    expect(vatModel.pachinko.vat.selectedVatLabel).toBe('Bone Vat');
    expect(vatModel.pachinko.vat.canSubmit).toBe(true);

    vatModel = controller.submitGrabbedBatchToVat();

    expect(vatModel.pachinko.vat.submitted).toBe(true);
    expect(vatModel.pachinko.vat.canSelect).toBe(false);
    expect(vatModel.pachinko.vat.canSubmit).toBe(false);
    expect(vatModel.pachinko.vat.lastScoringResult).toEqual({
      vatId: 'bone',
      vatLabel: 'Bone Vat',
      submittedIngredients: [
        {
          ingredientId: 'spike-herb-1',
          kind: 'ash',
          label: 'Ash',
        },
      ],
      gold: 2,
      suspicionDelta: 0,
      logEntries: ['Ash scored 2 gold in the bone vat.'],
    });
    expect(vatModel.pachinko.lastDomainEvent).toBe(
      'Ash scored 2 gold in the bone vat.',
    );
    expect(vatModel.runState.gold).toBe(2);
    expect(vatModel.runState.suspicion).toBe(0);
    expect(vatModel.runState.round.score.goldByVat.bone).toBe(2);
    expect(vatModel.pachinko.eventLog).toContain(
      'Ash scored 2 gold in the bone vat.',
    );

    const secondSubmit = controller.submitGrabbedBatchToVat();

    expect(secondSubmit.pachinko.vat.lastScoringResult).toEqual(
      vatModel.pachinko.vat.lastScoringResult,
    );
    expect(
      secondSubmit.pachinko.eventLog.filter(
        (entry) => entry === 'Ash scored 2 gold in the bone vat.',
      ),
    ).toHaveLength(1);

    const secondGrab = controller.grabWithClaw();

    expect(secondGrab.pachinko.claw.grabbedContents).toEqual(
      clawModel.pachinko.claw.grabbedContents,
    );
    expect(
      secondGrab.pachinko.cauldronContents.map((entry) => entry.kind),
    ).toEqual(['bone', 'mushroom']);

    const clearedModel = controller.clearSpike();

    expect(clearedModel.pachinko.ingredients).toEqual([]);
    expect(clearedModel.pachinko.cauldronContents).toEqual([]);
    expect(clearedModel.pachinko.setupPhase).toBe('drop-phase');
    expect(clearedModel.pachinko.dropsRemaining).toBe(3);
    expect(clearedModel.pachinko.selectedLaneId).toBe('center');
    expect(clearedModel.pachinko.selectedIngredientKind).toBe('herb');
    expect(clearedModel.pachinko.ingredientQueue).toEqual([
      { kind: 'herb', label: 'Herb', dropped: false, selected: true },
      { kind: 'bone', label: 'Bone', dropped: false, selected: false },
      { kind: 'mushroom', label: 'Mushroom', dropped: false, selected: false },
    ]);
    expect(clearedModel.pachinko.lastPhysicsEvent).toBeUndefined();
    expect(clearedModel.pachinko.lastDomainEvent).toBeUndefined();
    expect(clearedModel.pachinko.claw.selectedPositionId).toBe('center');
    expect(clearedModel.pachinko.claw.canGrab).toBe(false);
    expect(clearedModel.pachinko.claw.grabUsed).toBe(false);
    expect(clearedModel.pachinko.claw.grabbedContents).toEqual([]);
    expect(clearedModel.pachinko.claw.grabbedMaterialPreview).toEqual({
      healing: 0,
      bone: 0,
      poison: 0,
    });
    expect(clearedModel.pachinko.vat.selectedVatId).toBe('healing');
    expect(clearedModel.pachinko.vat.canSelect).toBe(false);
    expect(clearedModel.pachinko.vat.canSubmit).toBe(false);
    expect(clearedModel.pachinko.vat.submitted).toBe(false);
    expect(clearedModel.pachinko.vat.lastScoringResult).toBeUndefined();
    expect(clearedModel.pachinko.eventLog).toEqual([
      'Run initialized.',
      'Spike reset. Cauldron cleared.',
    ]);
    expect(clearedModel.pachinko.materialPreview).toEqual({
      healing: 0,
      bone: 0,
      poison: 0,
    });
    expect(world.resetCount).toBe(2);
  });
});
