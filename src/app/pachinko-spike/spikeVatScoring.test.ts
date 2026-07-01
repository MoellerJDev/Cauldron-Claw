import { describe, expect, it } from 'vitest';
import { scoreSpikeVatBatch } from './spikeVatScoring';

describe('spike vat scoring', () => {
  it('scores Herb in the Healing Vat', () => {
    expect(
      scoreSpikeVatBatch('healing', [
        {
          ingredientId: 'spike-herb-1',
          kind: 'herb',
        },
      ]),
    ).toMatchObject({
      vatId: 'healing',
      vatLabel: 'Healing Vat',
      total: 3,
      ingredientScores: [
        {
          ingredientId: 'spike-herb-1',
          kind: 'herb',
          label: 'Herb',
          value: 3,
        },
      ],
    });
  });

  it('scores Ash and Bone in the Bone Vat', () => {
    expect(
      scoreSpikeVatBatch('bone', [
        {
          ingredientId: 'spike-herb-1',
          kind: 'ash',
        },
        {
          ingredientId: 'spike-bone-2',
          kind: 'bone',
        },
      ]),
    ).toMatchObject({
      vatId: 'bone',
      vatLabel: 'Bone Vat',
      total: 5,
      ingredientScores: [
        {
          ingredientId: 'spike-herb-1',
          kind: 'ash',
          label: 'Ash',
          value: 2,
        },
        {
          ingredientId: 'spike-bone-2',
          kind: 'bone',
          label: 'Bone',
          value: 3,
        },
      ],
    });
  });

  it('scores Mushroom in the Poison Vat', () => {
    expect(
      scoreSpikeVatBatch('poison', [
        {
          ingredientId: 'spike-mushroom-3',
          kind: 'mushroom',
        },
      ]),
    ).toMatchObject({
      vatId: 'poison',
      vatLabel: 'Poison Vat',
      total: 4,
      ingredientScores: [
        {
          ingredientId: 'spike-mushroom-3',
          kind: 'mushroom',
          label: 'Mushroom',
          value: 4,
        },
      ],
    });
  });

  it('scores unmatched ingredients as zero and aggregates totals', () => {
    expect(
      scoreSpikeVatBatch('bone', [
        {
          ingredientId: 'spike-herb-1',
          kind: 'ash',
        },
        {
          ingredientId: 'spike-bone-2',
          kind: 'bone',
        },
        {
          ingredientId: 'spike-mushroom-3',
          kind: 'mushroom',
        },
      ]),
    ).toMatchObject({
      total: 5,
      ingredientScores: [
        {
          kind: 'ash',
          value: 2,
        },
        {
          kind: 'bone',
          value: 3,
        },
        {
          kind: 'mushroom',
          value: 0,
        },
      ],
    });
  });
});
