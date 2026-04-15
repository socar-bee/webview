import nextConfig from 'eslint-config-next'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  {
    ignores: ['.next/', 'node_modules/', '*.config.mjs', '*.config.js']
  },

  ...nextConfig,

  ...tseslint.configs.recommended,

  ...tanstackQuery.configs['flat/recommended'],

  prettierConfig,

  {
    plugins: {
      import: importPlugin
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [['builtin', 'external'], 'index', 'object', 'type', 'parent', 'internal'],
          pathGroups: [
            { pattern: '@/shared/components/**', group: 'index' },
            { pattern: '@/shared/hooks/**', group: 'index' },
            { pattern: '@/shared/lib/**', group: 'object' },
            { pattern: '@/shared/stores/**', group: 'type' },
            { pattern: '@/shared/types/**', group: 'parent' }
          ],
          pathGroupsExcludedImportTypes: [
            '@/shared/components/**',
            '@/shared/hooks/**',
            '@/shared/lib/**',
            '@/shared/stores/**',
            '@/shared/types/**'
          ],
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn'
    }
  }
)
