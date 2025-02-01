import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import {noop} from 'utilities/common'
import resources from 'i18n/locales'


i18n.use(HttpBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		supportedLngs: ['uz', 'uzb'],
		lng: localStorage.getItem('i18nextLng') || 'uz',
		detection: {
			order: ['localStorage'],
			caches: ['localStorage']
		},
		interpolation: {
			escapeValue: false
		},
		react: {
			useSuspense: false
		}
	})
	.then(noop)