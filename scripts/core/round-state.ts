import { evaluateGuess } from './evaluate-guess.js';
import { isValidGuess } from './is-valid-guess.js';

export interface RoundSettings {
  readonly length: number;
  readonly base: number;
}

export interface GuessEntry {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
}

export interface RoundState {
  readonly settings: RoundSettings;
  readonly secret: string;
  readonly status: 'playing' | 'won';
  readonly history: readonly GuessEntry[];
  readonly startedAt: number;
  readonly finishedAt: number | null;
}

export function createRound(
  settings: RoundSettings,
  secret: string,
  startedAt: number,
): RoundState {
  return {
    settings: { ...settings },
    secret: secret.toLowerCase(),
    status: 'playing',
    history: [],
    startedAt,
    finishedAt: null,
  };
}

export interface SubmitGuessResult {
  readonly state: RoundState;
  readonly error: 'invalid' | 'duplicate' | 'finished' | null;
}

export function submitGuess(
  state: RoundState,
  guess: string,
  submittedAt: number,
): SubmitGuessResult {
  if (state.status === 'won') {
    return { state, error: 'finished' };
  }

  const normalizedGuess = guess.toLowerCase();
  const { length, base } = state.settings;

  if (!isValidGuess(normalizedGuess, length, base)) {
    return { state, error: 'invalid' };
  }

  if (state.history.some((entry) => entry.guess === normalizedGuess)) {
    return { state, error: 'duplicate' };
  }

  const result = evaluateGuess(state.secret, normalizedGuess);
  const hasWon = result.bulls === length;

  return {
    state: {
      ...state,
      status: hasWon ? 'won' : 'playing',
      history: [...state.history, { guess: normalizedGuess, ...result }],
      finishedAt: hasWon ? submittedAt : null,
    },
    error: null,
  };
}
