import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

const explicitLayerAliasPatterns = [
  {
    group: ['@/app/*'],
    message: 'Use @app/* for app-layer imports.',
  },
  {
    group: ['@/features/*'],
    message: 'Use @features/* for feature-layer imports.',
  },
  {
    group: ['@/shared/*'],
    message: 'Use @shared/* for shared-layer imports.',
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: jsxA11y.configs.recommended.rules,
  },
  {
    files: ['e2e/**/*.{ts,tsx}', 'playwright.config.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: explicitLayerAliasPatterns,
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...explicitLayerAliasPatterns,
            {
              group: ['@app/*'],
              message:
                'Feature code must not import from the app routing layer.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...explicitLayerAliasPatterns,
            {
              group: ['@app/*'],
              message:
                'Shared code must not import from the app routing layer.',
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated artifacts:
    'coverage/**',
  ]),
  prettier,
]);

export default eslintConfig;
