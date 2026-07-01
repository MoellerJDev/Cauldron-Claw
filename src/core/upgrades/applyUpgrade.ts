import type { RunState } from '../run-state/types';
import type { Upgrade } from './types';

export function applyUpgrade(state: RunState, upgrade: Upgrade): RunState {
  if (state.ownedUpgrades.includes(upgrade.id)) {
    throw new Error(`Upgrade already owned: ${upgrade.id}`);
  }

  return {
    ...state,
    ownedUpgrades: [...state.ownedUpgrades, upgrade.id],
    log: [...state.log, `Upgrade gained: ${upgrade.label}.`],
  };
}

