import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: '127.7.7.7',
		port: 80,
		open: true
	},
	resolve: {
		alias: {
			'configurations': '/src/configurations',
			'components': '/src/components',
			'interfaces': '/src/interfaces',
			'libraries': '/src/libraries',
			'utilities': '/src/utilities',
			'constants': '/src/constants',
			'services': '/src/services',
			'contexts': '/src/contexts',
			'helpers': '/src/helpers',
			'modules': '/src/modules',
			'assets': '/src/assets',
			'styles': '/src/styles',
			'hooks': '/src/hooks',
			'i18n': '/src/i18n'
		}
	}
})
