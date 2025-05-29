import { defineConfig, globalIgnores } from 'eslint/config';
import nx from '@nx/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  globalIgnores(['**/*', '**/node_modules', '**/dist', '**/android', '**/ios']),
  {
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
    ],

    plugins: {
      '@nx': nx,
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
    },

    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'simple-import-sort/imports': 'error',
      'react/jsx-sort-props': 'warn',
      'react/prop-types': 'off',
      'react/self-closing-comp': 'warn',

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^ignored',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],

      // Import rules
      'import/order': [
        'warn',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
      'import/no-duplicates': ['warn', { 'prefer-inline': true }],

      'no-unexpected-multiline': 'error',
      'no-warning-comments': [
        'error',
        {
          terms: ['FIXME'],
          location: 'anywhere',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: ['plugin:@nx/typescript'],

    rules: {
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['cmdk-input-wrapper'],
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    extends: ['plugin:@nx/javascript'],
    rules: {},
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {},
  },
]);
