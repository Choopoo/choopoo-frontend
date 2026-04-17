import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enDesk from './locales/en/desk.json'
import enGoals from './locales/en/goals.json'
import enMaterials from './locales/en/materials.json'
import enCopilot from './locales/en/copilot.json'
import enInsights from './locales/en/insights.json'
import enStatus from './locales/en/status.json'
import enEnums from './locales/en/enums.json'

import zhCommon from './locales/zh-CN/common.json'
import zhAuth from './locales/zh-CN/auth.json'
import zhDesk from './locales/zh-CN/desk.json'
import zhGoals from './locales/zh-CN/goals.json'
import zhMaterials from './locales/zh-CN/materials.json'
import zhCopilot from './locales/zh-CN/copilot.json'
import zhInsights from './locales/zh-CN/insights.json'
import zhStatus from './locales/zh-CN/status.json'
import zhEnums from './locales/zh-CN/enums.json'

const SINGLE = (import.meta.env.VITE_DEFAULT_LOCALE as string | undefined)?.trim()

const resources = {
  en: {
    common: enCommon, auth: enAuth, desk: enDesk, goals: enGoals,
    materials: enMaterials, copilot: enCopilot, insights: enInsights,
    status: enStatus, enums: enEnums,
  },
  'zh-CN': {
    common: zhCommon, auth: zhAuth, desk: zhDesk, goals: zhGoals,
    materials: zhMaterials, copilot: zhCopilot, insights: zhInsights,
    status: zhStatus, enums: zhEnums,
  },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SINGLE ? [SINGLE] : ['en', 'zh-CN'],
    lng: SINGLE || undefined,
    ns: ['common', 'auth', 'desk', 'goals', 'materials', 'copilot', 'insights', 'status', 'enums'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: SINGLE
      ? undefined
      : {
          order: ['localStorage', 'navigator', 'htmlTag'],
          lookupLocalStorage: 'choopoo_locale',
          caches: ['localStorage'],
        },
  })

export default i18n
export type AppLocale = 'en' | 'zh-CN'

export function normalizeLocale(raw: string | undefined | null): AppLocale {
  if (!raw) return 'en'
  return raw.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}
