import { RECORD_LIMIT } from '../core/records.js';

function element<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[Tag] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function selectField(
  id: string,
  title: string,
  options: readonly (readonly [string, string])[],
  selected: string,
) {
  const field = element('div', 'field');
  const label = element('label', 'field-label', title);
  label.htmlFor = id;
  const select = element('select', 'field-input');
  select.id = id;
  select.name = id;
  options.forEach(([value, text]) => {
    const option = element('option', undefined, text);
    option.value = value;
    select.append(option);
  });
  select.value = selected;
  field.append(label, select);
  return { field, select };
}

function stat(title: string, initial: string) {
  const item = element('div', 'stat');
  const label = element('span', 'stat-label', title);
  const value = element('output', 'stat-value', initial);
  item.append(label, value);
  return { item, value };
}

export function createGameView() {
  const app = element('main', 'app');
  const header = element('header', 'app-header');
  const eyebrow = element('p', 'eyebrow', 'A little logic. A good guess.');
  const title = element('h1', 'app-title', 'Bulls and Cows');
  const intro = element(
    'p',
    'app-intro',
    'Find the secret number. Each guess gives you a new clue.',
  );
  header.append(eyebrow, title, intro);

  const layout = element('div', 'layout');
  const playArea = element('div', 'play-area');
  const settingsPanel = element('section', 'card');
  const settingsTitle = element('h2', 'card-title', 'Choose your round');
  settingsTitle.id = 'settings-title';
  settingsPanel.setAttribute('aria-labelledby', settingsTitle.id);
  const settingsDescription = element(
    'p',
    'muted',
    'Pick a length and number base. Every digit in the secret is unique.',
  );
  const settingsForm = element('form', 'settings-form');
  settingsForm.method = 'post';
  const fieldset = element('fieldset', 'settings-fields');
  const legend = element('legend', 'visually-hidden', 'Round settings');
  const length = selectField(
    'secret-length',
    'Number of digits',
    ['2', '3', '4', '5', '6'].map(
      (value) => [value, `${value} digits`] as const,
    ),
    '4',
  );
  const base = selectField(
    'number-base',
    'Number base',
    [
      ['2', 'Binary · 0–1'],
      ['8', 'Octal · 0–7'],
      ['10', 'Decimal · 0–9'],
      ['16', 'Hex · 0–9, A–F'],
    ],
    '10',
  );
  fieldset.append(legend, length.field, base.field);
  const possibilities = stat('Possible secrets', '—');
  const start = element('button', 'button button-primary', 'Start game');
  start.type = 'submit';
  start.disabled = true;
  settingsForm.append(fieldset, possibilities.item, start);
  settingsPanel.append(settingsTitle, settingsDescription, settingsForm);

  const roundPanel = element('section', 'card');
  roundPanel.hidden = true;
  const roundHeader = element('div', 'section-header');
  const roundTitle = element('h2', 'card-title', 'Make your guess');
  roundTitle.id = 'round-title';
  roundPanel.setAttribute('aria-labelledby', roundTitle.id);
  const summary = element('span', 'badge');
  roundHeader.append(roundTitle, summary);
  const stats = element('div', 'stats');
  const attempts = stat('Attempts', '0');
  const elapsed = stat('Time', '0:00');
  elapsed.value.setAttribute('aria-live', 'off');
  stats.append(attempts.item, elapsed.item);
  const guessForm = element('form', 'guess-form');
  guessForm.method = 'post';
  guessForm.noValidate = true;
  const guessLabel = element('label', 'field-label', 'Your guess');
  guessLabel.htmlFor = 'guess';
  const input = element('input', 'field-input guess-input');
  input.type = 'text';
  input.id = 'guess';
  input.name = 'guess';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.maxLength = 6;
  input.inputMode = 'numeric';
  input.disabled = true;
  input.setAttribute('aria-describedby', 'guess-hint guess-message');
  const hint = element('p', 'muted field-hint');
  hint.id = 'guess-hint';
  const submit = element('button', 'button button-primary', 'Check guess');
  submit.type = 'submit';
  submit.disabled = true;
  const message = element('p', 'message');
  message.id = 'guess-message';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  guessForm.append(guessLabel, input, hint, submit, message);
  const historyTitle = element('h3', 'list-title', 'Your guesses');
  const history = element('ol', 'history-list');
  history.setAttribute('aria-label', 'Guess history');
  const emptyHistory = element('p', 'empty-state', 'No guesses yet.');
  const newGame = element('button', 'button button-secondary', 'New game');
  newGame.type = 'button';
  roundPanel.append(
    roundHeader,
    stats,
    guessForm,
    historyTitle,
    emptyHistory,
    history,
    newGame,
  );
  playArea.append(settingsPanel, roundPanel);

  const sidebar = element('aside', 'sidebar');
  const rules = element('section', 'card rules-card');
  const rulesTitle = element('h2', 'card-title', 'Read the clues');
  const rulesList = element('ul', 'rules-list');
  const bullRule = element('li', 'rule');
  const bullLabel = element('strong', 'clue clue-bull', 'Bull');
  bullRule.append(
    bullLabel,
    element('span', undefined, 'Right digit, right place.'),
  );
  const cowRule = element('li', 'rule');
  const cowLabel = element('strong', 'clue clue-cow', 'Cow');
  cowRule.append(
    cowLabel,
    element('span', undefined, 'Right digit, different place.'),
  );
  rulesList.append(bullRule, cowRule);
  rules.append(
    rulesTitle,
    rulesList,
    element(
      'p',
      'muted',
      'Leading zeroes count. Hex letters can use either case.',
    ),
  );
  const recordsPanel = element('section', 'card');
  const recordsTitle = element('h2', 'card-title', `Top ${RECORD_LIMIT}`);
  const recordsDescription = element(
    'p',
    'muted',
    'Fewest attempts first. Fastest time breaks a tie.',
  );
  const records = element('ol', 'records-list');
  records.setAttribute('aria-label', 'Best results');
  const emptyRecords = element(
    'p',
    'empty-state',
    'Your first win starts the list.',
  );
  const storageMessage = element('p', 'message');
  storageMessage.setAttribute('role', 'status');
  recordsPanel.append(
    recordsTitle,
    recordsDescription,
    emptyRecords,
    records,
    storageMessage,
  );
  sidebar.append(rules, recordsPanel);
  layout.append(playArea, sidebar);
  const footer = element(
    'footer',
    'app-footer',
    'No guess limit. Keep following the clues.',
  );
  app.append(header, layout, footer);

  return {
    element: app,
    settings: {
      panel: settingsPanel,
      form: settingsForm,
      fieldset,
      length: length.select,
      base: base.select,
      possibilities: possibilities.value,
      start,
    },
    round: {
      panel: roundPanel,
      form: guessForm,
      input,
      submit,
      summary,
      hint,
      message,
      attempts: attempts.value,
      elapsed: elapsed.value,
      history,
      emptyHistory,
      newGame,
    },
    records: { list: records, empty: emptyRecords, message: storageMessage },
  };
}

export type GameView = ReturnType<typeof createGameView>;
