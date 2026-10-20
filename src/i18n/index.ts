import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { messages } from './messages'
import { toCyrillic } from './translit'

export const LANGUAGES = [
  { value: 'uz', label: "O'zbekcha" },
  { value: 'uz-cyrl', label: 'Ўзбекча' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
] as const

export type Lang = (typeof LANGUAGES)[number]['value']

function build(lang: Lang) {
  const out: Record<string, string> = {}
  for (const [key, row] of Object.entries(messages)) {
    if (lang === 'uz-cyrl') out[key] = row.uzc ?? toCyrillic(row.uz)
    else out[key] = row[lang] ?? row.uz
  }
  return out
}

const stored = (localStorage.getItem('lang') as Lang | null) || 'uz'

i18n.use(initReactI18next).init({
  resources: Object.fromEntries(LANGUAGES.map((l) => [l.value, { translation: build(l.value) }])),
  lng: stored,
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
})

export function setLanguage(lang: Lang) {
  localStorage.setItem('lang', lang)
  document.documentElement.lang = lang
  return i18n.changeLanguage(lang)
}

document.documentElement.lang = stored

export default i18n
