import type { Contract } from '../core/contracts/types';

export const CONTRACT_DEFS = {
  cleanStart: {
    id: 'clean-start',
    label: 'Clean Starter Draught',
    description: 'Earn at least 5 gold this round.',
    goal: { type: 'earn-gold', goldTarget: 5 },
    failureDebtPenalty: 2,
  },
  boneOrder: {
    id: 'bone-order',
    label: 'Boneblack Order',
    description: 'Earn at least 8 gold from the Bone Vat.',
    goal: { type: 'earn-vat-gold', vatId: 'bone', goldTarget: 8 },
    failureDebtPenalty: 3,
  },
  quietNight: {
    id: 'quiet-night',
    label: 'Quiet Night',
    description: 'Gain no more than 1 suspicion this round.',
    goal: { type: 'limit-suspicion', maxSuspicionGained: 1 },
    failureDebtPenalty: 2,
  },
} satisfies Record<string, Contract>;

