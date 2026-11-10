const secretCounts = new Map<string, number>();

export function countPossibleSecrets(length: number, base: number): number {
  if (length === 0) {
    return 1;
  }

  const key = `${length}:${base}`;
  const cachedCount = secretCounts.get(key);

  if (cachedCount !== undefined) {
    return cachedCount;
  }

  const count = base * countPossibleSecrets(length - 1, base - 1);
  secretCounts.set(key, count);

  return count;
}
