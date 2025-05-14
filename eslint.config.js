import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
	js.configs.recommended,

	// 🔽 Ignored files/folders
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'eslint.config.js',
			'babel.config.js',
			'commitlint.config.js',
			'jest.config.js',
			'tsconfig.json',
			'package.json',
			'pnpm-lock.yaml',
			'pnpmfile.cjs',
			'metro.config.js',
			'tailwind.config.js',
		],
	},

	// 🔽 Main config
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: '2022',
				sourceType: 'module',
				project: './tsconfig.json',
			},
			globals: {
				...globals.node,
				...globals.browser,
				React: 'readonly',
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			'react': reactPlugin,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			indent: ['error', 'tab'],
			eqeqeq: ['error', 'always'],
			'no-console': ['error'],
		},
	},
];
