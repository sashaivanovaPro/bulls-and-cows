import type { GameRecord } from '../core/records.js';
import type { GuessEntry } from '../core/round-state.js';
import type { GameView } from './game-view.js';

export function formatTime(elapsedMs: number): string {
  const seconds = Math.floor(elapsedMs / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function formatAttempts(attempts: number): string {
  return `${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`;
}

export function formatSettings(length: number, base: number): string {
  return `${length} digits · base ${base}`;
}

function span(className: string, text: string): HTMLSpanElement {
  const node = document.createElement('span');
  node.className = className;
  node.textContent = text;
  return node;
}

export function appendGuess(view: GameView, entry: GuessEntry): void {
  const row = document.createElement('li');
  row.className = 'history-row';
  const clues = span('clues', '');
  clues.append(
    span('clue clue-bull', `${entry.bulls} bulls`),
    span('clue clue-cow', `${entry.cows} cows`),
  );
  row.append(span('guess-value', entry.guess.toUpperCase()), clues);
  view.round.history.append(row);
  view.round.emptyHistory.hidden = true;
}

export function renderRecords(
  view: GameView,
  records: readonly GameRecord[],
): void {
  const rows = records.map((record, index) => {
    const row = document.createElement('li');
    row.className = 'record-row';
    row.append(
      span(
        'record-result',
        `${index + 1}. ${formatAttempts(record.attempts)} · ${formatTime(record.elapsedMs)}`,
      ),
      span('record-settings', formatSettings(record.length, record.base)),
    );
    return row;
  });
  view.records.list.replaceChildren(...rows);
  view.records.empty.hidden = records.length > 0;
}
