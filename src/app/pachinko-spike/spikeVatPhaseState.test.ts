import { describe, expect, it } from 'vitest';
import {
  canSelectSpikeVat,
  canSubmitSpikeVatBatch,
  createInitialSpikeVatPhaseState,
  resetSpikeVatPhaseState,
  selectSpikeVat,
  submitSpikeVatBatch,
} from './spikeVatPhaseState';
import type { SpikeVatScoringResult } from './spikeVatScoring';

const grabbedBatch = [
  {
    ingredientId: 'spike-herb-1',
    bodyId: 'spike-herb-1',
    kind: 'ash',
  },
] as const;

const scoringResult: SpikeVatScoringResult = {
  vatId: 'bone',
  vatLabel: 'Bone Vat',
  ingredientScores: [
    {
      ingredientId: 'spike-herb-1',
      kind: 'ash',
      label: 'Ash',
      value: 2,
    },
  ],
  total: 2,
};

describe('spike vat phase state', () => {
  it('starts with Healing Vat selected and no submitted score', () => {
    expect(createInitialSpikeVatPhaseState()).toEqual({
      selectedVatId: 'healing',
      submitted: false,
      lastScoringResult: undefined,
    });
  });

  it('selects Healing, Bone, and Poison vats', () => {
    let state = createInitialSpikeVatPhaseState();

    state = selectSpikeVat(state, 'bone');
    expect(state.selectedVatId).toBe('bone');

    state = selectSpikeVat(state, 'poison');
    expect(state.selectedVatId).toBe('poison');

    state = selectSpikeVat(state, 'healing');
    expect(state.selectedVatId).toBe('healing');
  });

  it('does not allow selection or submission before a grab exists', () => {
    const state = createInitialSpikeVatPhaseState();

    expect(canSelectSpikeVat(state, [])).toBe(false);
    expect(canSubmitSpikeVatBatch(state, [])).toBe(false);
    expect(submitSpikeVatBatch(state, [], scoringResult)).toEqual({
      state,
      accepted: false,
    });
  });

  it('submits once after a grabbed batch exists', () => {
    const state = selectSpikeVat(createInitialSpikeVatPhaseState(), 'bone');
    const firstSubmit = submitSpikeVatBatch(
      state,
      grabbedBatch,
      scoringResult,
    );
    const secondSubmit = submitSpikeVatBatch(
      firstSubmit.state,
      grabbedBatch,
      scoringResult,
    );

    expect(canSelectSpikeVat(state, grabbedBatch)).toBe(true);
    expect(canSubmitSpikeVatBatch(state, grabbedBatch)).toBe(true);
    expect(firstSubmit).toEqual({
      accepted: true,
      state: {
        selectedVatId: 'bone',
        submitted: true,
        lastScoringResult: scoringResult,
      },
    });
    expect(canSelectSpikeVat(firstSubmit.state, grabbedBatch)).toBe(false);
    expect(canSubmitSpikeVatBatch(firstSubmit.state, grabbedBatch)).toBe(false);
    expect(secondSubmit).toEqual({
      state: firstSubmit.state,
      accepted: false,
    });
  });

  it('reset restores the initial vat state', () => {
    const submitted = submitSpikeVatBatch(
      selectSpikeVat(createInitialSpikeVatPhaseState(), 'poison'),
      grabbedBatch,
      {
        ...scoringResult,
        vatId: 'poison',
        vatLabel: 'Poison Vat',
      },
    );

    expect(submitted.state).not.toEqual(resetSpikeVatPhaseState());
    expect(resetSpikeVatPhaseState()).toEqual({
      selectedVatId: 'healing',
      submitted: false,
      lastScoringResult: undefined,
    });
  });
});
