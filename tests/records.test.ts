import { describe, expect, it } from 'vitest';
import {
  addRecord,
  createRecord,
  type GameRecord,
} from '../scripts/core/records.js';
import {
  createRound,
  submitGuess,
  type RoundState,
} from '../scripts/core/round-state.js';

function makeRecord(attempts: number, elapsedMs: number): GameRecord {
  return { attempts, elapsedMs, length: 4, base: 10 };
}

describe('createRecord', () => {
  it('records attempts, elapsed milliseconds and the winning settings', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);
    const first = submitGuess(round, '0245', 2000).state;
    const won = submitGuess(first, '0123', 4500).state;

    expect(createRecord(won)).toEqual({
      attempts: 2,
      elapsedMs: 3500,
      length: 4,
      base: 10,
    });
  });

  it('does not create a record for a round still being played', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);
    const playing = submitGuess(round, '0245', 2000).state;

    expect(createRecord(playing)).toBeNull();
  });

  it('does not create a record when the finish time is missing', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);
    const incomplete: RoundState = { ...round, status: 'won' };

    expect(createRecord(incomplete)).toBeNull();
  });

  it.each([
    { length: 2, base: 2, secret: '01' },
    { length: 4, base: 8, secret: '0123' },
    { length: 4, base: 16, secret: 'a1b2' },
  ])(
    'keeps length $length and base $base in the record',
    ({ length, base, secret }) => {
      const round = createRound({ length, base }, secret, 1000);
      const won = submitGuess(round, secret, 2000).state;

      expect(createRecord(won)).toEqual({
        attempts: 1,
        elapsedMs: 1000,
        length,
        base,
      });
    },
  );

  it('accepts a finish time of zero and a zero-duration round', () => {
    const round = createRound({ length: 2, base: 2 }, '01', 0);
    const won = submitGuess(round, '01', 0).state;

    expect(createRecord(won)).toEqual({
      attempts: 1,
      elapsedMs: 0,
      length: 2,
      base: 2,
    });
  });
});

describe('addRecord', () => {
  it('adds the first record to an empty list', () => {
    const record = makeRecord(2, 1500);

    expect(addRecord([], record)).toEqual([record]);
  });

  it('sorts by attempts first without changing the old list or entries', () => {
    const fourAttempts = Object.freeze(makeRecord(4, 100));
    const twoAttempts = Object.freeze(makeRecord(2, 5000));
    const threeAttempts = Object.freeze(makeRecord(3, 50));
    const records = Object.freeze([fourAttempts, twoAttempts]);
    const result = addRecord(records, threeAttempts);

    expect(result).toEqual([twoAttempts, threeAttempts, fourAttempts]);
    expect(result).not.toBe(records);
    expect(records).toEqual([fourAttempts, twoAttempts]);
  });

  it('sorts equal attempt counts by elapsed time', () => {
    const slow = makeRecord(3, 3000);
    const fast = makeRecord(3, 1000);
    const middle = makeRecord(3, 2000);

    expect(addRecord([slow, fast], middle)).toEqual([fast, middle, slow]);
  });

  it.each([
    { attempts: 1, expectedAttempts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { attempts: 20, expectedAttempts: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  ])(
    'keeps only the best ten after adding $attempts attempts',
    ({ attempts, expectedAttempts }) => {
      const records = Array.from({ length: 10 }, (_, index) =>
        makeRecord(index + 2, 1000),
      );
      const result = addRecord(records, makeRecord(attempts, 1000));

      expect(result).toHaveLength(10);
      expect(result.map((record) => record.attempts)).toEqual(expectedAttempts);
      expect(records).toHaveLength(10);
      expect(records[0]?.attempts).toBe(2);
    },
  );

  it('keeps equal results from separate rounds', () => {
    const first = makeRecord(2, 1000);
    const second = makeRecord(2, 1000);

    expect(addRecord([first], second)).toEqual([first, second]);
  });

  it('preserves the length and base of records from different settings', () => {
    const decimal = makeRecord(2, 1000);
    const binary: GameRecord = {
      attempts: 1,
      elapsedMs: 2000,
      length: 2,
      base: 2,
    };

    expect(addRecord([decimal], binary)).toEqual([binary, decimal]);
  });
});
