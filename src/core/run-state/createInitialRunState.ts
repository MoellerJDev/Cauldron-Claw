import type { Contract } from '../contracts/types';
import type { RunState } from './types';
import { createEmptyRoundScore } from './roundScore';

export function createInitialRunState(activeContract: Contract): RunState {
  return {
    roundNumber: 1,
    maxRounds: 10,
    gold: 0,
    debt: 10,
    suspicion: 0,
    ownedUpgrades: [],
    round: {
      phase: 'contract-preview',
      activeContract,
      remainingDrops: 3,
      remainingClawGrabs: 2,
      score: createEmptyRoundScore(),
    },
    log: ['Run initialized.'],
  };
}

