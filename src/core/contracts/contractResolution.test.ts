import { describe, expect, it } from 'vitest';
import { evaluateContract } from './contractResolution';
import type { Contract } from './types';
import { createEmptyRoundScore } from '../run-state/roundScore';

describe('evaluateContract', () => {
  it('completes an earned-gold contract when the score reaches the target', () => {
    const contract: Contract = {
      id: 'test-earn-5',
      label: 'Earn 5 gold',
      description: 'Make a modest payment.',
      goal: { type: 'earn-gold', goldTarget: 5 },
      failureDebtPenalty: 2,
    };
    const score = {
      ...createEmptyRoundScore(),
      goldEarned: 5,
    };

    const evaluation = evaluateContract(contract, score);

    expect(evaluation.complete).toBe(true);
    expect(evaluation.progress).toBe(5);
    expect(evaluation.target).toBe(5);
  });

  it('fails an earned-gold contract when the score is below the target', () => {
    const contract: Contract = {
      id: 'test-earn-10',
      label: 'Earn 10 gold',
      description: 'The debt collector is less patient today.',
      goal: { type: 'earn-gold', goldTarget: 10 },
      failureDebtPenalty: 3,
    };
    const score = {
      ...createEmptyRoundScore(),
      goldEarned: 7,
    };

    const evaluation = evaluateContract(contract, score);

    expect(evaluation.complete).toBe(false);
    expect(evaluation.progress).toBe(7);
    expect(evaluation.target).toBe(10);
  });
});

