export function generateSecret(
  length: number,
  base: number,
  random: () => number = Math.random,
): string {
  const digits = [...'0123456789abcdef'.slice(0, base)];

  for (let index = 0; index < length; index += 1) {
    const randomIndex = index + Math.floor(random() * (digits.length - index));

    // Both indices are within the array for valid length, base and random values.
    [digits[index], digits[randomIndex]] = [
      digits[randomIndex]!,
      digits[index]!,
    ];
  }

  return digits.slice(0, length).join('');
}
