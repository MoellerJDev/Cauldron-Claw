import { getSpikeDebugVat, type SpikeDebugVatId } from './spikeConfig';
import type { IngredientId, IngredientKind } from '../../core/ingredients/types';
import { INGREDIENT_DEFS } from '../../data/ingredients';
import { createIngredient } from '../../core/ingredients/createIngredient';
import type { RunState } from '../../core/run-state/types';
import { submitGrabToVat } from '../../core/scoring/vatScoring';

export interface SpikeVatScoringIngredient {
  ingredientId: IngredientId;
  kind: IngredientKind;
}

export interface SpikeVatSubmittedIngredient {
  ingredientId: IngredientId;
  kind: IngredientKind;
  label: string;
}

export interface SpikeVatScoringResult {
  vatId: SpikeDebugVatId;
  vatLabel: string;
  submittedIngredients: readonly SpikeVatSubmittedIngredient[];
  gold: number;
  suspicionDelta: number;
  logEntries: readonly string[];
}

export interface SpikeVatCoreSubmission {
  state: RunState;
  result: SpikeVatScoringResult;
}

export function submitSpikeVatBatchToCore(
  state: RunState,
  vatId: SpikeDebugVatId,
  ingredients: readonly SpikeVatScoringIngredient[],
): SpikeVatCoreSubmission {
  const coreIngredients = ingredients.map((ingredient) =>
    createIngredient(ingredient.ingredientId, ingredient.kind),
  );
  const submission = submitGrabToVat(state, vatId, coreIngredients);
  const vat = getSpikeDebugVat(vatId);

  return {
    state: submission.state,
    result: {
      vatId,
      vatLabel: vat.label,
      submittedIngredients: ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        kind: ingredient.kind,
        label: INGREDIENT_DEFS[ingredient.kind].label,
      })),
      gold: submission.result.gold,
      suspicionDelta: submission.result.suspicionDelta,
      logEntries: submission.result.logEntries,
    },
  };
}
