import reactRefresh from 'eslint-plugin-react-refresh'
// import reactHooks from 'eslint-plugin-react-hooks'
import tsEslint from 'typescript-eslint'
import globals from 'globals'
import js from '@eslint/js'


export default tsEslint.config(
	{
		ignores: ['dist']
	},
	{
		extends: [js.configs.recommended, ...tsEslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser
		},
		plugins: {
			// 'react-hooks': reactHooks,
			'react-refresh': reactRefresh
		},
		rules: {
			// ...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{
					allowConstantExport: true
				}
			]
		}
	}
)
