import type { PhysicsEvent } from './PhysicsEvent';
import type { SimObject, SimObjectSnapshot } from './SimObject';

export interface PhysicsWorld {
  addObject(object: SimObject): void;
  removeObject(id: string): void;
  step(deltaMs: number): readonly PhysicsEvent[];
  getObjectSnapshots(): readonly SimObjectSnapshot[];
  reset(): void;
}
