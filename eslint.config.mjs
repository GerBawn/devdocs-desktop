import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

/**
 * Flat ESLint 10 config (replaces xo@0.60 / ESLint 8).
 * Intentionally light on stylistic plugins so we do not force a full rename
 * pass on the existing CommonJS Electron app.
 */
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'app/node_modules/**',
      '**/*.html',
      '**/*.css',
      'package-lock.json'
    ]
  },
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      'guard-for-in': 'off',
      'max-params': ['error', 5],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  }
]
