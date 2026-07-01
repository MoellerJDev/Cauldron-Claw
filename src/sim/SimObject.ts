import type { IngredientId } from '../core/ingredients/types';
import type { ReactionKind } from '../core/reactions/types';

export type SimObjectKind =
  | 'ingredient'
  | 'peg'
  | 'reaction-peg'
  | 'reaction-zone'
  | 'board-boundary'
  | 'cauldron-boundary'
  | 'cauldron-sensor'
  | 'claw';

export type SimObjectShape =
  | {
      type: 'circle';
      radius: number;
    }
  | {
      type: 'rectangle';
      width: number;
      height: number;
    };

export interface SimObject {
  id: string;
  kind: SimObjectKind;
  x: number;
  y: number;
  isStatic: boolean;
  isSensor?: boolean;
  label?: string;
  shape: SimObjectShape;
  ingredientId?: IngredientId;
  reactionKind?: ReactionKind;
  restitution?: number;
  friction?: number;
  frictionAir?: number;
  density?: number;
  initialVelocity?: {
    x: number;
    y: number;
  };
}

export interface SimObjectSnapshot extends SimObject {
  angle: number;
}
