import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
	// Dot folders (build output, tooling) and the skills folder are not part of the app
	{ ignores: ['.*/**', 'node_modules/**', 'skills/**', 'next-env.d.ts'] },
	...compat.extends('next/core-web-vitals'),
];

export default eslintConfig;
