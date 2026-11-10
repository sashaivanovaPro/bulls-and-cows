import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../scripts/core/evaluate-guess.js';

describe('evaluateGuess', () => {
  it.each([
    { secret: '0123', guess: '4567', bulls: 0, cows: 0 },
    { secret: '0123', guess: '0123', bulls: 4, cows: 0 },
    { secret: '0123', guess: '2301', bulls: 0, cows: 4 },
    { secret: '0123', guess: '0245', bulls: 1, cows: 1 },
    { secret: '0123', guess: '0132', bulls: 2, cows: 2 },
    { secret: '0123', guess: '0456', bulls: 1, cows: 0 },
    { secret: '0123', guess: '4560', bulls: 0, cows: 1 },
    { secret: '01', guess: '01', bulls: 2, cows: 0 },
    { secret: '01', guess: '10', bulls: 0, cows: 2 },
    { secret: '012', guess: '201', bulls: 0, cows: 3 },
    { secret: '01234', guess: '01243', bulls: 3, cows: 2 },
    { secret: '012345', guess: '543210', bulls: 0, cows: 6 },
    { secret: 'abcdef', guess: 'abcdef', bulls: 6, cows: 0 },
    { secret: 'a1b2', guess: 'A1B2', bulls: 4, cows: 0 },
    { secret: 'A1B2', guess: 'a1b2', bulls: 4, cows: 0 },
    { secret: 'a1b2', guess: 'A2B1', bulls: 2, cows: 2 },
    { secret: 'A1b2', guess: '2Ba1', bulls: 0, cows: 4 },
    { secret: 'a1b2', guess: 'C3D4', bulls: 0, cows: 0 },
    { secret: 'a1b2', guess: 'A3C1', bulls: 1, cows: 1 },
  ])(
    '$secret vs $guess: $bulls bulls and $cows cows',
    ({ secret, guess, bulls, cows }) => {
      expect(evaluateGuess(secret, guess)).toEqual({ bulls, cows });
    },
  );
});
