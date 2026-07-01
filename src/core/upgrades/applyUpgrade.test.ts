import { describe, expect, it } from 'vitest';
import { CONTRACT_DEFS } from '../../data/contracts';
import { UPGRADE_DEFS } from '../../data/upgrades';
import { createInitialRunState } from '../run-state/createInitialRunState';
import { applyUpgrade } from './applyUpgrade';

describe('applyUpgrade', () => {
  it('adds a new upgrade without mutating the original state', () => {
    const state = createInitialRunState(CONTRACT_DEFS.cleanStart);
    const nextState = applyUpgrade(state, UPGRADE_DEFS.cleanCopper);

    expect(nextState.ownedUpgrades).toEqual(['clean-copper']);
    expect(state.ownedUpgrades).toEqual([]);
    expect(nextState.log.at(-1)).toBe('Upgrade gained: Clean Copper.');
  });
});

