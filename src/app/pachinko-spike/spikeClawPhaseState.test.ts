import { describe, expect, it } from 'vitest';
import {
  canUseSpikeClawGrab,
  createInitialSpikeClawPhaseState,
  resetSpikeClawPhaseState,
  selectSpikeClawPosition,
  useSpikeClawGrab,
} from './spikeClawPhaseState';

describe('spike claw phase state', () => {
  it('starts centered with no grab used', () => {
    expect(createInitialSpikeClawPhaseState()).toEqual({
      selectedPositionId: 'center',
      grabUsed: false,
      grabbedIngredients: [],
    });
  });

  it('selects left, center, and right claw positions', () => {
    let state = createInitialSpikeClawPhaseState();

    state = selectSpikeClawPosition(state, 'left');
    expect(state.selectedPositionId).toBe('left');

    state = selectSpikeClawPosition(state, 'center');
    expect(state.selectedPositionId).toBe('center');

    state = selectSpikeClawPosition(state, 'right');
    expect(state.selectedPositionId).toBe('right');
  });

  it('does not allow grabbing before the setup reaches ready-for-claw', () => {
    const state = createInitialSpikeClawPhaseState();

    expect(canUseSpikeClawGrab(state, 'drop-phase')).toBe(false);
    expect(
      useSpikeClawGrab(state, 'drop-phase', [
        {
          ingredientId: 'spike-herb-1',
          bodyId: 'spike-herb-1',
          kind: 'herb',
        },
      ]),
    ).toEqual({
      state,
      accepted: false,
    });
  });

  it('uses a grab once and preserves grabbed ingredient kinds', () => {
    const state = createInitialSpikeClawPhaseState();
    const firstGrab = useSpikeClawGrab(state, 'ready-for-claw', [
      {
        ingredientId: 'spike-ash-1',
        bodyId: 'spike-herb-1',
        kind: 'ash',
      },
    ]);
    const secondGrab = useSpikeClawGrab(firstGrab.state, 'ready-for-claw', [
      {
        ingredientId: 'spike-bone-2',
        bodyId: 'spike-bone-2',
        kind: 'bone',
      },
    ]);

    expect(firstGrab.accepted).toBe(true);
    expect(firstGrab.state.grabUsed).toBe(true);
    expect(firstGrab.state.grabbedIngredients).toEqual([
      {
        ingredientId: 'spike-ash-1',
        bodyId: 'spike-herb-1',
        kind: 'ash',
      },
    ]);
    expect(secondGrab).toEqual({
      state: firstGrab.state,
      accepted: false,
    });
  });

  it('reset restores the initial claw state', () => {
    const used = useSpikeClawGrab(
      selectSpikeClawPosition(createInitialSpikeClawPhaseState(), 'right'),
      'ready-for-claw',
      [
        {
          ingredientId: 'spike-mushroom-3',
          bodyId: 'spike-mushroom-3',
          kind: 'mushroom',
        },
      ],
    );

    expect(used.state).not.toEqual(resetSpikeClawPhaseState());
    expect(resetSpikeClawPhaseState()).toEqual({
      selectedPositionId: 'center',
      grabUsed: false,
      grabbedIngredients: [],
    });
  });
});
