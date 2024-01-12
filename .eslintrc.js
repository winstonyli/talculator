/** @type { import("eslint").Linter.Config } */
export default {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:svelte/recommended',
		'prettier',
		'plugin:import/errors',
		'plugin:import/warnings'
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'import/order': [
			'warn',
			{
				alphabetize: {
					order: 'asc',
					caseInsensitive: true
				},
				'newlines-between': 'always'
			}
		]
	}
};
