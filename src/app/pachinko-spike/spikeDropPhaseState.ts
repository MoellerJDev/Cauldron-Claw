import { isSpikeDropLaneId, type SpikeDropLaneId } from './spikeConfig';

export type SpikeSetupPhase = 'drop-phase' | 'ready-for-claw';

export interface SpikeDropPhaseState {
  phase: SpikeSetupPhase;
  selectedLaneId: SpikeDropLaneId;
  dropsUsed: number;
  dropsRemaining: number;
  maxDrops: number;
}

export interface SpikeDropUseResult {
  state: SpikeDropPhaseState;
  accepted: boolean;
  dropNumber?: number;
}

const DEFAULT_MAX_DROPS = 3;

export function createInitialSpikeDropPhaseState(
  selectedLaneId: SpikeDropLaneId = 'center',
): SpikeDropPhaseState {
  return {
    phase: 'drop-phase',
    selectedLaneId,
    dropsUsed: 0,
    dropsRemaining: DEFAULT_MAX_DROPS,
    maxDrops: DEFAULT_MAX_DROPS,
  };
}

export function selectSpikeDropLane(
  state: SpikeDropPhaseState,
  selectedLaneId: SpikeDropLaneId,
): SpikeDropPhaseState {
  if (!isSpikeDropLaneId(selectedLaneId)) {
    throw new Error(`Unknown spike drop lane: ${String(selectedLaneId)}`);
  }

  return {
    ...state,
    selectedLaneId,
  };
}

export function resetSpikeDropPhaseState(): SpikeDropPhaseState {
  return createInitialSpikeDropPhaseState();
}

export function canUseSpikeDrop(state: SpikeDropPhaseState): boolean {
  return state.phase === 'drop-phase' && state.dropsRemaining > 0;
}

export function useSpikeDrop(state: SpikeDropPhaseState): SpikeDropUseResult {
  if (!canUseSpikeDrop(state)) {
    return {
      state,
      accepted: false,
    };
  }

  const dropsUsed = state.dropsUsed + 1;
  const dropsRemaining = Math.max(0, state.maxDrops - dropsUsed);

  return {
    accepted: true,
    dropNumber: dropsUsed,
    state: {
      ...state,
      dropsUsed,
      dropsRemaining,
      phase: dropsRemaining === 0 ? 'ready-for-claw' : 'drop-phase',
    },
  };
}
