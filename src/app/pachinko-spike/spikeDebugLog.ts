import type { RunState } from '../../core/run-state/types';
import { getSpikeDropLane, type SpikeDropLaneId } from './spikeConfig';

export function createSpikeResetRunState(baseState: RunState): RunState {
  return {
    ...baseState,
    round: {
      ...baseState.round,
      phase: 'pachinko-resolving',
    },
    log: ['Run initialized.', 'Spike reset. Cauldron cleared.'],
  };
}

export function appendSpikeLog(state: RunState, entry: string): RunState {
  return {
    ...state,
    log: [...state.log, entry],
  };
}

export function formatSpikeDropLogEntry(
  dropNumber: number,
  laneId: SpikeDropLaneId,
): string {
  return `Drop ${dropNumber}: Fresh Herb dropped from ${
    getSpikeDropLane(laneId).label
  } lane.`;
}
