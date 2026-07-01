import type { IngredientKind } from '../../core/ingredients/types';

export interface SpikeMaterialPreview {
  healing: number;
  bone: number;
  poison: number;
}

export interface SpikeMaterialPreviewIngredient {
  kind: IngredientKind;
  enteredCauldron: boolean;
  extracted?: boolean;
}

export function createEmptySpikeMaterialPreview(): SpikeMaterialPreview {
  return {
    healing: 0,
    bone: 0,
    poison: 0,
  };
}

export function buildSpikeMaterialPreview(
  ingredients: readonly SpikeMaterialPreviewIngredient[],
): SpikeMaterialPreview {
  return ingredients.reduce<SpikeMaterialPreview>((preview, ingredient) => {
    if (!ingredient.enteredCauldron || ingredient.extracted === true) {
      return preview;
    }

    const material = getMaterialCategory(ingredient.kind);

    if (material === undefined) {
      return preview;
    }

    return {
      ...preview,
      [material]: preview[material] + 1,
    };
  }, createEmptySpikeMaterialPreview());
}

function getMaterialCategory(
  kind: IngredientKind,
): keyof SpikeMaterialPreview | undefined {
  switch (kind) {
    case 'herb':
      return 'healing';
    case 'ash':
    case 'bone':
      return 'bone';
    case 'mushroom':
      return 'poison';
    default:
      return undefined;
  }
}
