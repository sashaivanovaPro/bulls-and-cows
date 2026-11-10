import { createDigitValidator } from './create-digit-validator.js';

export function isValidGuess(
  guess: string,
  length: number,
  base: number,
): boolean {
  if (guess.length !== length) {
    return false;
  }

  const digits = [...guess.toLowerCase()];
  const isValidDigit = createDigitValidator(base);

  return digits.every(isValidDigit) && new Set(digits).size === length;
}
