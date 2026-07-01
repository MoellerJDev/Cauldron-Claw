import { INGREDIENT_DEFS } from '../../data/ingredients';
import type { DomainEvent } from '../events/DomainEvent';
import type { Ingredient } from '../ingredients/types';
import {
  addRoundScoreDelta,
  createRoundScoreDelta,
} from '../run-state/roundScore';
import type { RunState } from '../run-state/types';
import type { VatId, VatScoreResult, VatSubmissionResult } from '../vats/types';

export function scoreVatGrab(
  vatId: VatId,
  ingredients: readonly Ingredient[],
): VatScoreResult {
  const gold = scoreGold(vatId, ingredients);
  const suspicionDelta = scoreSuspicion(vatId, ingredients);
  const contractProgress = createRoundScoreDelta(
    ingredients,
    gold,
    suspicionDelta,
  );

  return {
    vatId,
    gold,
    suspicionDelta,
    contractProgress,
    logEntries: [
      `${formatIngredientList(ingredients)} scored ${gold} gold in the ${vatId} vat.`,
    ],
  };
}

export function submitGrabToVat(
  state: RunState,
  vatId: VatId,
  ingredients: readonly Ingredient[],
): VatSubmissionResult {
  const result = scoreVatGrab(vatId, ingredients);
  const nextScore = addRoundScoreDelta(
    state.round.score,
    vatId,
    result.contractProgress,
  );
  const nextSuspicion = Math.max(0, state.suspicion + result.suspicionDelta);
  const events: DomainEvent[] = [
    {
      type: 'vat-submitted',
      vatId,
      ingredients,
    },
    {
      type: 'vat-scored',
      vatId,
      gold: result.gold,
      suspicionDelta: result.suspicionDelta,
    },
  ];

  return {
    state: {
      ...state,
      gold: state.gold + result.gold,
      suspicion: nextSuspicion,
      round: {
        ...state.round,
        score: nextScore,
      },
      log: [...state.log, ...result.logEntries],
    },
    result,
    events,
  };
}

function scoreGold(vatId: VatId, ingredients: readonly Ingredient[]): number {
  switch (vatId) {
    case 'healing':
      return scoreHealingVat(ingredients);
    case 'poison':
      return scorePoisonVat(ingredients);
    case 'bone':
      return scoreBoneVat(ingredients);
    case 'trash':
      return 0;
  }
}

function scoreSuspicion(
  vatId: VatId,
  ingredients: readonly Ingredient[],
): number {
  const curseCount = countKind(ingredients, 'curse');
  const poisonFamilyCount = ingredients.filter(
    (ingredient) => INGREDIENT_DEFS[ingredient.kind].family === 'poison',
  ).length;

  switch (vatId) {
    case 'healing':
      return curseCount;
    case 'poison':
      return curseCount + poisonFamilyCount;
    case 'bone':
      return curseCount > 0 ? 1 : 0;
    case 'trash':
      return -curseCount;
  }
}

function scoreHealingVat(ingredients: readonly Ingredient[]): number {
  const herbCount = countKind(ingredients, 'herb');
  const waterCount = countKind(ingredients, 'water');
  const goldNuggetCount = countKind(ingredients, 'goldNugget');
  const curseCount = countKind(ingredients, 'curse');
  const cleanBoost = waterCount > 0 ? herbCount : 0;

  return Math.max(
    0,
    herbCount * 3 + waterCount + goldNuggetCount * 3 + cleanBoost - curseCount * 2,
  );
}

function scorePoisonVat(ingredients: readonly Ingredient[]): number {
  return ingredients.reduce((total, ingredient) => {
    switch (ingredient.kind) {
      case 'mushroom':
        return total + 4;
      case 'curse':
        return total + 2;
      case 'ash':
        return total + 1;
      case 'goldNugget':
        return total + 3;
      case 'herb':
      case 'water':
      case 'bone':
      case 'slime':
        return total;
    }
  }, 0);
}

function scoreBoneVat(ingredients: readonly Ingredient[]): number {
  const boneCount = countKind(ingredients, 'bone');
  const ashCount = countKind(ingredients, 'ash');
  const goldNuggetCount = countKind(ingredients, 'goldNugget');
  const comboPieces = boneCount + ashCount;
  const comboBonus = comboPieces >= 2 ? comboPieces : 0;

  return boneCount * 4 + ashCount * 2 + goldNuggetCount * 3 + comboBonus;
}

function countKind(
  ingredients: readonly Ingredient[],
  kind: Ingredient['kind'],
): number {
  return ingredients.filter((ingredient) => ingredient.kind === kind).length;
}

function formatIngredientList(ingredients: readonly Ingredient[]): string {
  if (ingredients.length === 0) {
    return 'Nothing';
  }

  return ingredients
    .map((ingredient) => INGREDIENT_DEFS[ingredient.kind].label)
    .join(', ');
}
