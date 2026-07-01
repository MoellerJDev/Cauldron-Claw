import type { PhysicsEvent } from './PhysicsEvent';
import type { SimObject, SimObjectSnapshot } from './SimObject';

export interface PhysicsWorld {
  addObject(object: SimObject): void;
  step(deltaMs: number): readonly PhysicsEvent[];
  getObjectSnapshots(): readonly SimObjectSnapshot[];
  reset(): void;
}
