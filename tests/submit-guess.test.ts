import { describe, expect, it } from 'vitest';
import {
  createRound,
  submitGuess,
  type RoundState,
} from '../scripts/core/round-state.js';

function freezeRound(round: RoundState): RoundState {
  Object.freeze(round.settings);
  round.history.forEach((entry) => Object.freeze(entry));
  Object.freeze(round.history);
  return Object.freeze(round);
}

describe('submitGuess', () => {
  it('adds a valid guess and keeps an unfinished round playing', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);
    const result = submitGuess(round, '0245', 2000);

    expect(result).toEqual({
      state: {
        ...round,
        history: [{ guess: '0245', bulls: 1, cows: 1 }],
      },
      error: null,
    });
    expect(result.state).not.toBe(round);
  });

  it('appends history without changing the old state, array or entries', () => {
    const round = freezeRound(
      createRound({ length: 4, base: 10 }, '0123', 1000),
    );
    const first = freezeRound(submitGuess(round, '0245', 2000).state);
    const second = submitGuess(first, '2301', 3000);

    expect(round.history).toEqual([]);
    expect(first.history).toEqual([{ guess: '0245', bulls: 1, cows: 1 }]);
    expect(second.error).toBeNull();
    expect(second.state).not.toBe(first);
    expect(second.state.history).not.toBe(first.history);
    expect(second.state).toEqual({
      ...first,
      history: [
        { guess: '0245', bulls: 1, cows: 1 },
        { guess: '2301', bulls: 0, cows: 4 },
      ],
    });
  });

  it('stores an accepted hex guess in lowercase', () => {
    const round = createRound({ length: 4, base: 16 }, 'a1b2', 1000);
    const result = submitGuess(round, 'A3C1', 2000);

    expect(result.error).toBeNull();
    expect(result.state.history).toEqual([
      { guess: 'a3c1', bulls: 1, cows: 1 },
    ]);
    expect(result.state.status).toBe('playing');
  });

  it('uses the binary round settings', () => {
    const round = createRound({ length: 2, base: 2 }, '01', 1000);
    const result = submitGuess(round, '10', 2000);

    expect(result.error).toBeNull();
    expect(result.state.history).toEqual([{ guess: '10', bulls: 0, cows: 2 }]);
    expect(result.state.status).toBe('playing');
    expect(result.state.finishedAt).toBeNull();
  });

  it('records the winning attempt and the supplied finish time', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);
    const first = submitGuess(round, '0245', 2000).state;
    const result = submitGuess(first, '0123', 3500);

    expect(result).toEqual({
      state: {
        ...first,
        status: 'won',
        finishedAt: 3500,
        history: [
          { guess: '0245', bulls: 1, cows: 1 },
          { guess: '0123', bulls: 4, cows: 0 },
        ],
      },
      error: null,
    });
    expect(first.status).toBe('playing');
    expect(first.finishedAt).toBeNull();
    expect(first.history).toHaveLength(1);
  });

  it('recognizes an uppercase hex winning guess', () => {
    const round = createRound({ length: 4, base: 16 }, 'a1b2', 1000);
    const result = submitGuess(round, 'A1B2', 2000);

    expect(result.error).toBeNull();
    expect(result.state.status).toBe('won');
    expect(result.state.finishedAt).toBe(2000);
    expect(result.state.history).toEqual([
      { guess: 'a1b2', bulls: 4, cows: 0 },
    ]);
  });

  it.each([
    { guess: '', length: 4, base: 10 },
    { guess: '012', length: 4, base: 10 },
    { guess: '01234', length: 4, base: 10 },
    { guess: '1123', length: 4, base: 10 },
    { guess: '01a3', length: 4, base: 10 },
    { guess: ' 123', length: 4, base: 10 },
    { guess: '012 ', length: 4, base: 10 },
    { guess: '-123', length: 4, base: 10 },
    { guess: '02', length: 2, base: 2 },
    { guess: '0187', length: 4, base: 8 },
    { guess: '01g3', length: 4, base: 16 },
    { guess: 'aA01', length: 4, base: 16 },
  ])(
    'rejects invalid "$guess" for length $length and base $base',
    ({ guess, length, base }) => {
      const round = freezeRound(
        createRound({ length, base }, '0123'.slice(0, length), 1000),
      );
      const result = submitGuess(round, guess, 2000);

      expect(result.error).toBe('invalid');
      expect(result.state).toBe(round);
      expect(round.history).toEqual([]);
      expect(round.finishedAt).toBeNull();
    },
  );

  it('rejects an already accepted guess without adding an attempt', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);
    const first = freezeRound(submitGuess(round, '0245', 2000).state);
    const result = submitGuess(first, '0245', 3000);

    expect(result.error).toBe('duplicate');
    expect(result.state).toBe(first);
    expect(first.history).toEqual([{ guess: '0245', bulls: 1, cows: 1 }]);
    expect(first.finishedAt).toBeNull();
  });

  it.each([
    { firstGuess: 'A3C1', repeatedGuess: 'a3c1' },
    { firstGuess: 'a3c1', repeatedGuess: 'A3C1' },
  ])(
    'treats $firstGuess and $repeatedGuess as the same guess',
    ({ firstGuess, repeatedGuess }) => {
      const round = createRound({ length: 4, base: 16 }, 'a1b2', 1000);
      const first = freezeRound(submitGuess(round, firstGuess, 2000).state);
      const result = submitGuess(first, repeatedGuess, 3000);

      expect(result.error).toBe('duplicate');
      expect(result.state).toBe(first);
      expect(first.history).toHaveLength(1);
    },
  );

  it.each(['0123', '0245', '', '1123'])(
    'rejects %j after victory and keeps the original finish time',
    (guess) => {
      const round = createRound({ length: 4, base: 10 }, '0123', 1000);
      const won = freezeRound(submitGuess(round, '0123', 2000).state);
      const result = submitGuess(won, guess, 3000);

      expect(result.error).toBe('finished');
      expect(result.state).toBe(won);
      expect(won.finishedAt).toBe(2000);
      expect(won.history).toEqual([{ guess: '0123', bulls: 4, cows: 0 }]);
    },
  );

  it('starts a fresh round without clearing the previous winning history', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);
    const won = freezeRound(submitGuess(round, '0123', 2000).state);
    const next = createRound({ length: 2, base: 2 }, '10', 5000);

    expect(next.status).toBe('playing');
    expect(next.history).toEqual([]);
    expect(next.finishedAt).toBeNull();
    expect(next.startedAt).toBe(5000);
    expect(won.history).toHaveLength(1);
    expect(won.finishedAt).toBe(2000);
  });
});
