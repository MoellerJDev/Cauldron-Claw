import type { ContractId } from '../contracts/types';
import type { Ingredient, IngredientKind } from '../ingredients/types';
import type { ReactionKind } from '../reactions/types';
import type { UpgradeId } from '../upgrades/types';
import type { VatId } from '../vats/types';

export type DomainEvent =
  | {
      type: 'vat-submitted';
      vatId: VatId;
      ingredients: readonly Ingredient[];
    }
  | {
      type: 'vat-scored';
      vatId: VatId;
      gold: number;
      suspicionDelta: number;
    }
  | {
      type: 'contract-evaluated';
      contractId: ContractId;
      complete: boolean;
    }
  | {
      type: 'ingredient-transformed';
      ingredientId: string;
      reactionKind: ReactionKind;
      fromKind: IngredientKind;
      toKind: IngredientKind;
    }
  | {
      type: 'upgrade-applied';
      upgradeId: UpgradeId;
    };
