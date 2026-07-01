import { describe, expect, it } from 'vitest';
import { CONTRACT_DEFS } from '../../data/contracts';
import { createInitialRunState } from '../../core/run-state/createInitialRunState';
import {
  appendSpikeLog,
  createSpikeResetRunState,
  formatSpikeDropLogEntry,
} from './spikeDebugLog';

describe('spike debug log helpers', () => {
  it('starts reset with a compact fresh log and appends repeated drops', () => {
    const baseState = createInitialRunState(CONTRACT_DEFS.cleanStart);
    const resetState = createSpikeResetRunState(baseState);
    const withDrop = appendSpikeLog(
      resetState,
      formatSpikeDropLogEntry(1, 'center'),
    );

    expect(resetState.round.phase).toBe('pachinko-resolving');
    expect(resetState.log).toEqual([
      'Run initialized.',
      'Spike reset. Cauldron cleared.',
    ]);
    expect(withDrop.log).toContain(
      'Drop 1: Fresh Herb dropped from Center lane.',
    );
  });
});
