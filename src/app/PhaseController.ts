import type { RoundPhase } from '../core/run-state/types';

const PHASE_ORDER: readonly RoundPhase[] = [
  'contract-preview',
  'drop-select',
  'pachinko-resolving',
  'claw-aim',
  'claw-descending',
  'claw-holding',
  'vat-select',
  'vat-resolving',
  'contract-resolving',
  'upgrade-draft',
  'round-complete',
];

export function getNextPhase(phase: RoundPhase): RoundPhase {
  const currentIndex = PHASE_ORDER.indexOf(phase);

  if (currentIndex === -1) {
    throw new Error(`Unknown round phase: ${phase}`);
  }

  return PHASE_ORDER[Math.min(currentIndex + 1, PHASE_ORDER.length - 1)];
}

