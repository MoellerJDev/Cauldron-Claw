import type { PhysicsEvent } from '../../sim/PhysicsEvent';

export interface SpikeDiagnostics {
  lastPhysicsEvent?: string;
  lastDomainEvent?: string;
}

export function createEmptySpikeDiagnostics(): SpikeDiagnostics {
  return {};
}

export function formatSpikePhysicsEvent(event: PhysicsEvent): string {
  switch (event.type) {
    case 'ingredient-hit-peg':
      return `${event.ingredientId} hit peg ${event.pegId}.`;
    case 'ingredient-touched-reaction':
      return `${event.ingredientId} touched ${event.reactionKind} reaction ${event.reactionObjectId}.`;
    case 'ingredient-entered-cauldron':
      return `${event.ingredientId} entered the cauldron sensor.`;
    case 'ingredient-grabbed':
      return `${event.ingredientId} was grabbed.`;
    case 'ingredient-released':
      return `${event.ingredientId} was released.`;
  }
}
