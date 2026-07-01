import type { IngredientId, IngredientKind } from '../../core/ingredients/types';
import { INGREDIENT_DEFS } from '../../data/ingredients';
import { getSpikeDebugVat, type SpikeDebugVatId } from './spikeConfig';

export interface SpikeVatScoringIngredient {
  ingredientId: IngredientId;
  kind: IngredientKind;
}

export interface SpikeVatIngredientScore {
  ingredientId: IngredientId;
  kind: IngredientKind;
  label: string;
  value: number;
}

export interface SpikeVatScoringResult {
  vatId: SpikeDebugVatId;
  vatLabel: string;
  ingredientScores: readonly SpikeVatIngredientScore[];
  total: number;
}

export function scoreSpikeVatBatch(
  vatId: SpikeDebugVatId,
  ingredients: readonly SpikeVatScoringIngredient[],
): SpikeVatScoringResult {
  const vat = getSpikeDebugVat(vatId);
  const ingredientScores = ingredients.map((ingredient) => ({
    ingredientId: ingredient.ingredientId,
    kind: ingredient.kind,
    label: INGREDIENT_DEFS[ingredient.kind].label,
    value: scoreSpikeVatIngredient(vatId, ingredient.kind),
  }));

  return {
    vatId,
    vatLabel: vat.label,
    ingredientScores,
    total: ingredientScores.reduce((sum, score) => sum + score.value, 0),
  };
}

function scoreSpikeVatIngredient(
  vatId: SpikeDebugVatId,
  kind: IngredientKind,
): number {
  switch (vatId) {
    case 'healing':
      return kind === 'herb' ? 3 : 0;
    case 'bone':
      if (kind === 'ash') {
        return 2;
      }

      return kind === 'bone' ? 3 : 0;
    case 'poison':
      return kind === 'mushroom' ? 4 : 0;
  }
}
