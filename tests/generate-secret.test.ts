import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateSecret } from '../scripts/core/generate-secret.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateSecret', () => {
  it.each([
    { length: 2, base: 2, expected: '01' },
    { length: 2, base: 8, expected: '01' },
    { length: 3, base: 8, expected: '012' },
    { length: 4, base: 8, expected: '0123' },
    { length: 5, base: 8, expected: '01234' },
    { length: 6, base: 8, expected: '012345' },
    { length: 2, base: 10, expected: '01' },
    { length: 3, base: 10, expected: '012' },
    { length: 4, base: 10, expected: '0123' },
    { length: 5, base: 10, expected: '01234' },
    { length: 6, base: 10, expected: '012345' },
    { length: 2, base: 16, expected: '01' },
    { length: 3, base: 16, expected: '012' },
    { length: 4, base: 16, expected: '0123' },
    { length: 5, base: 16, expected: '01234' },
    { length: 6, base: 16, expected: '012345' },
  ])(
    'generates $expected for length $length and base $base when random returns 0',
    ({ length, base, expected }) => {
      expect(generateSecret(length, base, () => 0)).toBe(expected);
    },
  );

  it.each([
    { length: 2, base: 2, digits: '01' },
    { length: 6, base: 8, digits: '01234567' },
    { length: 6, base: 10, digits: '0123456789' },
    { length: 6, base: 16, digits: '0123456789abcdef' },
  ])(
    'generates unique base-$base digits when random is close to 1',
    ({ length, base, digits }) => {
      const secret = generateSecret(length, base, () => 0.999999);

      expect(secret).toHaveLength(length);
      expect(new Set(secret).size).toBe(length);
      expect(secret[0]).toBe(digits[digits.length - 1]);
      for (const digit of secret) {
        expect(digits).toContain(digit);
      }
    },
  );

  it('uses the supplied random sequence to choose each digit', () => {
    const random = vi
      .fn<() => number>()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.75)
      .mockImplementation(() => {
        throw new Error('Random sequence exhausted');
      });

    expect(generateSecret(4, 10, random)).toBe('0548');
  });

  it('does not keep used digits between calls', () => {
    const random = () => 0;

    expect(generateSecret(4, 10, random)).toBe('0123');
    expect(generateSecret(4, 10, random)).toBe('0123');
  });

  it('uses Math.random when no random function is supplied', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(generateSecret(4, 10)).toBe('0123');
    expect(random).toHaveBeenCalled();
  });
});
