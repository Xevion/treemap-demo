// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.git/**',
      '.husky/**',
      '.vscode/**',
      '*.min.js',
      '*.bundle.js',
      'coverage/**',
      'build/**',
      'out/**',
    ],
  }
);
