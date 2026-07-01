export type IngredientId = string;

export type IngredientKind =
  | 'herb'
  | 'water'
  | 'mushroom'
  | 'bone'
  | 'ash'
  | 'goldNugget'
  | 'slime'
  | 'curse';

export type IngredientFamily =
  | 'clean'
  | 'organic'
  | 'poison'
  | 'bone'
  | 'mineral'
  | 'slime'
  | 'curse'
  | 'waste';

export type IngredientWeight = 'light' | 'medium' | 'heavy';

export interface IngredientPhysicalProfile {
  weight: IngredientWeight;
  radius: number;
  stickiness: number;
}

export interface IngredientDefinition {
  kind: IngredientKind;
  label: string;
  family: IngredientFamily;
  baseValue: number;
  physical: IngredientPhysicalProfile;
}

export interface Ingredient {
  id: IngredientId;
  kind: IngredientKind;
}

