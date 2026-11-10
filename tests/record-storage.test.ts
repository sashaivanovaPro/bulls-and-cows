import { describe, expect, it, vi } from 'vitest';
import type { GameRecord } from '../scripts/core/records.js';
import {
  loadRecords,
  RECORDS_KEY,
  saveRecords,
} from '../scripts/storage/records.js';

function makeStorage(values = new Map<string, string>()) {
  return {
    values,
    storage: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, value);
      }),
    },
  };
}

function makeRecord(attempts = 2, elapsedMs = 1000): GameRecord {
  return { attempts, elapsedMs, length: 4, base: 10 };
}

describe('loadRecords', () => {
  it('returns an empty list when no records were saved', () => {
    const { storage } = makeStorage();

    expect(loadRecords(storage)).toEqual([]);
    expect(storage.getItem).toHaveBeenCalledWith(RECORDS_KEY);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('reads valid records, including zero and fractional elapsed time', () => {
    const records: readonly GameRecord[] = [
      { attempts: 1, elapsedMs: 0, length: 2, base: 2 },
      { attempts: 2, elapsedMs: 1.5, length: 6, base: 8 },
      { attempts: 3, elapsedMs: 200, length: 4, base: 10 },
      { attempts: 4, elapsedMs: 500, length: 6, base: 16 },
    ];
    const { storage, values } = makeStorage();
    values.set(RECORDS_KEY, JSON.stringify(records));

    expect(loadRecords(storage)).toEqual(records);
  });

  it.each(['[]', 'null', '{}', '42', '"record"', '{broken'])(
    'returns an empty list for saved data %s',
    (saved) => {
      const { storage, values } = makeStorage();
      values.set(RECORDS_KEY, saved);

      expect(loadRecords(storage)).toEqual([]);
      expect(values.get(RECORDS_KEY)).toBe(saved);
      expect(storage.setItem).not.toHaveBeenCalled();
    },
  );

  it.each([
    { name: 'null', record: null },
    { name: 'a string', record: 'record' },
    { name: 'an array', record: [] },
    { name: 'missing fields', record: {} },
    { name: 'zero attempts', record: { ...makeRecord(), attempts: 0 } },
    { name: 'negative attempts', record: { ...makeRecord(), attempts: -1 } },
    { name: 'fractional attempts', record: { ...makeRecord(), attempts: 1.5 } },
    { name: 'unsafe attempts', record: { ...makeRecord(), attempts: 1e20 } },
    { name: 'negative time', record: { ...makeRecord(), elapsedMs: -1 } },
    { name: 'string time', record: { ...makeRecord(), elapsedMs: '1000' } },
    { name: 'missing time', record: { attempts: 2, length: 4, base: 10 } },
    { name: 'length below 2', record: { ...makeRecord(), length: 1 } },
    { name: 'length above 6', record: { ...makeRecord(), length: 7 } },
    { name: 'fractional length', record: { ...makeRecord(), length: 2.5 } },
    { name: 'unsupported base', record: { ...makeRecord(), base: 3 } },
    { name: 'string base', record: { ...makeRecord(), base: '10' } },
    {
      name: 'length above base',
      record: { ...makeRecord(), length: 3, base: 2 },
    },
  ])('discards $name but keeps valid entries', ({ record }) => {
    const valid = makeRecord();
    const { storage, values } = makeStorage();
    values.set(RECORDS_KEY, JSON.stringify([record, valid]));

    expect(loadRecords(storage)).toEqual([valid]);
  });

  it('rejects elapsed time that overflows to Infinity while parsing JSON', () => {
    const { storage, values } = makeStorage();
    values.set(
      RECORDS_KEY,
      '[{"attempts":1,"elapsedMs":1e999,"length":4,"base":10}]',
    );

    expect(loadRecords(storage)).toEqual([]);
  });

  it('ranks loaded records and returns only the best ten', () => {
    const records = Array.from({ length: 12 }, (_, index) =>
      makeRecord(12 - index),
    );
    const { storage, values } = makeStorage();
    const saved = JSON.stringify(records);
    values.set(RECORDS_KEY, saved);
    const result = loadRecords(storage);

    expect(result).toHaveLength(10);
    expect(result.map((record) => record.attempts)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(values.get(RECORDS_KEY)).toBe(saved);
  });

  it('uses elapsed time to rank equal attempt counts', () => {
    const slow = makeRecord(2, 3000);
    const fast = makeRecord(2, 1000);
    const { storage, values } = makeStorage();
    values.set(RECORDS_KEY, JSON.stringify([slow, fast]));

    expect(loadRecords(storage)).toEqual([fast, slow]);
  });

  it('returns an empty list when reading fails', () => {
    const { storage } = makeStorage();
    storage.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    expect(loadRecords(storage)).toEqual([]);
  });
});

describe('saveRecords', () => {
  it('saves JSON under the records key and leaves other keys unchanged', () => {
    const records = [makeRecord()];
    const { storage, values } = makeStorage();
    values.set('another-app', 'keep');

    expect(saveRecords(records, storage)).toBe(true);
    expect(JSON.parse(values.get(RECORDS_KEY) ?? 'null')).toEqual(records);
    expect(values.get('another-app')).toBe('keep');
  });

  it('saves an empty list', () => {
    const { storage, values } = makeStorage();

    expect(saveRecords([], storage)).toBe(true);
    expect(values.get(RECORDS_KEY)).toBe('[]');
  });

  it('saves only the best ten without changing the input', () => {
    const records = Object.freeze(
      Array.from({ length: 12 }, (_, index) =>
        Object.freeze(makeRecord(12 - index)),
      ),
    );
    const { storage } = makeStorage();

    expect(saveRecords(records, storage)).toBe(true);
    expect(loadRecords(storage).map((record) => record.attempts)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(records).toHaveLength(12);
    expect(records[0]?.attempts).toBe(12);
  });

  it('returns false when writing fails and keeps the saved data', () => {
    const { storage, values } = makeStorage();
    const saved = JSON.stringify([makeRecord(3)]);
    values.set(RECORDS_KEY, saved);
    storage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });

    expect(saveRecords([makeRecord(1)], storage)).toBe(false);
    expect(values.get(RECORDS_KEY)).toBe(saved);
  });

  it('loads saved records through a new storage consumer', () => {
    const first = makeStorage();
    const records = [makeRecord()];
    expect(saveRecords(records, first.storage)).toBe(true);

    const second = makeStorage(first.values);

    expect(loadRecords(second.storage)).toEqual(records);
  });
});
