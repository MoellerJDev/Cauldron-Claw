import { describe, expect, it } from 'vitest';
import { nextInt, nextRng } from './SeededRng';

describe('SeededRng', () => {
  it('produces deterministic values from the same seed', () => {
    const first = nextRng({ seed: 1234 });
    const second = nextRng({ seed: 1234 });

    expect(first.value).toBe(second.value);
    expect(first.rng.seed).toBe(second.rng.seed);
  });

  it('can produce deterministic integer ranges without Math.random', () => {
    const result = nextInt({ seed: 55 }, 1, 5);

    expect(result.value).toBeGreaterThanOrEqual(1);
    expect(result.value).toBeLessThanOrEqual(5);
    expect(result.rng.seed).not.toBe(55);
  });
});

