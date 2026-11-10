export function createDigitValidator(base: number): (char: string) => boolean {
  const digits = '0123456789abcdef';
  const allowedDigits = new Set(digits.slice(0, base));

  return (char) => char.length === 1 && allowedDigits.has(char.toLowerCase());
}
