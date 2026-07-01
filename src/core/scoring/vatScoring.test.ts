import { describe, expect, it } from 'vitest';
import { CONTRACT_DEFS } from '../../data/contracts';
import { createIngredient } from '../ingredients/createIngredient';
import { createInitialRunState } from '../run-state/createInitialRunState';
import { scoreVatGrab, submitGrabToVat } from './vatScoring';

describe('vat scoring', () => {
  it('scores clean ingredients in the healing vat without physics or rendering', () => {
    const state = createInitialRunState(CONTRACT_DEFS.cleanStart);
    const herbsAndWater = [
      createIngredient('herb-1', 'herb'),
      createIngredient('water-1', 'water'),
    ];

    const submission = submitGrabToVat(state, 'healing', herbsAndWater);

    expect(submission.result.gold).toBe(5);
    expect(submission.result.suspicionDelta).toBe(0);
    expect(submission.state.gold).toBe(5);
    expect(submission.state.round.score.goldByVat.healing).toBe(5);
    expect(submission.events.map((event) => event.type)).toEqual([
      'vat-submitted',
      'vat-scored',
    ]);
  });

  it('scores bone and ash as a combo in the bone vat', () => {
    const ingredients = [
      createIngredient('bone-1', 'bone'),
      createIngredient('ash-1', 'ash'),
    ];

    const result = scoreVatGrab('bone', ingredients);

    expect(result.gold).toBe(8);
    expect(result.contractProgress.familyCounts.bone).toBe(1);
    expect(result.contractProgress.familyCounts.waste).toBe(1);
  });

  it('increases suspicion for poison-family and curse ingredients in the poison vat', () => {
    const state = createInitialRunState(CONTRACT_DEFS.cleanStart);
    const riskyBatch = [
      createIngredient('mushroom-1', 'mushroom'),
      createIngredient('curse-1', 'curse'),
    ];

    const submission = submitGrabToVat(state, 'poison', riskyBatch);

    expect(submission.result.gold).toBe(6);
    expect(submission.result.suspicionDelta).toBe(2);
    expect(submission.state.suspicion).toBe(2);
    expect(submission.state.round.score.suspicionGained).toBe(2);
  });
});

