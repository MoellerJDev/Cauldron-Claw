import type { SimObjectSnapshot } from '../../sim/SimObject';
import type { SpikeCauldronState } from './spikeCauldronState';
import type { SpikeGrabbedIngredient } from './spikeClawPhaseState';

export interface SpikeClawGrabArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpikeClawExtractionInput {
  cauldronState: SpikeCauldronState;
  snapshots: readonly SimObjectSnapshot[];
  grabArea: SpikeClawGrabArea;
}

export function findSpikeClawGrabbedIngredients(
  input: SpikeClawExtractionInput,
): readonly SpikeGrabbedIngredient[] {
  const snapshotById = new Map(
    input.snapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  return input.cauldronState.ingredients.flatMap((entry) => {
    if (!entry.enteredCauldron || entry.extracted) {
      return [];
    }

    const snapshot = snapshotById.get(entry.bodyId);

    if (snapshot === undefined || snapshot.kind !== 'ingredient') {
      return [];
    }

    if (!isSnapshotInsideGrabArea(snapshot, input.grabArea)) {
      return [];
    }

    return [
      {
        ingredientId: entry.ingredientId,
        bodyId: entry.bodyId,
        kind: entry.kind,
      },
    ];
  });
}

function isSnapshotInsideGrabArea(
  snapshot: SimObjectSnapshot,
  grabArea: SpikeClawGrabArea,
): boolean {
  const left = grabArea.x - grabArea.width / 2;
  const right = grabArea.x + grabArea.width / 2;
  const top = grabArea.y - grabArea.height / 2;
  const bottom = grabArea.y + grabArea.height / 2;

  return (
    snapshot.x >= left &&
    snapshot.x <= right &&
    snapshot.y >= top &&
    snapshot.y <= bottom
  );
}
