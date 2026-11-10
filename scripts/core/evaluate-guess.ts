export function evaluateGuess(
  secret: string,
  guess: string,
): { bulls: number; cows: number } {
  const normalizedSecret = secret.toLowerCase();
  const guessDigits = [...guess.toLowerCase()];
  const secretDigits = new Set(normalizedSecret);

  const bulls = guessDigits.filter(
    (digit, index) => digit === normalizedSecret[index],
  ).length;
  const matches = guessDigits.filter((digit) => secretDigits.has(digit)).length;

  return { bulls, cows: matches - bulls };
}
