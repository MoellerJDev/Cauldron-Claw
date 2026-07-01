export type UpgradeId =
  | 'clean-copper'
  | 'ash-tongs'
  | 'quiet-ledger';

export type UpgradeArea =
  | 'drop'
  | 'board'
  | 'cauldron'
  | 'claw'
  | 'vat'
  | 'economy';

export interface Upgrade {
  id: UpgradeId;
  label: string;
  description: string;
  area: UpgradeArea;
}

