import type { GameRecord } from '../core/records.js';

export type RecordStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const RECORDS_KEY = 'bulls-and-cows.records';

export const loadRecords: (
  storage: RecordStorage,
) => readonly GameRecord[] = () => {
  throw new Error('Not implemented');
};

export const saveRecords: (
  records: readonly GameRecord[],
  storage: RecordStorage,
) => boolean = () => {
  throw new Error('Not implemented');
};
