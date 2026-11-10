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

export const createRound: (
  settings: RoundSettings,
  secret: string,
  startedAt: number,
) => RoundState = () => {
  throw new Error('Not implemented');
};
