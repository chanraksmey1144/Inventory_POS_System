import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en/common.json'
import km from '@/locales/km/common.json'

const saved = localStorage.getItem('language')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    km: { translation: km },
  },
  lng: saved || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export function setLanguage(language) {
  localStorage.setItem('language', language)
  i18n.changeLanguage(language)
  const root = document.documentElement
  if (language === 'km') {
    root.classList.add('lang-km')
  } else {
    root.classList.remove('lang-km')
  }
}

export function getLanguage() {
  return i18n.language
}

export default i18n
