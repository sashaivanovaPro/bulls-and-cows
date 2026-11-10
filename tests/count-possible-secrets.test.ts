import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from '../scripts/core/count-possible-secrets.js';

describe('countPossibleSecrets', () => {
  it.each([
    { length: 0, base: 0, expected: 1 },
    { length: 0, base: 2, expected: 1 },
    { length: 0, base: 8, expected: 1 },
    { length: 0, base: 10, expected: 1 },
    { length: 0, base: 16, expected: 1 },
    { length: 1, base: 2, expected: 2 },
    { length: 1, base: 8, expected: 8 },
    { length: 1, base: 10, expected: 10 },
    { length: 1, base: 16, expected: 16 },
    { length: 2, base: 2, expected: 2 },
    { length: 2, base: 8, expected: 56 },
    { length: 3, base: 8, expected: 336 },
    { length: 4, base: 8, expected: 1680 },
    { length: 5, base: 8, expected: 6720 },
    { length: 6, base: 8, expected: 20160 },
    { length: 2, base: 10, expected: 90 },
    { length: 3, base: 10, expected: 720 },
    { length: 4, base: 10, expected: 5040 },
    { length: 5, base: 10, expected: 30240 },
    { length: 6, base: 10, expected: 151200 },
    { length: 2, base: 16, expected: 240 },
    { length: 3, base: 16, expected: 3360 },
    { length: 4, base: 16, expected: 43680 },
    { length: 5, base: 16, expected: 524160 },
    { length: 6, base: 16, expected: 5765760 },
  ])(
    'counts $expected secrets for length $length and base $base',
    ({ length, base, expected }) => {
      expect(countPossibleSecrets(length, base)).toBe(expected);
    },
  );

  it('keeps results correct when settings change between repeated calls', () => {
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(3, 10)).toBe(720);
    expect(countPossibleSecrets(2, 8)).toBe(56);
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(3, 10)).toBe(720);
  });
});
