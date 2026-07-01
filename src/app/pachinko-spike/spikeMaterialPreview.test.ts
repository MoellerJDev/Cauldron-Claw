import { describe, expect, it } from 'vitest';
import { buildSpikeMaterialPreview } from './spikeMaterialPreview';

describe('spike material preview', () => {
  it('counts Herb as Healing material', () => {
    expect(
      buildSpikeMaterialPreview([
        { kind: 'herb', enteredCauldron: true },
      ]),
    ).toEqual({
      healing: 1,
      bone: 0,
      poison: 0,
    });
  });

  it('counts Ash and Bone as Bone material', () => {
    expect(
      buildSpikeMaterialPreview([
        { kind: 'ash', enteredCauldron: true },
        { kind: 'bone', enteredCauldron: true },
      ]),
    ).toEqual({
      healing: 0,
      bone: 2,
      poison: 0,
    });
  });

  it('counts Mushroom as Poison material', () => {
    expect(
      buildSpikeMaterialPreview([
        { kind: 'mushroom', enteredCauldron: true },
      ]),
    ).toEqual({
      healing: 0,
      bone: 0,
      poison: 1,
    });
  });

  it('aggregates only entered cauldron contents', () => {
    expect(
      buildSpikeMaterialPreview([
        { kind: 'herb', enteredCauldron: true },
        { kind: 'ash', enteredCauldron: true },
        { kind: 'bone', enteredCauldron: true },
        { kind: 'mushroom', enteredCauldron: true },
        { kind: 'herb', enteredCauldron: false },
        { kind: 'ash', enteredCauldron: true, extracted: true },
      ]),
    ).toEqual({
      healing: 1,
      bone: 2,
      poison: 1,
    });
  });
});
