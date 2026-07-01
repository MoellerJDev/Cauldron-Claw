import type { Contract } from '../contracts/types';
import type { IngredientFamily, IngredientKind } from '../ingredients/types';
import type { UpgradeId } from '../upgrades/types';
import type { VatId } from '../vats/types';

export type RoundPhase =
  | 'contract-preview'
  | 'drop-select'
  | 'pachinko-resolving'
  | 'claw-aim'
  | 'claw-descending'
  | 'claw-holding'
  | 'vat-select'
  | 'vat-resolving'
  | 'contract-resolving'
  | 'upgrade-draft'
  | 'round-complete';

export type VatGoldTotals = Record<VatId, number>;

export interface RoundScore {
  goldEarned: number;
  suspicionGained: number;
  goldByVat: VatGoldTotals;
  ingredientCounts: Partial<Record<IngredientKind, number>>;
  familyCounts: Partial<Record<IngredientFamily, number>>;
  vatsUsed: Partial<Record<VatId, number>>;
}

export interface RoundScoreDelta {
  gold: number;
  suspicionDelta: number;
  ingredientCounts: Partial<Record<IngredientKind, number>>;
  familyCounts: Partial<Record<IngredientFamily, number>>;
}

export interface RoundState {
  phase: RoundPhase;
  activeContract: Contract;
  remainingDrops: number;
  remainingClawGrabs: number;
  score: RoundScore;
}

export interface RunState {
  roundNumber: number;
  maxRounds: number;
  gold: number;
  debt: number;
  suspicion: number;
  ownedUpgrades: readonly UpgradeId[];
  round: RoundState;
  log: readonly string[];
}

