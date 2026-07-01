import { createIngredient } from '../core/ingredients/createIngredient';
import type { Ingredient, IngredientId } from '../core/ingredients/types';
import { createInitialRunState } from '../core/run-state/createInitialRunState';
import type { RunState } from '../core/run-state/types';
import type { PhysicsEvent } from '../sim/PhysicsEvent';
import type { PhysicsWorld } from '../sim/PhysicsWorld';
import type { GameViewModel } from '../view/GameViewModel';
import { CONTRACT_DEFS } from '../data/contracts';
import { INGREDIENT_DEFS } from '../data/ingredients';
import {
  appendSpikeLog,
  createSpikeResetRunState,
  formatSpikeDropLogEntry,
} from './pachinko-spike/spikeDebugLog';
import {
  createEmptySpikeDiagnostics,
  formatSpikePhysicsEvent,
  type SpikeDiagnostics,
} from './pachinko-spike/spikeDiagnostics';
import {
  createSpikeIngredientObject,
  createSpikeStaticObjects,
  getSpikePegDefinition,
  type SpikeDropLaneId,
} from './pachinko-spike/spikeConfig';
import { resolveSpikeReaction } from './pachinko-spike/spikeReactionHandler';
import { buildSpikeViewModel } from './pachinko-spike/spikeViewModel';
import {
  clearSpikeCauldronState,
  createEmptySpikeCauldronState,
  markIngredientEnteredCauldron,
  trackDroppedIngredient,
  updateTrackedIngredientKind,
  type SpikeCauldronState,
} from './pachinko-spike/spikeCauldronState';
import {
  createInitialSpikeDropPhaseState,
  resetSpikeDropPhaseState,
  selectSpikeDropLane,
  useSpikeDrop,
  type SpikeDropPhaseState,
} from './pachinko-spike/spikeDropPhaseState';

export class PachinkoSpikeController {
  private readonly world: PhysicsWorld;
  private readonly baseRunState: RunState;
  private readonly ingredientsById = new Map<IngredientId, Ingredient>();
  private cauldronState: SpikeCauldronState = createEmptySpikeCauldronState();
  private dropPhaseState: SpikeDropPhaseState =
    createInitialSpikeDropPhaseState();
  private diagnostics: SpikeDiagnostics = createEmptySpikeDiagnostics();
  private runState: RunState;
  private readonly handledPegContacts = new Set<string>();
  private readonly handledReactionObjects = new Set<string>();

  constructor(
    world: PhysicsWorld,
    initialState = createInitialRunState(CONTRACT_DEFS.cleanStart),
  ) {
    this.world = world;
    this.baseRunState = initialState;
    this.runState = initialState;
    this.clearSpike();
  }

  step(deltaMs: number): GameViewModel {
    const physicsEvents = this.world.step(deltaMs);
    this.handlePhysicsEvents(physicsEvents);
    return this.getViewModel();
  }

  dropHerb(): GameViewModel {
    const dropResult = useSpikeDrop(this.dropPhaseState);

    if (!dropResult.accepted || dropResult.dropNumber === undefined) {
      return this.getViewModel();
    }

    this.dropPhaseState = dropResult.state;

    const ingredient = this.createFreshIngredient(dropResult.dropNumber);
    this.ingredientsById.set(ingredient.id, ingredient);
    this.cauldronState = trackDroppedIngredient(
      this.cauldronState,
      ingredient,
      ingredient.id,
    );
    this.world.addObject(
      createSpikeIngredientObject(
        ingredient,
        this.dropPhaseState.selectedLaneId,
      ),
    );
    this.runState = appendSpikeLog(
      this.runState,
      formatSpikeDropLogEntry(
        dropResult.dropNumber,
        this.dropPhaseState.selectedLaneId,
      ),
    );

    return this.getViewModel();
  }

  selectDropLane(laneId: SpikeDropLaneId): GameViewModel {
    this.dropPhaseState = selectSpikeDropLane(this.dropPhaseState, laneId);
    return this.getViewModel();
  }

  clearSpike(): GameViewModel {
    this.ingredientsById.clear();
    this.cauldronState = clearSpikeCauldronState();
    this.handledPegContacts.clear();
    this.handledReactionObjects.clear();
    this.dropPhaseState = resetSpikeDropPhaseState();
    this.diagnostics = createEmptySpikeDiagnostics();
    this.runState = createSpikeResetRunState(this.baseRunState);
    this.seedStaticWorld();

    return this.getViewModel();
  }

  getViewModel(): GameViewModel {
    return buildSpikeViewModel({
      runState: this.runState,
      ingredients: [...this.ingredientsById.values()],
      cauldronState: this.cauldronState,
      dropPhaseState: this.dropPhaseState,
      diagnostics: this.diagnostics,
      snapshots: this.world.getObjectSnapshots(),
    });
  }

  private seedStaticWorld(): void {
    this.world.reset();

    for (const object of createSpikeStaticObjects()) {
      this.world.addObject(object);
    }
  }

  private handlePhysicsEvents(events: readonly PhysicsEvent[]): void {
    for (const event of events) {
      this.diagnostics = {
        ...this.diagnostics,
        lastPhysicsEvent: formatSpikePhysicsEvent(event),
      };

      if (
        event.type === 'ingredient-hit-peg' &&
        this.ingredientsById.has(event.ingredientId)
      ) {
        this.handleIngredientHitPeg(event);
      }

      if (
        event.type === 'ingredient-touched-reaction' &&
        this.ingredientsById.has(event.ingredientId)
      ) {
        this.handleIngredientReaction(event);
      }

      if (
        event.type === 'ingredient-entered-cauldron' &&
        this.ingredientsById.has(event.ingredientId)
      ) {
        this.handleIngredientEnteredCauldron(event.ingredientId);
      }
    }
  }

  private handleIngredientHitPeg(
    event: Extract<PhysicsEvent, { type: 'ingredient-hit-peg' }>,
  ): void {
    const contactKey = `${event.ingredientId}:${event.pegId}`;

    if (this.handledPegContacts.has(contactKey)) {
      return;
    }

    const ingredient = this.ingredientsById.get(event.ingredientId);

    if (ingredient === undefined) {
      return;
    }

    this.handledPegContacts.add(contactKey);

    const peg = getSpikePegDefinition(event.pegId);
    const ingredientLabel = INGREDIENT_DEFS[ingredient.kind].label;
    const logEntry =
      peg?.kind === 'fire'
        ? `${ingredientLabel} hit Fire Peg.`
        : `${ingredientLabel} bounced off neutral peg ${event.pegId}.`;

    this.diagnostics = {
      ...this.diagnostics,
      lastDomainEvent: logEntry,
    };
    this.runState = appendSpikeLog(this.runState, logEntry);
  }

  private handleIngredientReaction(event: Extract<
    PhysicsEvent,
    { type: 'ingredient-touched-reaction' }
  >): void {
    const reactionKey = `${event.ingredientId}:${event.reactionObjectId}`;

    if (this.handledReactionObjects.has(reactionKey)) {
      return;
    }

    const ingredient = this.ingredientsById.get(event.ingredientId);

    if (ingredient === undefined) {
      return;
    }

    this.handledReactionObjects.add(reactionKey);
    const resolution = resolveSpikeReaction(ingredient, event);
    this.ingredientsById.set(resolution.ingredient.id, resolution.ingredient);
    this.cauldronState = updateTrackedIngredientKind(
      this.cauldronState,
      resolution.ingredient,
    );
    this.diagnostics = {
      ...this.diagnostics,
      lastDomainEvent: resolution.logEntry,
    };
    this.runState = appendSpikeLog(this.runState, resolution.logEntry);
  }

  private handleIngredientEnteredCauldron(ingredientId: IngredientId): void {
    const entryResult = markIngredientEnteredCauldron(
      this.cauldronState,
      ingredientId,
    );

    this.cauldronState = entryResult.state;

    if (!entryResult.enteredNow || entryResult.entry === undefined) {
      return;
    }

    const logEntry = `${INGREDIENT_DEFS[entryResult.entry.kind].label} entered the cauldron.`;

    this.diagnostics = {
      ...this.diagnostics,
      lastDomainEvent: logEntry,
    };
    this.runState = appendSpikeLog(this.runState, logEntry);
  }

  private createFreshIngredient(dropNumber: number): Ingredient {
    return createIngredient(`spike-herb-${dropNumber}`, 'herb');
  }
}
