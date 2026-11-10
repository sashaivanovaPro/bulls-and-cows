import { describe, expect, it } from 'vitest';
import { isValidGuess } from '../scripts/core/is-valid-guess.js';

describe('isValidGuess', () => {
  it.each([
    { guess: '01', length: 2, base: 2 },
    { guess: '10', length: 2, base: 2 },
    { guess: '0765', length: 4, base: 8 },
    { guess: '01', length: 2, base: 10 },
    { guess: '012', length: 3, base: 10 },
    { guess: '0123', length: 4, base: 10 },
    { guess: '01234', length: 5, base: 10 },
    { guess: '012345', length: 6, base: 10 },
    { guess: '09af', length: 4, base: 16 },
    { guess: '09AF', length: 4, base: 16 },
    { guess: 'aB3F', length: 4, base: 16 },
  ])(
    'accepts $guess with length $length and base $base',
    ({ guess, length, base }) => {
      expect(isValidGuess(guess, length, base)).toBe(true);
    },
  );

  it.each([
    { guess: '', length: 4 },
    { guess: '012', length: 4 },
    { guess: '01234', length: 4 },
  ])(
    'rejects "$guess" when the required length is $length',
    ({ guess, length }) => {
      expect(isValidGuess(guess, length, 10)).toBe(false);
    },
  );

  it.each([
    { guess: '02', length: 2, base: 2 },
    { guess: '0187', length: 4, base: 8 },
    { guess: '01a3', length: 4, base: 10 },
    { guess: '01g3', length: 4, base: 16 },
  ])(
    'rejects $guess with a digit outside base $base',
    ({ guess, length, base }) => {
      expect(isValidGuess(guess, length, base)).toBe(false);
    },
  );

  it.each([
    { guess: '00', length: 2, base: 2 },
    { guess: '0120', length: 4, base: 8 },
    { guess: '1123', length: 4, base: 10 },
    { guess: 'abca', length: 4, base: 16 },
    { guess: 'aA01', length: 4, base: 16 },
    { guess: 'Ff01', length: 4, base: 16 },
  ])(
    'rejects repeated digits in $guess for base $base',
    ({ guess, length, base }) => {
      expect(isValidGuess(guess, length, base)).toBe(false);
    },
  );

  it.each([' 123', '012 ', '01\t3', '-123', '1.23', '0x1a'])(
    'rejects whitespace, signs and prefixes in %j',
    (guess) => {
      expect(isValidGuess(guess, 4, 16)).toBe(false);
    },
  );
});
