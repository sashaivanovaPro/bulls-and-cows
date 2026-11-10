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

export const submitGuess: (
  state: RoundState,
  guess: string,
  submittedAt: number,
) => SubmitGuessResult = () => {
  throw new Error('Not implemented');
};
