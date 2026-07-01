import { describe, expect, it } from 'vitest';
import {
  createInitialSpikeDropPhaseState,
  resetSpikeDropPhaseState,
  selectSpikeDropLane,
  useSpikeDrop,
} from './spikeDropPhaseState';
import type { SpikeDropLaneId } from './spikeConfig';

describe('spike drop phase state', () => {
  it('starts in drop phase with 3 drops remaining', () => {
    const state = createInitialSpikeDropPhaseState();

    expect(state.phase).toBe('drop-phase');
    expect(state.dropsUsed).toBe(0);
    expect(state.dropsRemaining).toBe(3);
    expect(state.maxDrops).toBe(3);
    expect(state.selectedLaneId).toBe('center');
  });

  it('uses drops and transitions to ready-for-claw on the third drop', () => {
    const first = useSpikeDrop(createInitialSpikeDropPhaseState());
    const second = useSpikeDrop(first.state);
    const third = useSpikeDrop(second.state);

    expect(first.accepted).toBe(true);
    expect(first.dropNumber).toBe(1);
    expect(first.state.dropsRemaining).toBe(2);
    expect(first.state.phase).toBe('drop-phase');
    expect(second.dropNumber).toBe(2);
    expect(second.state.dropsRemaining).toBe(1);
    expect(second.state.phase).toBe('drop-phase');
    expect(third.dropNumber).toBe(3);
    expect(third.state.dropsRemaining).toBe(0);
    expect(third.state.phase).toBe('ready-for-claw');
  });

  it('blocks drops once ready for claw and never goes below zero', () => {
    const first = useSpikeDrop(createInitialSpikeDropPhaseState());
    const second = useSpikeDrop(first.state);
    const third = useSpikeDrop(second.state);
    const fourth = useSpikeDrop(third.state);
    const fifth = useSpikeDrop(fourth.state);

    expect(fourth.accepted).toBe(false);
    expect(fourth.dropNumber).toBeUndefined();
    expect(fourth.state).toBe(third.state);
    expect(fourth.state.dropsRemaining).toBe(0);
    expect(fifth.accepted).toBe(false);
    expect(fifth.state.dropsRemaining).toBe(0);
  });

  it('selects lanes without consuming a drop', () => {
    const state = createInitialSpikeDropPhaseState();
    const nextState = selectSpikeDropLane(state, 'left');

    expect(nextState.selectedLaneId).toBe('left');
    expect(nextState.dropsRemaining).toBe(3);
  });

  it('rejects invalid runtime lane values', () => {
    const state = createInitialSpikeDropPhaseState();
    const invalidLane = 'north' as unknown as SpikeDropLaneId;

    expect(() => selectSpikeDropLane(state, invalidLane)).toThrow(
      'Unknown spike drop lane: north',
    );
  });

  it('resets to the initial drop phase state', () => {
    const selected = selectSpikeDropLane(createInitialSpikeDropPhaseState(), 'left');
    const used = useSpikeDrop(selected);

    expect(resetSpikeDropPhaseState()).toEqual({
      phase: 'drop-phase',
      selectedLaneId: 'center',
      dropsUsed: 0,
      dropsRemaining: 3,
      maxDrops: 3,
    });
    expect(resetSpikeDropPhaseState()).toEqual(
      createInitialSpikeDropPhaseState(),
    );
    expect(used.state.selectedLaneId).toBe('left');
  });
});
