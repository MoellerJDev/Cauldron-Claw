export interface SeededRng {
  seed: number;
}

export interface RngResult<T> {
  rng: SeededRng;
  value: T;
}

const UINT_32_MAX_EXCLUSIVE = 0x100000000;

export function nextRng(rng: SeededRng): RngResult<number> {
  let state = rng.seed >>> 0;
  state = (state + 0x6d2b79f5) >>> 0;

  let value = state;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

  return {
    rng: { seed: state },
    value: ((value ^ (value >>> 14)) >>> 0) / UINT_32_MAX_EXCLUSIVE,
  };
}

export function nextInt(
  rng: SeededRng,
  minInclusive: number,
  maxInclusive: number,
): RngResult<number> {
  if (!Number.isInteger(minInclusive) || !Number.isInteger(maxInclusive)) {
    throw new Error('nextInt requires integer bounds.');
  }

  if (maxInclusive < minInclusive) {
    throw new Error('nextInt maxInclusive must be >= minInclusive.');
  }

  const next = nextRng(rng);
  const range = maxInclusive - minInclusive + 1;

  return {
    rng: next.rng,
    value: Math.floor(next.value * range) + minInclusive,
  };
}

