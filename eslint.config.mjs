import nx from '@nx/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

const ERROR = 'error';
const WARN = 'warn';

const vitestFiles = ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'];
const testFiles = ['**/tests/**', '**/#tests/**', ...vitestFiles];
const playwrightFiles = ['**/tests/e2e/**'];

export default defineConfig([
  globalIgnores([
    '**/node_modules',
    '**/dist',
    '**/android',
    '**/ios',
    '**/.cache/**',
    '**/node_modules/**',
    '**/build/**',
    '**/public/**',
    '**/*.json',
    '**/playwright-report/**',
    '**/server-build/**',
    '**/dist/**',
    '**/coverage/**',
    '**/dist-ssr/**',
    '**/*.local',
    '**/logs/**',
    '**/*.log',
    '**/.DS_Store',
    '**/*.suo',
    '**/*.ntvs*',
    '**/*.njsproj',
    '**/*.sln',
    '**/*.sw?',
    '**/.idea/**',
    '**/.vscode/**',
    '!**/.vscode/extensions.json',
    '**/*.config.{js,mjs,cjs,ts}',
    '**/scripts/translations.ts',
    '**/scripts/setupTests.ts',
  ]),

  { plugins: { '@nx': nx, 'jsx-a11y': jsxA11y } },
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
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      react: (await import('eslint-plugin-react')).default,
    },
    languageOptions: {
      parser: (await import('typescript-eslint')).parser,
      parserOptions: {
        jsx: true,
      },
    },
    rules: {
      'react/jsx-key': WARN,
    },
  },
  {
    files: ['**/*.ts?(x)', '**/*.js?(x)'],
    plugins: {
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
    },
    rules: {
      'react-hooks/rules-of-hooks': ERROR,
      'react-hooks/exhaustive-deps': WARN,
    },
  },

  // all files
  {
    plugins: {
      import: (await import('eslint-plugin-import-x')).default,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unexpected-multiline': ERROR,
      'no-warning-comments': [
        ERROR,
        { terms: ['FIXME'], location: 'anywhere' },
      ],
      'import/no-duplicates': [WARN, { 'prefer-inline': true }],
      'import/order': [
        WARN,
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '#*/**', group: 'internal' }],
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
    },
  },

  // JS and JSX files
  {
    files: ['**/*.js?(x)'],
    rules: {
      'no-undef': ERROR,
      'no-unused-vars': [
        WARN,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^ignored',
        },
      ],
    },
  },

  // all files
  {
    plugins: {
      import: (await import('eslint-plugin-import-x')).default,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unexpected-multiline': ERROR,
      'no-warning-comments': [
        ERROR,
        { terms: ['FIXME'], location: 'anywhere' },
      ],
      'import/no-duplicates': [WARN, { 'prefer-inline': true }],
      'import/order': [
        WARN,
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '#*/**', group: 'internal' }],
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
    },
  },

  {
    files: ['**/*.ts?(x)'],
    languageOptions: {
      parser: (await import('typescript-eslint')).parser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': (await import('typescript-eslint')).plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        WARN,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^ignored',
        },
      ],
      'import/consistent-type-specifier-style': [WARN, 'prefer-inline'],
      '@typescript-eslint/consistent-type-imports': [
        WARN,
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],

      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],

      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  {
    files: ['**/*.ts?(x)', '**/*.js?(x)'],
    ignores: testFiles,
    rules: {
      'no-restricted-imports': [
        ERROR,
        {
          patterns: [
            {
              group: testFiles,
              message: 'Do not import test files in source files',
            },
          ],
        },
      ],
    },
  },
  // react testing library
  {
    files: testFiles,
    ignores: [...playwrightFiles],
    plugins: {
      'testing-library': (await import('eslint-plugin-testing-library'))
        .default,
    },
    rules: {
      'testing-library/no-unnecessary-act': [ERROR, { isStrict: false }],
      'testing-library/no-wait-for-side-effects': ERROR,
      'testing-library/prefer-find-by': ERROR,
    },
  },

  // jest dom
  // {
  //   files: testFiles,
  //   ignores: [...playwrightFiles],
  //   plugins: {
  //     'jest-dom': (await import('eslint-plugin-jest-dom')).default,
  //   },
  //   rules: {
  //     'jest-dom/prefer-checked': ERROR,
  //     'jest-dom/prefer-enabled-disabled': ERROR,
  //     'jest-dom/prefer-focus': ERROR,
  //     'jest-dom/prefer-required': ERROR,
  //   },
  // },

  //vitest
  {
    files: testFiles,
    ignores: [...playwrightFiles],
    plugins: {
      vitest: (await import('@vitest/eslint-plugin')).default,
    },
    rules: {
      // you don't want the editor to autofix this, but we do want to be
      // made aware of it
      'vitest/no-focused-tests': [WARN, { fixable: false }],
      'vitest/no-import-node-test': ERROR,
      'vitest/prefer-comparison-matcher': ERROR,
      'vitest/prefer-equality-matcher': ERROR,
      'vitest/prefer-to-be': ERROR,
      'vitest/prefer-to-contain': ERROR,
      'vitest/prefer-to-have-length': ERROR,
      'vitest/valid-expect-in-promise': ERROR,
      'vitest/valid-expect': ERROR,
    },
  },
]);
