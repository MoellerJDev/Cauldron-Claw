import { INGREDIENT_DEFS } from '../../data/ingredients';
import type { Ingredient } from '../../core/ingredients/types';
import type { RunState } from '../../core/run-state/types';
import type { SimObjectSnapshot } from '../../sim/SimObject';
import type {
  GameViewModel,
  PachinkoBoundaryViewModel,
  PachinkoCauldronContentViewModel,
  PachinkoCauldronSensorViewModel,
  PachinkoIngredientViewModel,
  PachinkoPegViewModel,
  PachinkoReactionZoneViewModel,
} from '../../view/GameViewModel';
import {
  INGREDIENT_COLORS,
  SPIKE_BOARD,
  SPIKE_DROP_LANES,
  SPIKE_DROP_START,
  getSpikeDropLane,
} from './spikeConfig';
import type { SpikeCauldronState } from './spikeCauldronState';
import type { SpikeDiagnostics } from './spikeDiagnostics';
import { canUseSpikeDrop, type SpikeDropPhaseState } from './spikeDropPhaseState';

export interface SpikeViewModelInput {
  runState: RunState;
  ingredients: readonly Ingredient[];
  cauldronState: SpikeCauldronState;
  dropPhaseState: SpikeDropPhaseState;
  diagnostics: SpikeDiagnostics;
  snapshots: readonly SimObjectSnapshot[];
}

export function buildSpikeViewModel(input: SpikeViewModelInput): GameViewModel {
  const snapshotById = new Map(
    input.snapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  return {
    runState: input.runState,
    pachinko: {
      board: SPIKE_BOARD,
      dropLanes: SPIKE_DROP_LANES.map((lane) => ({
        ...lane,
        selected: lane.id === input.dropPhaseState.selectedLaneId,
      })),
      selectedLaneId: input.dropPhaseState.selectedLaneId,
      setupPhase: input.dropPhaseState.phase,
      dropsUsed: input.dropPhaseState.dropsUsed,
      dropsRemaining: input.dropPhaseState.dropsRemaining,
      maxDrops: input.dropPhaseState.maxDrops,
      canDrop: canUseSpikeDrop(input.dropPhaseState),
      ingredients: input.ingredients.map((ingredient) =>
        createIngredientViewModel(
          ingredient,
          snapshotById.get(ingredient.id),
          input.dropPhaseState.selectedLaneId,
        ),
      ),
      pegs: input.snapshots
        .filter(
          (snapshot) =>
            snapshot.kind === 'peg' || snapshot.kind === 'reaction-peg',
        )
        .map(createPegViewModel),
      reactionZones: input.snapshots
        .filter((snapshot) => snapshot.kind === 'reaction-zone')
        .map(createReactionZoneViewModel),
      cauldronSensors: input.snapshots
        .filter((snapshot) => snapshot.kind === 'cauldron-sensor')
        .map(createCauldronSensorViewModel),
      cauldronBoundaries: input.snapshots
        .filter((snapshot) => snapshot.kind === 'cauldron-boundary')
        .map(createBoundaryViewModel),
      cauldronContents: input.cauldronState.ingredients.map(
        createCauldronContentViewModel,
      ),
      lastPhysicsEvent: input.diagnostics.lastPhysicsEvent,
      lastDomainEvent: input.diagnostics.lastDomainEvent,
      eventLog: input.runState.log,
    },
  };
}

function createIngredientViewModel(
  ingredient: Ingredient,
  snapshot: SimObjectSnapshot | undefined,
  selectedLaneId: SpikeDropPhaseState['selectedLaneId'],
): PachinkoIngredientViewModel {
  const definition = INGREDIENT_DEFS[ingredient.kind];
  const fallbackLane = getSpikeDropLane(selectedLaneId);

  return {
    id: ingredient.id,
    kind: ingredient.kind,
    label: definition.label,
    x: snapshot?.x ?? fallbackLane.x,
    y: snapshot?.y ?? SPIKE_DROP_START.y,
    radius:
      snapshot?.shape.type === 'circle'
        ? snapshot.shape.radius
        : definition.physical.radius,
    color: INGREDIENT_COLORS[ingredient.kind],
  };
}

function createPegViewModel(
  snapshot: SimObjectSnapshot,
): PachinkoPegViewModel {
  const isFirePeg =
    snapshot.kind === 'reaction-peg' && snapshot.reactionKind === 'fire';

  return {
    id: snapshot.id,
    pegKind: isFirePeg ? 'fire' : 'neutral',
    label: snapshot.label ?? 'Peg',
    x: snapshot.x,
    y: snapshot.y,
    radius: snapshot.shape.type === 'circle' ? snapshot.shape.radius : 10,
    color: isFirePeg ? 0xd85d2a : 0xb8aa96,
    strokeColor: isFirePeg ? 0xffd0b0 : 0xf2dfbf,
  };
}

function createReactionZoneViewModel(
  snapshot: SimObjectSnapshot,
): PachinkoReactionZoneViewModel {
  if (snapshot.shape.type !== 'rectangle') {
    throw new Error(`Reaction zone must be rectangular: ${snapshot.id}`);
  }

  return {
    id: snapshot.id,
    label: snapshot.label ?? 'Reaction Zone',
    reactionKind: snapshot.reactionKind ?? 'fire',
    x: snapshot.x,
    y: snapshot.y,
    width: snapshot.shape.width,
    height: snapshot.shape.height,
    color: 0xd85d2a,
  };
}

function createCauldronSensorViewModel(
  snapshot: SimObjectSnapshot,
): PachinkoCauldronSensorViewModel {
  if (snapshot.shape.type !== 'rectangle') {
    throw new Error(`Cauldron sensor must be rectangular: ${snapshot.id}`);
  }

  return {
    id: snapshot.id,
    label: snapshot.label ?? 'Cauldron Sensor',
    x: snapshot.x,
    y: snapshot.y,
    width: snapshot.shape.width,
    height: snapshot.shape.height,
  };
}

function createBoundaryViewModel(
  snapshot: SimObjectSnapshot,
): PachinkoBoundaryViewModel {
  if (snapshot.shape.type !== 'rectangle') {
    throw new Error(`Cauldron boundary must be rectangular: ${snapshot.id}`);
  }

  return {
    id: snapshot.id,
    label: snapshot.label ?? 'Cauldron Boundary',
    x: snapshot.x,
    y: snapshot.y,
    width: snapshot.shape.width,
    height: snapshot.shape.height,
  };
}

function createCauldronContentViewModel(
  entry: SpikeCauldronState['ingredients'][number],
): PachinkoCauldronContentViewModel {
  return {
    ingredientId: entry.ingredientId,
    bodyId: entry.bodyId,
    kind: entry.kind,
    label: INGREDIENT_DEFS[entry.kind].label,
    enteredCauldron: entry.enteredCauldron,
  };
}
