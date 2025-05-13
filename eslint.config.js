import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  globalIgnores([
    'tailwind.config.js',
	'commitlint.config.js',
    'metro.config.js',
    'babel.config.js',
    'app.json',
    'app.config.js',
    'expo-cli.config.js',
    'expo-constants.d.ts',
    'expo-constants.ts',
    'expo-constants.tsx',
    'expo-constants.d.ts',
  ]),
]);
