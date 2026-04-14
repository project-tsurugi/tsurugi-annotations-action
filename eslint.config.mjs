import github from 'eslint-plugin-github'
import jestPlugin from 'eslint-plugin-jest'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

const typescriptRules = {
  'eslint-comments/no-use': 'off',
  'import/no-namespace': 'off',
  'no-unused-vars': 'off',
  'prettier/prettier': 'off',
  camelcase: 'off',
  semi: 'off',
  'func-call-spacing': ['error', 'never'],
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/explicit-member-accessibility': ['error', {accessibility: 'no-public'}],
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/ban-ts-comment': ['error', {'ts-ignore': true}],
  '@typescript-eslint/explicit-function-return-type': ['error', {allowExpressions: true}],
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'typeLike',
      format: ['PascalCase']
    }
  ],
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/consistent-type-assertions': ['error', {assertionStyle: 'never'}],
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/prefer-for-of': 'warn',
  '@typescript-eslint/prefer-function-type': 'warn',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/require-array-sort-compare': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error',
  '@typescript-eslint/unbound-method': 'error'
}

export default [
  {
    ignores: ['dist/**', 'lib/**', 'node_modules/**']
  },
  github.getFlatConfigs().recommended,
  ...github.getFlatConfigs().typescript,
  {
    files: ['src/**/*.ts', '__tests__/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module',
        ecmaVersion: 'latest'
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      jest: jestPlugin
    },
    rules: typescriptRules
  },
  {
    files: ['__tests__/**/*.ts'],
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
]