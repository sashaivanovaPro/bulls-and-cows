import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['build/**', 'coverage/**', '.vitest/**'] },
  {
    files: ['**/*.{js,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ['scripts/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
);
