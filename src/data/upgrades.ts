import type { Upgrade } from '../core/upgrades/types';

export const UPGRADE_DEFS = {
  cleanCopper: {
    id: 'clean-copper',
    label: 'Clean Copper',
    description: 'A placeholder vat upgrade for future healing payouts.',
    area: 'vat',
  },
  ashTongs: {
    id: 'ash-tongs',
    label: 'Ash Tongs',
    description: 'A placeholder claw upgrade for future ash grabs.',
    area: 'claw',
  },
  quietLedger: {
    id: 'quiet-ledger',
    label: 'Quiet Ledger',
    description: 'A placeholder economy upgrade for future suspicion control.',
    area: 'economy',
  },
} satisfies Record<string, Upgrade>;

