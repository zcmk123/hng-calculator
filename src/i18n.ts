/**
 * vue-i18n 实例。语言：中文（zh） / 英文（en）。
 * 默认根据浏览器语言探测；用户切换后写入 localStorage。
 */
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

const STORAGE_KEY = 'hg-lang'

function detectLocale(): 'zh' | 'en' {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  if (saved === 'zh' || saved === 'en') return saved
  if (typeof navigator !== 'undefined' && /^zh\b/i.test(navigator.language)) return 'zh'
  return 'en'
}

/** 同步 <html lang> 与当前 locale，利于 SEO 与无障碍 */
function syncHtmlLang(locale: 'zh' | 'en') {
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

const initialLocale = detectLocale()
syncHtmlLang(initialLocale)

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: { en, zh },
})

export function setLocale(locale: 'zh' | 'en') {
  i18n.global.locale.value = locale
  syncHtmlLang(locale)
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore quota / private mode */
  }
}

export function toggleLocale() {
  setLocale(i18n.global.locale.value === 'zh' ? 'en' : 'zh')
}

export default i18n
