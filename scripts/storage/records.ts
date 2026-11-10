import { addRecord, type GameRecord } from '../core/records.js';

export type RecordStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const RECORDS_KEY = 'bulls-and-cows.records';

function isGameRecord(value: unknown): value is GameRecord {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !('attempts' in value) ||
    !('elapsedMs' in value) ||
    !('length' in value) ||
    !('base' in value)
  ) {
    return false;
  }

  const { attempts, elapsedMs, length, base } = value;

  return (
    typeof attempts === 'number' &&
    Number.isSafeInteger(attempts) &&
    attempts > 0 &&
    typeof elapsedMs === 'number' &&
    Number.isFinite(elapsedMs) &&
    elapsedMs >= 0 &&
    typeof length === 'number' &&
    Number.isInteger(length) &&
    length >= 2 &&
    length <= 6 &&
    typeof base === 'number' &&
    [2, 8, 10, 16].includes(base) &&
    length <= base
  );
}

function getTopRecords(records: readonly GameRecord[]): readonly GameRecord[] {
  return records.reduce<readonly GameRecord[]>(addRecord, []);
}

export function loadRecords(storage: RecordStorage): readonly GameRecord[] {
  try {
    const saved = storage.getItem(RECORDS_KEY);

    if (saved === null) {
      return [];
    }

    const data: unknown = JSON.parse(saved);

    if (!Array.isArray(data)) {
      return [];
    }

    return getTopRecords(data.filter(isGameRecord));
  } catch {
    return [];
  }
}

export function saveRecords(
  records: readonly GameRecord[],
  storage: RecordStorage,
): boolean {
  try {
    storage.setItem(RECORDS_KEY, JSON.stringify(getTopRecords(records)));
    return true;
  } catch {
    return false;
  }
}
