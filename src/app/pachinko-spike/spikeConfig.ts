import { INGREDIENT_DEFS } from '../../data/ingredients';
import type { Ingredient, IngredientKind } from '../../core/ingredients/types';
import type { ReactionKind } from '../../core/reactions/types';
import type { SimObject } from '../../sim/SimObject';

export const FIRE_PEG_ID = 'fire-peg-1';
export const CAULDRON_SENSOR_ID = 'cauldron-sensor-1';

export const SPIKE_BOARD = {
  x: 48,
  y: 48,
  width: 520,
  height: 420,
  label: 'Pachinko Spike',
} as const;

export type SpikeDropLaneId = 'left' | 'center' | 'right';
export type SpikeClawPositionId = 'left' | 'center' | 'right';
export type SpikeDebugVatId = 'healing' | 'bone' | 'poison';

export interface SpikeDropLaneDefinition {
  id: SpikeDropLaneId;
  label: string;
  x: number;
  topY: number;
  bottomY: number;
  initialVelocityX: number;
}

export type SpikePegKind = 'neutral' | 'fire';

export interface SpikePegDefinition {
  id: string;
  kind: SpikePegKind;
  label: string;
  x: number;
  y: number;
  radius: number;
  reactionKind?: ReactionKind;
}

export interface SpikeClawPositionDefinition {
  id: SpikeClawPositionId;
  label: string;
  x: number;
  y: number;
  grabWidth: number;
  grabHeight: number;
}

export interface SpikeDebugVatDefinition {
  id: SpikeDebugVatId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

export const SPIKE_DROP_LANES: readonly SpikeDropLaneDefinition[] = [
  {
    id: 'left',
    label: 'Left',
    x: 230,
    topY: 58,
    bottomY: 468,
    initialVelocityX: -0.35,
  },
  {
    id: 'center',
    label: 'Center',
    x: 310,
    topY: 58,
    bottomY: 468,
    initialVelocityX: 0,
  },
  {
    id: 'right',
    label: 'Right',
    x: 390,
    topY: 58,
    bottomY: 468,
    initialVelocityX: 0.35,
  },
] as const;

export function isSpikeDropLaneId(value: string): value is SpikeDropLaneId {
  return SPIKE_DROP_LANES.some((lane) => lane.id === value);
}

export const SPIKE_CLAW_POSITIONS: readonly SpikeClawPositionDefinition[] = [
  {
    id: 'left',
    label: 'Left',
    x: 190,
    y: 414,
    grabWidth: 150,
    grabHeight: 138,
  },
  {
    id: 'center',
    label: 'Center',
    x: 310,
    y: 414,
    grabWidth: 150,
    grabHeight: 138,
  },
  {
    id: 'right',
    label: 'Right',
    x: 430,
    y: 414,
    grabWidth: 150,
    grabHeight: 138,
  },
] as const;

export function isSpikeClawPositionId(
  value: string,
): value is SpikeClawPositionId {
  return SPIKE_CLAW_POSITIONS.some((position) => position.id === value);
}

export const SPIKE_DEBUG_VATS: readonly SpikeDebugVatDefinition[] = [
  {
    id: 'healing',
    label: 'Healing Vat',
    x: 150,
    y: 520,
    width: 132,
    height: 32,
    color: 0x75b85a,
  },
  {
    id: 'bone',
    label: 'Bone Vat',
    x: 310,
    y: 520,
    width: 132,
    height: 32,
    color: 0xd8d0bd,
  },
  {
    id: 'poison',
    label: 'Poison Vat',
    x: 470,
    y: 520,
    width: 132,
    height: 32,
    color: 0xa867c8,
  },
] as const;

export function isSpikeDebugVatId(value: string): value is SpikeDebugVatId {
  return SPIKE_DEBUG_VATS.some((vat) => vat.id === value);
}

export const SPIKE_DROP_START = {
  x: 310,
  y: 74,
} as const;

export const SPIKE_PEGS: readonly SpikePegDefinition[] = [
  {
    id: 'peg-left-guide',
    kind: 'neutral',
    label: 'Peg',
    x: 250,
    y: 158,
    radius: 13,
  },
  {
    id: FIRE_PEG_ID,
    kind: 'fire',
    label: 'Fire Peg',
    x: 330,
    y: 174,
    radius: 15,
    reactionKind: 'fire',
  },
  {
    id: 'peg-right-guide',
    kind: 'neutral',
    label: 'Peg',
    x: 370,
    y: 158,
    radius: 13,
  },
  {
    id: 'peg-left-lower',
    kind: 'neutral',
    label: 'Peg',
    x: 276,
    y: 250,
    radius: 13,
  },
  {
    id: 'peg-right-lower',
    kind: 'neutral',
    label: 'Peg',
    x: 344,
    y: 250,
    radius: 13,
  },
  {
    id: 'peg-cauldron-left',
    kind: 'neutral',
    label: 'Peg',
    x: 220,
    y: 318,
    radius: 12,
  },
  {
    id: 'peg-cauldron-center',
    kind: 'neutral',
    label: 'Peg',
    x: 310,
    y: 330,
    radius: 12,
  },
  {
    id: 'peg-cauldron-right',
    kind: 'neutral',
    label: 'Peg',
    x: 400,
    y: 318,
    radius: 12,
  },
] as const;

export const SPIKE_CAULDRON_SENSOR = {
  id: CAULDRON_SENSOR_ID,
  label: 'Cauldron Sensor',
  x: 310,
  y: 378,
  width: 470,
  height: 36,
} as const;

export const INGREDIENT_COLORS: Record<IngredientKind, number> = {
  herb: 0x75b85a,
  water: 0x66a6d9,
  mushroom: 0xa867c8,
  bone: 0xd8d0bd,
  ash: 0x9a958d,
  goldNugget: 0xd6a83a,
  slime: 0x58c4a3,
  curse: 0x7b4aa0,
};

export function getSpikeDropLane(
  laneId: SpikeDropLaneId,
): SpikeDropLaneDefinition {
  const lane = SPIKE_DROP_LANES.find((candidate) => candidate.id === laneId);

  if (lane === undefined) {
    throw new Error(`Unknown spike drop lane: ${laneId}`);
  }

  return lane;
}

export function getSpikeClawPosition(
  positionId: SpikeClawPositionId,
): SpikeClawPositionDefinition {
  const position = SPIKE_CLAW_POSITIONS.find(
    (candidate) => candidate.id === positionId,
  );

  if (position === undefined) {
    throw new Error(`Unknown spike claw position: ${positionId}`);
  }

  return position;
}

export function getSpikeDebugVat(vatId: SpikeDebugVatId): SpikeDebugVatDefinition {
  const vat = SPIKE_DEBUG_VATS.find((candidate) => candidate.id === vatId);

  if (vat === undefined) {
    throw new Error(`Unknown spike debug vat: ${vatId}`);
  }

  return vat;
}

export function getSpikePegDefinition(
  pegId: string,
): SpikePegDefinition | undefined {
  return SPIKE_PEGS.find((candidate) => candidate.id === pegId);
}

export function createSpikeIngredientObject(
  ingredient: Ingredient,
  laneId: SpikeDropLaneId,
): SimObject {
  const lane = getSpikeDropLane(laneId);

  return {
    id: ingredient.id,
    kind: 'ingredient',
    x: lane.x,
    y: SPIKE_DROP_START.y,
    isStatic: false,
    label: INGREDIENT_DEFS[ingredient.kind].label,
    ingredientId: ingredient.id,
    restitution: 0.55,
    friction: 0.01,
    frictionAir: 0.006,
    density: 0.001,
    initialVelocity: {
      x: lane.initialVelocityX,
      y: 0,
    },
    shape: {
      type: 'circle',
      radius: INGREDIENT_DEFS[ingredient.kind].physical.radius,
    },
  };
}

export function createSpikeStaticObjects(): readonly SimObject[] {
  return [
    ...createSpikeBoardBoundaryObjects(),
    ...SPIKE_PEGS.map(createSpikePegObject),
    {
      id: CAULDRON_SENSOR_ID,
      kind: 'cauldron-sensor',
      x: SPIKE_CAULDRON_SENSOR.x,
      y: SPIKE_CAULDRON_SENSOR.y,
      isStatic: true,
      isSensor: true,
      label: SPIKE_CAULDRON_SENSOR.label,
      shape: {
        type: 'rectangle',
        width: SPIKE_CAULDRON_SENSOR.width,
        height: SPIKE_CAULDRON_SENSOR.height,
      },
    },
    {
      id: 'cauldron-left-wall',
      kind: 'cauldron-boundary',
      x: 78,
      y: 420,
      isStatic: true,
      label: 'Cauldron Wall',
      shape: {
        type: 'rectangle',
        width: 18,
        height: 150,
      },
    },
    {
      id: 'cauldron-right-wall',
      kind: 'cauldron-boundary',
      x: 542,
      y: 420,
      isStatic: true,
      label: 'Cauldron Wall',
      shape: {
        type: 'rectangle',
        width: 18,
        height: 150,
      },
    },
    {
      id: 'cauldron-floor',
      kind: 'cauldron-boundary',
      x: 310,
      y: 486,
      isStatic: true,
      label: 'Cauldron Floor',
      shape: {
        type: 'rectangle',
        width: 482,
        height: 18,
      },
    },
  ];
}

function createSpikeBoardBoundaryObjects(): readonly SimObject[] {
  return [
    {
      id: 'board-left-wall',
      kind: 'board-boundary',
      x: SPIKE_BOARD.x + 9,
      y: SPIKE_BOARD.y + SPIKE_BOARD.height / 2,
      isStatic: true,
      label: 'Board Wall',
      restitution: 0.45,
      friction: 0.02,
      shape: {
        type: 'rectangle',
        width: 18,
        height: SPIKE_BOARD.height,
      },
    },
    {
      id: 'board-right-wall',
      kind: 'board-boundary',
      x: SPIKE_BOARD.x + SPIKE_BOARD.width - 9,
      y: SPIKE_BOARD.y + SPIKE_BOARD.height / 2,
      isStatic: true,
      label: 'Board Wall',
      restitution: 0.45,
      friction: 0.02,
      shape: {
        type: 'rectangle',
        width: 18,
        height: SPIKE_BOARD.height,
      },
    },
  ];
}

function createSpikePegObject(peg: SpikePegDefinition): SimObject {
  const object: SimObject = {
    id: peg.id,
    kind: peg.kind === 'fire' ? 'reaction-peg' : 'peg',
    x: peg.x,
    y: peg.y,
    isStatic: true,
    label: peg.label,
    restitution: 0.65,
    friction: 0,
    shape: {
      type: 'circle',
      radius: peg.radius,
    },
  };

  if (peg.reactionKind !== undefined) {
    object.reactionKind = peg.reactionKind;
  }

  return object;
}
