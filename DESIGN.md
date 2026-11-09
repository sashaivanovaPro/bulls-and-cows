# Game plan

Only the project tools are ready. The game is not written yet.
This is a plan. Update it after the game works.

## Folders

- `scripts/main.ts` — start the app and connect its parts.
- `scripts/core/` — game rules and calculations.
- `scripts/ui/` — create HTML elements and handle user input.
- `scripts/storage/` — read and save records in localStorage.
- `styles/` — CSS files.
- `tests/` — tests for the game rules.

Game functions must work without the page or localStorage. This makes them
simple to test. Use TypeScript and tsc for the app, and Vitest for tests.

## Game data

Keep the secret and each guess as strings. A number would lose the first zero
in a secret like `0123`. Change hex letters to lowercase before checking them.

Use an object for the game state. It will hold:

- settings: length and base;
- the secret;
- status: not started, playing or won;
- an array of guesses and their bulls/cows;
- start and finish times.

For each new guess, create a new history array and a new state object.
Do not change old entries. Do not add the same guess twice.

Save records in localStorage. Each record needs the number of guesses, time,
length and base. Sort by guesses first, then by time. Show the settings next
to each record.

## Main functions

### generateSecret

Make a list of allowed digits. Pick a random digit from the list.
Swap it with the first available digit, then move to the next position.
This keeps chosen digits out of the next pick, so they cannot repeat.
Stop when the secret has the required length.

Pass the random function as an argument. Tests can then use a fixed sequence
of values instead of real random values.

### evaluateGuess

Use array methods to compare the guess with the secret.
Count digits in the correct position: these are bulls.
Use a Set of secret digits to count all shared digits.
Cows are shared digits minus bulls. Both inputs must have unique digits.

### createDigitValidator and isValidGuess

`createDigitValidator(base)` returns a function that checks one character.
Use it both when typing and when checking the full guess.

`isValidGuess` checks the length, allowed digits and repeated digits.
Use a Set to check for repeats: its size must match the guess length.
Uppercase and lowercase hex letters count as the same digit.

### countPossibleSecrets

Use recursion. For length 0, return 1.
Otherwise, multiply base by the result for length - 1 and base - 1.
For example, length 2 and base 10 gives `10 * 9 = 90`.

Save results for each length/base pair. Return the saved result when the same
pair is requested again. This is memoization.

## Time complexity

L is the secret length. B is the number of allowed digits.
These estimates assume Set checks take O(1) on average.

| Function               | Time                                            | Why                                                                           |
| ---------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `generateSecret`       | O(B + L)                                        | Make a list of B digits, then pick L digits.                                  |
| `evaluateGuess`        | O(L)                                            | Read each digit a fixed number of times.                                      |
| `isValidGuess`         | O(B + L)                                        | Prepare B allowed digits, then check L input digits.                          |
| `countPossibleSecrets` | O(L) on the first call; O(1) for a saved result | The first call makes L recursive steps. Later calls can use the saved answer. |

Check these estimates against the final code.

## Clean code

Plan for the code:

- Give functions clear names, like `isValidGuess` and `evaluateGuess`.
- Keep game rules in `scripts/core/` and page updates in `scripts/ui/`.
- Reuse `createDigitValidator` for typing and full-guess checks.
- Keep localStorage code in `scripts/storage/`.

Add exact file names and examples here after implementation.

## Work order

For each required function, write and commit failing tests first.
Then write the function, run the tests and commit the working code.

Start with the digit validator, then guess validation, guess comparison,
secret generation and the number of possible secrets.

After that, add the page, game state updates, timer and records.
Check the finished game on the deployed page.
