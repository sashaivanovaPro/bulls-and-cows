import { describe, expect, it } from 'vitest';
import { createRound } from '../scripts/core/round-state.js';

describe('createRound', () => {
  it('starts a playing round with an empty history and no finish time', () => {
    const round = createRound({ length: 4, base: 10 }, '0123', 1000);

    expect(round).toEqual({
      settings: { length: 4, base: 10 },
      secret: '0123',
      status: 'playing',
      history: [],
      startedAt: 1000,
      finishedAt: null,
    });
  });

  it('stores hex letters in lowercase', () => {
    const round = createRound({ length: 4, base: 16 }, 'A1B2', 1000);

    expect(round.secret).toBe('a1b2');
  });

  it('keeps a settings snapshot when the input object changes', () => {
    const settings = { length: 4, base: 10 };
    const round = createRound(settings, '0123', 1000);

    expect(round.settings).not.toBe(settings);
    settings.length = 2;
    settings.base = 2;

    expect(round.settings).toEqual({ length: 4, base: 10 });
  });

  it('creates a new round without changing the previous one', () => {
    const first = createRound({ length: 4, base: 10 }, '0123', 1000);
    const second = createRound({ length: 2, base: 2 }, '10', 5000);

    expect(second).not.toBe(first);
    expect(first).toMatchObject({
      settings: { length: 4, base: 10 },
      secret: '0123',
      startedAt: 1000,
    });
    expect(second).toEqual({
      settings: { length: 2, base: 2 },
      secret: '10',
      status: 'playing',
      history: [],
      startedAt: 5000,
      finishedAt: null,
    });
  });
});
