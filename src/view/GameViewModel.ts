import type { IngredientKind } from '../core/ingredients/types';
import type { ReactionKind } from '../core/reactions/types';
import type { RunState } from '../core/run-state/types';

export type ViewDropLaneId = 'left' | 'center' | 'right';
export type ViewSetupPhase = 'drop-phase' | 'ready-for-claw';

export interface GameViewModel {
  runState: RunState;
  pachinko: PachinkoSpikeViewModel;
}

export interface PachinkoSpikeViewModel {
  board: PachinkoBoardViewModel;
  dropLanes: readonly PachinkoDropLaneViewModel[];
  selectedLaneId: ViewDropLaneId;
  setupPhase: ViewSetupPhase;
  dropsUsed: number;
  dropsRemaining: number;
  maxDrops: number;
  canDrop: boolean;
  ingredients: readonly PachinkoIngredientViewModel[];
  pegs: readonly PachinkoPegViewModel[];
  reactionZones: readonly PachinkoReactionZoneViewModel[];
  cauldronSensors: readonly PachinkoCauldronSensorViewModel[];
  cauldronBoundaries: readonly PachinkoBoundaryViewModel[];
  cauldronContents: readonly PachinkoCauldronContentViewModel[];
  lastPhysicsEvent: string | undefined;
  lastDomainEvent: string | undefined;
  eventLog: readonly string[];
}

export interface PachinkoBoardViewModel {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface PachinkoDropLaneViewModel {
  id: ViewDropLaneId;
  label: string;
  x: number;
  topY: number;
  bottomY: number;
  selected: boolean;
}

export interface PachinkoIngredientViewModel {
  id: string;
  kind: IngredientKind;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: number;
}

export interface PachinkoPegViewModel {
  id: string;
  pegKind: 'neutral' | 'fire';
  label: string;
  x: number;
  y: number;
  radius: number;
  color: number;
  strokeColor: number;
}

export interface PachinkoReactionZoneViewModel {
  id: string;
  label: string;
  reactionKind: ReactionKind;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

export interface PachinkoCauldronSensorViewModel {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PachinkoBoundaryViewModel {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PachinkoCauldronContentViewModel {
  ingredientId: string;
  bodyId: string;
  kind: IngredientKind;
  label: string;
  enteredCauldron: boolean;
}
