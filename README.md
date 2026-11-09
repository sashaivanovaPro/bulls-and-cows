# Bulls and Cows

A TypeScript implementation of the RS School Bulls and Cows task.

## Status

Project setup is in progress. Gameplay, UI, deployment and core tests are not implemented yet.

## Requirements

- Node.js 22.22.1 or newer in the Node.js 22 release line.
- npm 10 or newer.

## Development

```sh
npm ci
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

`npm run format` formats supported project files.
`npm run build` compiles TypeScript to ES modules in `build/scripts/`.
There is no playable page in the current scaffold.

The initial test command accepts an empty test suite. Remove `--passWithNoTests`
when the first core tests are added.

## TDD workflow

For each required core function, commit failing tests before its implementation.
The pre-commit hook runs only lint-staged (ESLint and Prettier); the pre-push hook
runs the test suite. Push a red/green commit pair together after tests pass.

No gameplay dependencies or UI framework are used.
