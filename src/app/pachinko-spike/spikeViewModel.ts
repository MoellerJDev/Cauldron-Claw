import { INGREDIENT_DEFS } from '../../data/ingredients';
import type { Ingredient } from '../../core/ingredients/types';
import type { RunState } from '../../core/run-state/types';
import type { SimObjectSnapshot } from '../../sim/SimObject';
import type {
  GameViewModel,
  PachinkoBoundaryViewModel,
  PachinkoCauldronContentViewModel,
  PachinkoCauldronSensorViewModel,
  PachinkoClawGrabAreaViewModel,
  PachinkoClawPositionViewModel,
  PachinkoDebugVatViewModel,
  PachinkoGrabbedContentViewModel,
  PachinkoIngredientQueueEntryViewModel,
  PachinkoIngredientViewModel,
  PachinkoPegViewModel,
  PachinkoReactionZoneViewModel,
  PachinkoVatScoringResultViewModel,
} from '../../view/GameViewModel';
import {
  INGREDIENT_COLORS,
  SPIKE_BOARD,
  SPIKE_CLAW_POSITIONS,
  SPIKE_DEBUG_VATS,
  SPIKE_DROP_LANES,
  SPIKE_DROP_START,
  getSpikeClawPosition,
  getSpikeDebugVat,
  getSpikeDropLane,
} from './spikeConfig';
import type { SpikeCauldronState } from './spikeCauldronState';
import {
  canUseSpikeClawGrab,
  type SpikeClawPhaseState,
} from './spikeClawPhaseState';
import type { SpikeDiagnostics } from './spikeDiagnostics';
import {
  canDropSelectedSpikeIngredient,
  type SpikeIngredientQueueState,
} from './spikeIngredientQueueState';
import { buildSpikeMaterialPreview } from './spikeMaterialPreview';
import { canUseSpikeDrop, type SpikeDropPhaseState } from './spikeDropPhaseState';
import {
  canSelectSpikeVat,
  canSubmitSpikeVatBatch,
  type SpikeVatPhaseState,
} from './spikeVatPhaseState';
import type { SpikeVatScoringResult } from './spikeVatScoring';

export interface SpikeViewModelInput {
  runState: RunState;
  ingredients: readonly Ingredient[];
  cauldronState: SpikeCauldronState;
  dropPhaseState: SpikeDropPhaseState;
  ingredientQueueState: SpikeIngredientQueueState;
  clawPhaseState: SpikeClawPhaseState;
  vatPhaseState: SpikeVatPhaseState;
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
      canDrop:
        canUseSpikeDrop(input.dropPhaseState) &&
        canDropSelectedSpikeIngredient(input.ingredientQueueState),
      selectedIngredientKind: input.ingredientQueueState.selectedKind,
      selectedIngredientLabel:
        input.ingredientQueueState.selectedKind === undefined
          ? undefined
          : INGREDIENT_DEFS[input.ingredientQueueState.selectedKind].label,
      ingredientQueue: input.ingredientQueueState.entries.map((entry) =>
        createIngredientQueueEntryViewModel(
          entry,
          input.ingredientQueueState.selectedKind,
        ),
      ),
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
      cauldronContents: input.cauldronState.ingredients
        .filter((entry) => !entry.extracted)
        .map(createCauldronContentViewModel),
      materialPreview: buildSpikeMaterialPreview(
        input.cauldronState.ingredients,
      ),
      claw: {
        selectedPositionId: input.clawPhaseState.selectedPositionId,
        positions: SPIKE_CLAW_POSITIONS.map((position) =>
          createClawPositionViewModel(
            position,
            input.clawPhaseState.selectedPositionId,
          ),
        ),
        grabArea: createClawGrabAreaViewModel(
          input.clawPhaseState.selectedPositionId,
        ),
        canGrab: canUseSpikeClawGrab(
          input.clawPhaseState,
          input.dropPhaseState.phase,
        ),
        grabUsed: input.clawPhaseState.grabUsed,
        grabbedContents: input.clawPhaseState.grabbedIngredients.map(
          createGrabbedContentViewModel,
        ),
        grabbedMaterialPreview: buildSpikeMaterialPreview(
          input.clawPhaseState.grabbedIngredients.map((ingredient) => ({
            kind: ingredient.kind,
            enteredCauldron: true,
          })),
        ),
      },
      vat: {
        selectedVatId: input.vatPhaseState.selectedVatId,
        selectedVatLabel: getSpikeDebugVat(input.vatPhaseState.selectedVatId)
          .label,
        vats: SPIKE_DEBUG_VATS.map((vat) =>
          createDebugVatViewModel(vat, input.vatPhaseState.selectedVatId),
        ),
        canSelect: canSelectSpikeVat(
          input.vatPhaseState,
          input.clawPhaseState.grabbedIngredients,
        ),
        canSubmit: canSubmitSpikeVatBatch(
          input.vatPhaseState,
          input.clawPhaseState.grabbedIngredients,
        ),
        submitted: input.vatPhaseState.submitted,
        lastScoringResult:
          input.vatPhaseState.lastScoringResult === undefined
            ? undefined
            : createVatScoringResultViewModel(
                input.vatPhaseState.lastScoringResult,
              ),
      },
      lastPhysicsEvent: input.diagnostics.lastPhysicsEvent,
      lastDomainEvent: input.diagnostics.lastDomainEvent,
      eventLog: input.runState.log,
    },
  };
}

function createIngredientQueueEntryViewModel(
  entry: SpikeIngredientQueueState['entries'][number],
  selectedKind: SpikeIngredientQueueState['selectedKind'],
): PachinkoIngredientQueueEntryViewModel {
  return {
    kind: entry.kind,
    label: entry.label,
    dropped: entry.dropped,
    selected: entry.kind === selectedKind,
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

function createClawPositionViewModel(
  position: (typeof SPIKE_CLAW_POSITIONS)[number],
  selectedPositionId: SpikeClawPhaseState['selectedPositionId'],
): PachinkoClawPositionViewModel {
  return {
    id: position.id,
    label: position.label,
    x: position.x,
    y: position.y,
    selected: position.id === selectedPositionId,
  };
}

function createClawGrabAreaViewModel(
  selectedPositionId: SpikeClawPhaseState['selectedPositionId'],
): PachinkoClawGrabAreaViewModel {
  const position = getSpikeClawPosition(selectedPositionId);

  return {
    x: position.x,
    y: position.y,
    width: position.grabWidth,
    height: position.grabHeight,
  };
}

function createGrabbedContentViewModel(
  entry: SpikeClawPhaseState['grabbedIngredients'][number],
): PachinkoGrabbedContentViewModel {
  return {
    ingredientId: entry.ingredientId,
    bodyId: entry.bodyId,
    kind: entry.kind,
    label: INGREDIENT_DEFS[entry.kind].label,
  };
}

function createDebugVatViewModel(
  vat: (typeof SPIKE_DEBUG_VATS)[number],
  selectedVatId: SpikeVatPhaseState['selectedVatId'],
): PachinkoDebugVatViewModel {
  return {
    ...vat,
    selected: vat.id === selectedVatId,
  };
}

function createVatScoringResultViewModel(
  result: SpikeVatScoringResult,
): PachinkoVatScoringResultViewModel {
  return {
    vatId: result.vatId,
    vatLabel: result.vatLabel,
    submittedIngredients: result.submittedIngredients.map((ingredient) => ({
      ingredientId: ingredient.ingredientId,
      kind: ingredient.kind,
      label: ingredient.label,
    })),
    gold: result.gold,
    suspicionDelta: result.suspicionDelta,
    logEntries: result.logEntries,
  };
}
