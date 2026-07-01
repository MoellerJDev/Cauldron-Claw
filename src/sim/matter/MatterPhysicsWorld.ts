import Matter from 'matter-js';
import type { PhysicsEvent } from '../PhysicsEvent';
import type { PhysicsWorld } from '../PhysicsWorld';
import type { SimObject, SimObjectSnapshot } from '../SimObject';
import { MatterObjectMap } from './MatterObjectMap';

export class MatterPhysicsWorld implements PhysicsWorld {
  private engine = this.createEngine();
  private readonly objectMap = new MatterObjectMap();
  private readonly pendingEvents: PhysicsEvent[] = [];

  addObject(object: SimObject): void {
    const bodyOptions: Matter.IBodyDefinition = {
      isStatic: object.isStatic,
      isSensor: object.isSensor ?? false,
      label: object.id,
    };

    if (object.restitution !== undefined) {
      bodyOptions.restitution = object.restitution;
    }

    if (object.friction !== undefined) {
      bodyOptions.friction = object.friction;
    }

    if (object.frictionAir !== undefined) {
      bodyOptions.frictionAir = object.frictionAir;
    }

    if (object.density !== undefined) {
      bodyOptions.density = object.density;
    }

    const body =
      object.shape.type === 'circle'
        ? Matter.Bodies.circle(
            object.x,
            object.y,
            object.shape.radius,
            bodyOptions,
          )
        : Matter.Bodies.rectangle(
            object.x,
            object.y,
            object.shape.width,
            object.shape.height,
            bodyOptions,
          );

    if (object.initialVelocity !== undefined) {
      Matter.Body.setVelocity(body, object.initialVelocity);
    }

    this.objectMap.set(object.id, body, object);
    Matter.World.add(this.engine.world, body);
  }

  removeObject(id: string): void {
    const body = this.objectMap.getBody(id);

    if (body === undefined) {
      return;
    }

    Matter.World.remove(this.engine.world, body);
    this.objectMap.delete(id);
  }

  step(deltaMs: number): readonly PhysicsEvent[] {
    Matter.Engine.update(this.engine, deltaMs);
    return this.pendingEvents.splice(0);
  }

  getObjectSnapshots(): readonly SimObjectSnapshot[] {
    return this.objectMap.entries().map(({ body, object }) => ({
      ...object,
      x: body.position.x,
      y: body.position.y,
      angle: body.angle,
    }));
  }

  reset(): void {
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
    this.objectMap.clear();
    this.pendingEvents.splice(0);
    this.engine = this.createEngine();
  }

  private createEngine(): Matter.Engine {
    const engine = Matter.Engine.create();
    engine.gravity.y = 0.85;

    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        this.queueCollisionEvents(pair.bodyA, pair.bodyB);
      }
    });

    return engine;
  }

  private queueCollisionEvents(bodyA: Matter.Body, bodyB: Matter.Body): void {
    const objectA = this.objectMap.getObjectByBody(bodyA);
    const objectB = this.objectMap.getObjectByBody(bodyB);

    if (objectA === undefined || objectB === undefined) {
      return;
    }

    const ingredientObject = this.findIngredientObject(objectA, objectB);
    const otherObject =
      ingredientObject === objectA
        ? objectB
        : ingredientObject === objectB
          ? objectA
          : undefined;

    if (ingredientObject === undefined || otherObject === undefined) {
      return;
    }

    const ingredientId = ingredientObject.ingredientId ?? ingredientObject.id;

    if (otherObject.kind === 'peg' || otherObject.kind === 'reaction-peg') {
      this.pendingEvents.push({
        type: 'ingredient-hit-peg',
        ingredientId,
        pegId: otherObject.id,
      });
    }

    if (
      (otherObject.kind === 'reaction-peg' ||
        otherObject.kind === 'reaction-zone') &&
      otherObject.reactionKind !== undefined
    ) {
      this.pendingEvents.push({
        type: 'ingredient-touched-reaction',
        ingredientId,
        reactionObjectId: otherObject.id,
        reactionKind: otherObject.reactionKind,
      });
    }

    if (otherObject.kind === 'cauldron-sensor') {
      this.pendingEvents.push({
        type: 'ingredient-entered-cauldron',
        ingredientId,
      });
    }
  }

  private findIngredientObject(
    objectA: SimObject,
    objectB: SimObject,
  ): SimObject | undefined {
    if (objectA.kind === 'ingredient') {
      return objectA;
    }

    if (objectB.kind === 'ingredient') {
      return objectB;
    }

    return undefined;
  }
}
