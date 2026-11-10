import type { RoundState } from './round-state.js';

export interface GameRecord {
  readonly attempts: number;
  readonly elapsedMs: number;
  readonly length: number;
  readonly base: number;
}

export const RECORD_LIMIT = 10;

export function createRecord(round: RoundState): GameRecord | null {
  if (round.status !== 'won' || round.finishedAt === null) {
    return null;
  }

  return {
    attempts: round.history.length,
    elapsedMs: round.finishedAt - round.startedAt,
    length: round.settings.length,
    base: round.settings.base,
  };
}

export function addRecord(
  records: readonly GameRecord[],
  record: GameRecord,
): readonly GameRecord[] {
  return [...records, record]
    .sort(
      (first, second) =>
        first.attempts - second.attempts || first.elapsedMs - second.elapsedMs,
    )
    .slice(0, RECORD_LIMIT);
}
