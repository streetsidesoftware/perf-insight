// @ts-check

import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    ...tsEslint.configs.recommended,
    {
        ignores: ['**/dist/**', '**/node_modules/**', '/*/*/coverage/**'],
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        rules: {
            // `util.styleText` is stable from Node 22.13 and 23.5. The `engines` range also covers Node 23.0
            // to 23.4, where it works but was still marked experimental.
            'n/no-unsupported-features/node-builtins': ['error', { ignores: ['util.styleText'] }],
        },
    },
    {
        files: ['**/*.{ts,cts,mts,tsx}'],
        rules: {
            // Note: you must disable the base rule as it can report incorrect errors
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
    {
        files: ['**/*.test.{ts,cts,mts,tsx}'],
        rules: {
            'n/no-extraneous-import': 'off',
        },
    },
);
