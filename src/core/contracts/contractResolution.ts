import type { RoundScore } from '../run-state/types';
import type { Contract, ContractEvaluation } from './types';

export function evaluateContract(
  contract: Contract,
  score: RoundScore,
): ContractEvaluation {
  switch (contract.goal.type) {
    case 'earn-gold':
      return {
        contractId: contract.id,
        complete: score.goldEarned >= contract.goal.goldTarget,
        progress: score.goldEarned,
        target: contract.goal.goldTarget,
        summary: `${score.goldEarned}/${contract.goal.goldTarget} gold earned`,
      };

    case 'earn-vat-gold': {
      const vatGold = score.goldByVat[contract.goal.vatId];

      return {
        contractId: contract.id,
        complete: vatGold >= contract.goal.goldTarget,
        progress: vatGold,
        target: contract.goal.goldTarget,
        summary: `${vatGold}/${contract.goal.goldTarget} gold from ${contract.goal.vatId} vat`,
      };
    }

    case 'score-family': {
      const familyCount = score.familyCounts[contract.goal.family] ?? 0;

      return {
        contractId: contract.id,
        complete: familyCount >= contract.goal.countTarget,
        progress: familyCount,
        target: contract.goal.countTarget,
        summary: `${familyCount}/${contract.goal.countTarget} ${contract.goal.family} ingredients scored`,
      };
    }

    case 'limit-suspicion':
      return {
        contractId: contract.id,
        complete: score.suspicionGained <= contract.goal.maxSuspicionGained,
        progress: score.suspicionGained,
        target: contract.goal.maxSuspicionGained,
        summary: `${score.suspicionGained}/${contract.goal.maxSuspicionGained} suspicion gained`,
      };
  }
}

