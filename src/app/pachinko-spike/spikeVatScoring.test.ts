import { describe, expect, it } from 'vitest';
import { CONTRACT_DEFS } from '../../data/contracts';
import { createInitialRunState } from '../../core/run-state/createInitialRunState';
import { submitSpikeVatBatchToCore } from './spikeVatScoring';

describe('spike vat scoring adapter', () => {
  it('uses core Healing Vat scoring for Herb', () => {
    const submission = submitSpikeVatBatchToCore(
      createInitialRunState(CONTRACT_DEFS.cleanStart),
      'healing',
      [
        {
          ingredientId: 'spike-herb-1',
          kind: 'herb',
        },
      ],
    );

    expect(submission.result).toMatchObject({
      vatId: 'healing',
      vatLabel: 'Healing Vat',
      gold: 3,
      suspicionDelta: 0,
      submittedIngredients: [
        {
          ingredientId: 'spike-herb-1',
          kind: 'herb',
          label: 'Herb',
        },
      ],
    });
    expect(submission.state.gold).toBe(3);
    expect(submission.state.round.score.goldByVat.healing).toBe(3);
  });

  it('uses core Bone Vat scoring, including Ash and Bone combo behavior', () => {
    const submission = submitSpikeVatBatchToCore(
      createInitialRunState(CONTRACT_DEFS.cleanStart),
      'bone',
      [
        {
          ingredientId: 'spike-herb-1',
          kind: 'ash',
        },
        {
          ingredientId: 'spike-bone-2',
          kind: 'bone',
        },
      ],
    );

    expect(submission.result.gold).toBe(8);
    expect(submission.result.suspicionDelta).toBe(0);
    expect(submission.state.gold).toBe(8);
    expect(submission.state.round.score.goldByVat.bone).toBe(8);
    expect(submission.state.round.score.familyCounts.bone).toBe(1);
    expect(submission.state.round.score.familyCounts.waste).toBe(1);
  });

  it('uses core Poison Vat scoring and suspicion for Mushroom', () => {
    const submission = submitSpikeVatBatchToCore(
      createInitialRunState(CONTRACT_DEFS.cleanStart),
      'poison',
      [
        {
          ingredientId: 'spike-mushroom-3',
          kind: 'mushroom',
        },
      ],
    );

    expect(submission.result.gold).toBe(4);
    expect(submission.result.suspicionDelta).toBe(1);
    expect(submission.state.gold).toBe(4);
    expect(submission.state.suspicion).toBe(1);
    expect(submission.state.round.score.goldByVat.poison).toBe(4);
    expect(submission.state.round.score.suspicionGained).toBe(1);
  });

  it('reports core score consistently for unmatched ingredients', () => {
    const submission = submitSpikeVatBatchToCore(
      createInitialRunState(CONTRACT_DEFS.cleanStart),
      'healing',
      [
        {
          ingredientId: 'spike-mushroom-3',
          kind: 'mushroom',
        },
      ],
    );

    expect(submission.result.gold).toBe(0);
    expect(submission.result.suspicionDelta).toBe(0);
    expect(submission.state.gold).toBe(0);
    expect(submission.result.logEntries).toEqual([
      'Mushroom scored 0 gold in the healing vat.',
    ]);
  });
});
