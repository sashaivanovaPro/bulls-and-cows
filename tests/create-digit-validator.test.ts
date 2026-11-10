import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../scripts/core/create-digit-validator.js';

describe('createDigitValidator', () => {
  it.each([
    { base: 2, digits: '01' },
    { base: 8, digits: '01234567' },
    { base: 10, digits: '0123456789' },
    { base: 16, digits: '0123456789abcdef' },
  ])('accepts every base-$base digit', ({ base, digits }) => {
    const isValidDigit = createDigitValidator(base);

    for (const digit of digits) {
      expect(isValidDigit(digit)).toBe(true);
    }
  });

  it.each([
    { base: 2, digits: '23456789abcdef' },
    { base: 8, digits: '89abcdef' },
    { base: 10, digits: 'abcdef' },
    { base: 16, digits: 'gGzZ' },
  ])('rejects digits outside base $base', ({ base, digits }) => {
    const isValidDigit = createDigitValidator(base);

    for (const digit of digits) {
      expect(isValidDigit(digit)).toBe(false);
    }
  });

  it.each(['A', 'B', 'C', 'D', 'E', 'F'])(
    'accepts uppercase hex digit %s',
    (digit) => {
      const isValidDigit = createDigitValidator(16);

      expect(isValidDigit(digit)).toBe(true);
    },
  );

  it.each(['', '01', 'ab', '0x1', ' ', '\t', '\n', '-', '.'])(
    'rejects invalid input %j',
    (input) => {
      const isValidDigit = createDigitValidator(16);

      expect(isValidDigit(input)).toBe(false);
    },
  );

  it('keeps validators for different bases independent', () => {
    const isOctalDigit = createDigitValidator(8);
    const isDecimalDigit = createDigitValidator(10);

    expect(isOctalDigit('8')).toBe(false);
    expect(isDecimalDigit('8')).toBe(true);
    expect(isOctalDigit('8')).toBe(false);
  });
});
