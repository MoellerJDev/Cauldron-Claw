import type { VatDefinition } from '../core/vats/types';

export const VAT_DEFS = {
  healing: {
    id: 'healing',
    label: 'Healing Vat',
    description: 'Safe payouts for clean ingredients.',
  },
  poison: {
    id: 'poison',
    label: 'Poison Vat',
    description: 'Risky payouts that may raise suspicion.',
  },
  bone: {
    id: 'bone',
    label: 'Bone Vat',
    description: 'Combo payouts for bone and ash.',
  },
  trash: {
    id: 'trash',
    label: 'Trash Vat',
    description: 'Cleanup with little or no payout.',
  },
} satisfies Record<string, VatDefinition>;

