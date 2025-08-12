import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import tsParser from '@typescript-eslint/parser'
import TsPlugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'

export default defineConfig([
  {
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // 👈 importante para resolver paths
      },
    },
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      js,
      '@typescript-eslint': TsPlugin,
      prettier,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/order': 'warn',
      'no-console': 'warn',
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  tseslint.configs.recommended,
])
