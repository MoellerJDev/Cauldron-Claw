import type {
  IngredientDefinition,
  IngredientKind,
} from '../core/ingredients/types';

export const INGREDIENT_DEFS = {
  herb: {
    kind: 'herb',
    label: 'Herb',
    family: 'clean',
    baseValue: 2,
    physical: { weight: 'light', radius: 12, stickiness: 0 },
  },
  water: {
    kind: 'water',
    label: 'Water',
    family: 'clean',
    baseValue: 1,
    physical: { weight: 'light', radius: 11, stickiness: 0.1 },
  },
  mushroom: {
    kind: 'mushroom',
    label: 'Mushroom',
    family: 'poison',
    baseValue: 3,
    physical: { weight: 'medium', radius: 13, stickiness: 0.15 },
  },
  bone: {
    kind: 'bone',
    label: 'Bone',
    family: 'bone',
    baseValue: 3,
    physical: { weight: 'heavy', radius: 13, stickiness: 0 },
  },
  ash: {
    kind: 'ash',
    label: 'Ash',
    family: 'waste',
    baseValue: 1,
    physical: { weight: 'light', radius: 10, stickiness: 0.05 },
  },
  goldNugget: {
    kind: 'goldNugget',
    label: 'Gold Nugget',
    family: 'mineral',
    baseValue: 4,
    physical: { weight: 'heavy', radius: 11, stickiness: 0 },
  },
  slime: {
    kind: 'slime',
    label: 'Slime',
    family: 'slime',
    baseValue: 1,
    physical: { weight: 'medium', radius: 14, stickiness: 0.8 },
  },
  curse: {
    kind: 'curse',
    label: 'Curse',
    family: 'curse',
    baseValue: -2,
    physical: { weight: 'medium', radius: 12, stickiness: 0.25 },
  },
} satisfies Record<IngredientKind, IngredientDefinition>;

