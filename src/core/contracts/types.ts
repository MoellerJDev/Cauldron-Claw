import type { IngredientFamily } from '../ingredients/types';
import type { VatId } from '../vats/types';

export type ContractId = string;

export type ContractGoal =
  | {
      type: 'earn-gold';
      goldTarget: number;
    }
  | {
      type: 'earn-vat-gold';
      vatId: VatId;
      goldTarget: number;
    }
  | {
      type: 'score-family';
      family: IngredientFamily;
      countTarget: number;
    }
  | {
      type: 'limit-suspicion';
      maxSuspicionGained: number;
    };

export interface Contract {
  id: ContractId;
  label: string;
  description: string;
  goal: ContractGoal;
  failureDebtPenalty: number;
}

export interface ContractEvaluation {
  contractId: ContractId;
  complete: boolean;
  progress: number;
  target: number;
  summary: string;
}

