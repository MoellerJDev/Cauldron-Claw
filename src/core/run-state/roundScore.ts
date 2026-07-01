import { INGREDIENT_DEFS } from '../../data/ingredients';
import type { Ingredient } from '../ingredients/types';
import type {
  RoundScore,
  RoundScoreDelta,
  VatGoldTotals,
} from './types';

export function createEmptyVatGoldTotals(): VatGoldTotals {
  return {
    healing: 0,
    poison: 0,
    bone: 0,
    trash: 0,
  };
}

export function createEmptyRoundScore(): RoundScore {
  return {
    goldEarned: 0,
    suspicionGained: 0,
    goldByVat: createEmptyVatGoldTotals(),
    ingredientCounts: {},
    familyCounts: {},
    vatsUsed: {},
  };
}

export function createRoundScoreDelta(
  ingredients: readonly Ingredient[],
  gold: number,
  suspicionDelta: number,
): RoundScoreDelta {
  const ingredientCounts: RoundScoreDelta['ingredientCounts'] = {};
  const familyCounts: RoundScoreDelta['familyCounts'] = {};

  for (const ingredient of ingredients) {
    ingredientCounts[ingredient.kind] =
      (ingredientCounts[ingredient.kind] ?? 0) + 1;

    const family = INGREDIENT_DEFS[ingredient.kind].family;
    familyCounts[family] = (familyCounts[family] ?? 0) + 1;
  }

  return {
    gold,
    suspicionDelta,
    ingredientCounts,
    familyCounts,
  };
}

export function addRoundScoreDelta(
  score: RoundScore,
  vatId: keyof VatGoldTotals,
  delta: RoundScoreDelta,
): RoundScore {
  const nextScore: RoundScore = {
    goldEarned: score.goldEarned + delta.gold,
    suspicionGained: score.suspicionGained + Math.max(0, delta.suspicionDelta),
    goldByVat: {
      ...score.goldByVat,
      [vatId]: score.goldByVat[vatId] + delta.gold,
    },
    ingredientCounts: { ...score.ingredientCounts },
    familyCounts: { ...score.familyCounts },
    vatsUsed: {
      ...score.vatsUsed,
      [vatId]: (score.vatsUsed[vatId] ?? 0) + 1,
    },
  };

  for (const [kind, count] of Object.entries(delta.ingredientCounts)) {
    const ingredientKind = kind as keyof typeof nextScore.ingredientCounts;
    nextScore.ingredientCounts[ingredientKind] =
      (nextScore.ingredientCounts[ingredientKind] ?? 0) + count;
  }

  for (const [family, count] of Object.entries(delta.familyCounts)) {
    const ingredientFamily = family as keyof typeof nextScore.familyCounts;
    nextScore.familyCounts[ingredientFamily] =
      (nextScore.familyCounts[ingredientFamily] ?? 0) + count;
  }

  return nextScore;
}

