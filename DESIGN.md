# Game design

The game uses small TypeScript functions. Game rules work without the page or
localStorage. Page events, the clock and storage access stay outside the core.

## Files and responsibilities

- `scripts/core/`: validation, comparison, secret generation, round updates and
  record ranking.
- `scripts/ui/game-view.ts`: create the page with DOM methods.
- `scripts/ui/game-controller.ts`: handle events, keep the current round, read
  the clock and call core and storage functions.
- `scripts/ui/render-game.ts`: show time, history entries and records.
- `scripts/storage/records.ts`: read and save records in localStorage.
- `scripts/main.ts`: create the page and connect the controller.

The UI imports the core. The core does not import the UI or storage.
No Store class or UI framework is needed for this one-page game.

## Game data

Secrets and guesses are strings. A number would lose the first zero in `0123`.
Hex letters are changed to lowercase before comparison and duplicate checks.

`RoundState` in `scripts/core/round-state.ts` is a plain object with:

- settings: length and base;
- secret;
- status: `playing` or `won`;
- history: an array of objects with guess, bulls and cows;
- startedAt and finishedAt: times in milliseconds. finishedAt is null until a win.

The controller uses null when there is no round and settings are available.
It reads `performance.now()` and passes times to core functions. Only elapsed
time is stored in a record, so a new page does not need the old clock values.

`submitGuess` returns `{ state, error }`. For an accepted guess, it creates a new
state and history array. Previous entries are kept. For an invalid or repeated
guess, it returns the same state and an error. It also rejects guesses after a win.
The UI chooses the message and appends a history row only for an accepted guess.

## Records and storage

`GameRecord` in `scripts/core/records.ts` contains attempts, elapsedMs, length
and base. `createRecord` returns a record only for a won round.
`addRecord` copies the array, sorts by attempts and then elapsed time, and keeps
the first 10. Different games may have equal results; both results can be kept.

`scripts/storage/records.ts` reads and writes JSON under `bulls-and-cows.records`.
It checks saved fields, drops invalid entries, sorts valid records and keeps 10.
Missing or broken data gives an empty list. Storage errors do not stop the game.
The controller keeps records in memory if saving fails and shows a message.

## Main algorithms

### generateSecret

File: `scripts/core/generate-secret.ts`.

Make an array of allowed digits. At each position, choose a random index from
the unused part of the array and swap the two digits. Take the first L digits.
This is a partial Fisher–Yates shuffle: a chosen digit cannot be chosen again.
The array is local to the call, so changing it does not change outside data.

The function takes `random` as an argument. Tests pass fixed values or a fixed
sequence. The browser uses the default Math.random.
The length must be valid for the base, and random must return a value from 0
up to, but not including, 1. The settings UI provides valid length/base pairs.

### evaluateGuess

File: `scripts/core/evaluate-guess.ts`.

Change both strings to lowercase. Use `filter` to count digits that match at the
same index: these are bulls. Build a Set of secret digits, then use `filter` to
count all shared digits. Cows are shared digits minus bulls.

For secret `0123` and guess `0245`, the result is 1 bull and 1 cow.
The function expects equal lengths and unique allowed digits. `submitGuess`
checks the guess before comparison.

### createDigitValidator and isValidGuess

Files: `scripts/core/create-digit-validator.ts` and `scripts/core/is-valid-guess.ts`.

`createDigitValidator(base)` builds a Set of allowed digits and returns a function
that checks one character. The returned function keeps access to that Set.
This is the function factory used for the task's currying requirement.

`isValidGuess` checks the length, calls `every` with that digit validator, and
uses a Set to detect repeated digits. Hex case is ignored, so `aA` is a repeat.
The same factory filters typed and pasted text in the controller.

### countPossibleSecrets

File: `scripts/core/count-possible-secrets.ts`.

For length 0, return 1. Otherwise return
`base * countPossibleSecrets(length - 1, base - 1)`.
Each chosen digit leaves one fewer digit for the next position.
For length 2 and base 10, this gives `10 * 9 = 90`. Leading zeroes are allowed.

A private Map stores results under a length/base key, such as `2:10`.
A repeated call returns the saved answer. This is memoization.
The cache changes inside the module, but the answer for a pair stays the same.

## Time and space complexity

L is the secret length. B is the number of allowed digits. Set and Map lookups
are treated as O(1) on average. The table includes returned strings and temporary
arrays. In this game L is at most 6 and B is at most 16.

| Function               | Time                                              | Extra space                                        | Why                                                                                                     |
| ---------------------- | ------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `generateSecret`       | O(B + L)                                          | O(B + L)                                           | Build B digits, make L swaps and return L digits.                                                       |
| `evaluateGuess`        | O(L)                                              | O(L)                                               | Build a Set and make a fixed number of passes over L digits.                                            |
| `isValidGuess`         | O(B + L)                                          | O(B + L)                                           | Build B allowed digits, check L digits and build a Set for repeats. A wrong length returns immediately. |
| `countPossibleSecrets` | O(L) for an uncached call; O(1) for a cached pair | O(L) for the uncached call; O(1) for a cached pair | Up to L recursive calls and new cache entries. A cached pair needs one lookup.                          |

The count cache is kept between calls, so its total size depends on how many
different length/base pairs have been requested, including recursive pairs.

## Clean code in this project

- **One responsibility:** `evaluateGuess` only compares digits.
  `loadRecords` and `saveRecords` in `scripts/storage/records.ts` handle storage.
  Page updates belong to the UI files.
- **Reuse a rule:** `createDigitValidator` is used in `isValidGuess` and
  `game-controller.ts`. Both checks accept the same digits.
- **Pass outside values in:** `generateSecret` accepts random; `createRound`
  and `submitGuess` accept times; storage functions accept getItem/setItem methods.
  Tests can use fixed values and a small test storage object.
- **Keep old data unchanged:** `submitGuess` copies state and history;
  `addRecord` copies records before sorting. Tests check the old values too.
- **Clear error paths:** `submitGuess` returns invalid, duplicate or finished
  before building a new state. The UI handles the message.
- **One named limit:** `RECORD_LIMIT` is shared by record ranking and the UI title.

## Tests

Vitest runs 200 tests for the core and storage. The five required functions have
test commits before implementation commits; the pairs are listed in README.md.
Tests use fixed random values, explicit timestamps and test storage objects.
They have their own inputs and assertions and do not depend on real time,
network access or another test's order.
