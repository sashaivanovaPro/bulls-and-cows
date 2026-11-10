import type { RoundState } from './round-state.js';

export interface GameRecord {
  readonly attempts: number;
  readonly elapsedMs: number;
  readonly length: number;
  readonly base: number;
}

export const RECORD_LIMIT = 10;

export const createRecord: (round: RoundState) => GameRecord | null = () => {
  throw new Error('Not implemented');
};

export const addRecord: (
  records: readonly GameRecord[],
  record: GameRecord,
) => readonly GameRecord[] = () => {
  throw new Error('Not implemented');
};
