import { execFileSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';

rmSync('build', { recursive: true, force: true });
execFileSync(
  process.execPath,
  ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'],
  { stdio: 'inherit' },
);
cpSync('index.html', 'build/index.html');
cpSync('styles', 'build/styles', { recursive: true });
