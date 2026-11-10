import { countPossibleSecrets } from '../core/count-possible-secrets.js';
import { createDigitValidator } from '../core/create-digit-validator.js';
import { generateSecret } from '../core/generate-secret.js';
import { addRecord, createRecord } from '../core/records.js';
import {
  createRound,
  submitGuess,
  type RoundState,
} from '../core/round-state.js';
import {
  loadRecords,
  saveRecords,
  type RecordStorage,
} from '../storage/records.js';
import type { GameView } from './game-view.js';
import {
  appendGuess,
  formatAttempts,
  formatSettings,
  formatTime,
  renderRecords,
} from './render-game.js';

function getStorage(): RecordStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function connectGame(view: GameView): void {
  const storage = getStorage();
  let records = storage ? loadRecords(storage) : [];
  let state: RoundState | null = null;
  let timer: number | null = null;
  const { settings, round } = view;

  function showStorageWarning(): void {
    view.records.message.textContent =
      'Your records could not be saved. They will stay here until you leave this page.';
  }

  function updateSettings(): void {
    const base = Number(settings.base.value);
    for (const option of settings.length.options) {
      option.disabled = Number(option.value) > base;
    }
    if (Number(settings.length.value) > base) {
      settings.length.value = String(base);
    }
    settings.possibilities.value = countPossibleSecrets(
      Number(settings.length.value),
      base,
    ).toLocaleString('en-US');
  }

  function updateTime(): void {
    if (state === null) return;
    round.elapsed.value = formatTime(
      (state.finishedAt ?? performance.now()) - state.startedAt,
    );
  }

  function stopTimer(): void {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startTimer(): void {
    stopTimer();
    updateTime();
    timer = window.setInterval(updateTime, 250);
  }

  function resetRoundView(): void {
    round.history.replaceChildren();
    round.emptyHistory.hidden = false;
    round.input.value = '';
    round.input.removeAttribute('aria-invalid');
    round.message.textContent = '';
    round.attempts.value = '0';
    round.elapsed.value = '0:00';
  }

  function startRound(event: SubmitEvent): void {
    event.preventDefault();
    if (state !== null) return;
    const length = Number(settings.length.value);
    const base = Number(settings.base.value);
    state = createRound(
      { length, base },
      generateSecret(length, base),
      performance.now(),
    );
    resetRoundView();
    settings.fieldset.disabled = true;
    settings.start.disabled = true;
    round.panel.hidden = false;
    round.summary.textContent = formatSettings(length, base);
    round.hint.textContent = `Enter ${length} different digits: ${'0123456789ABCDEF'.slice(0, base)}.`;
    round.input.maxLength = length;
    round.input.inputMode = base === 16 ? 'text' : 'numeric';
    round.input.disabled = false;
    round.submit.disabled = false;
    startTimer();
    round.input.focus();
  }

  function filterInput(): void {
    if (state === null || state.status !== 'playing') return;
    const isAllowed = createDigitValidator(state.settings.base);
    const { input } = round;
    const caret = input.selectionStart ?? input.value.length;
    const filtered = [...input.value]
      .filter(isAllowed)
      .slice(0, state.settings.length)
      .join('');
    if (filtered !== input.value) {
      const position = Math.min(
        [...input.value.slice(0, caret)].filter(isAllowed).length,
        filtered.length,
      );
      input.value = filtered;
      input.setSelectionRange(position, position);
    }
    input.removeAttribute('aria-invalid');
    round.message.textContent = '';
  }

  function finishRound(wonState: RoundState): void {
    stopTimer();
    updateTime();
    round.input.disabled = true;
    round.submit.disabled = true;
    round.message.textContent = `You found ${wonState.secret.toUpperCase()} in ${formatAttempts(wonState.history.length)}. Time: ${round.elapsed.value}.`;
    const record = createRecord(wonState);
    if (record !== null) {
      records = addRecord(records, record);
      renderRecords(view, records);
      if (storage === null || !saveRecords(records, storage)) {
        showStorageWarning();
      } else {
        view.records.message.textContent = '';
      }
    }
    round.newGame.focus();
  }

  function checkGuess(event: SubmitEvent): void {
    event.preventDefault();
    if (state === null || state.status !== 'playing') return;
    const result = submitGuess(state, round.input.value, performance.now());
    if (result.error !== null) {
      round.input.setAttribute('aria-invalid', 'true');
      round.message.textContent =
        result.error === 'duplicate'
          ? 'You have already tried this number. Try a different one.'
          : `Enter exactly ${state.settings.length} different digits from the allowed set.`;
      round.input.focus();
      round.input.select();
      return;
    }
    state = result.state;
    const entry = state.history.at(-1);
    if (entry) appendGuess(view, entry);
    round.attempts.value = String(state.history.length);
    round.input.value = '';
    round.input.removeAttribute('aria-invalid');
    round.message.textContent = '';
    updateTime();
    if (state.status === 'won') {
      finishRound(state);
    } else {
      round.input.focus();
    }
  }

  function newGame(): void {
    stopTimer();
    state = null;
    resetRoundView();
    round.panel.hidden = true;
    round.input.disabled = true;
    round.submit.disabled = true;
    settings.fieldset.disabled = false;
    settings.start.disabled = false;
    updateSettings();
    settings.length.focus();
  }

  settings.base.addEventListener('change', updateSettings);
  settings.length.addEventListener('change', updateSettings);
  settings.form.addEventListener('submit', startRound);
  round.input.addEventListener('input', filterInput);
  round.form.addEventListener('submit', checkGuess);
  round.newGame.addEventListener('click', newGame);
  window.addEventListener('pagehide', stopTimer);
  window.addEventListener('pageshow', () => {
    if (state?.status === 'playing') startTimer();
  });
  updateSettings();
  renderRecords(view, records);
  if (storage === null) showStorageWarning();
  settings.start.disabled = false;
}
