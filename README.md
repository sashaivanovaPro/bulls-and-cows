# Bulls and Cows

A number guessing game built with TypeScript and browser DOM methods.
Find the secret number using the bulls and cows from your previous guesses.

[RS School task](https://github.com/rolling-scopes-school/tasks/blob/master/fullstack-engineering/tasks/bulls-and-cows/README.md)
· [Design and algorithms](DESIGN.md)

[Play the game](https://bullsandcowsrs.netlify.app/)

## How to play

1. Choose 2–6 digits and a number base: binary, octal, decimal or hexadecimal.
   Binary allows only 2 digits. Every digit in the secret is different.
2. Start the game. Settings stay locked until you choose New game.
3. Enter a guess. A bull means the right digit in the right place.
   A cow means the right digit in another place.
4. Keep guessing until all digits are bulls. There is no attempt limit.

Leading zeroes are allowed. Hex letters can be uppercase or lowercase.
Invalid or repeated guesses do not count as attempts.

The top 10 results are sorted by attempts, then by time. Each result shows its
length and base. Records are saved in localStorage in the current browser.
If saving is blocked, you can still play and see records until you leave the page.

## Requirements

- Node.js 22.22.1 or newer in the Node.js 22 release line.
- npm 10 or newer.

## Development

```sh
npm ci
npm run build
npm run preview
```

Open the local URL printed by preview. Run the build again and refresh the page
when source files change. There is no automatic rebuild or live reload.
To use another port, run `npm run preview -- 4186`.

## Checks

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
```

There are 200 Vitest tests for digit validation, guess validation and comparison,
secret generation, possible secret counts, round updates, records and storage.
`npm run test:watch` runs them in watch mode.

`npm run format` formats supported source files. `index.html` is formatted by hand
to keep void tags without closing slashes, as required by the project style guide.

The pre-commit hook runs only lint-staged. The pre-push hook runs `npm test`.

## Build and deployment

`npm run build` uses tsc to compile TypeScript and copies HTML/CSS into `build/`:

```text
build/
  index.html
  scripts/
  styles/
```

Publish the contents of this folder on a static host. For a manual folder upload,
choose `build/`: its root contains `index.html`. Do not upload the project folder
or node_modules. Generated build files are ignored by Git.

Use an HTTP server for local checks; opening index.html with a file URL does not
serve the JavaScript modules correctly.

## Project files

- `scripts/core/`: game rules, round state and record ranking, without DOM access.
- `scripts/ui/`: create page elements, handle events and show results.
- `scripts/storage/`: load and save records.
- `scripts/main.ts`: create the page and connect the game.
- `tests/`: core and storage tests.
- `styles/`: responsive CSS.
- `tools/`: build and local preview scripts.

## TDD workflow

Each required core function has a separate test commit before its implementation:

| Function               | Tests     | Implementation |
| ---------------------- | --------- | -------------- |
| `createDigitValidator` | `ff96fa5` | `1b3bd75`      |
| `isValidGuess`         | `1926273` | `15958ee`      |
| `evaluateGuess`        | `155a24a` | `1985aa6`      |
| `generateSecret`       | `4337056` | `b3dac78`      |
| `countPossibleSecrets` | `9673b76` | `452b1c3`      |

No UI framework, bundler or gameplay library is used.
