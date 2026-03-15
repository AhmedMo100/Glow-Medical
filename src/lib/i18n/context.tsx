'use client'
// ============================================================
//  GLOW MEDICAL — i18n Context & Hook
// ============================================================
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type Locale, type Dir, LOCALES, translations, type Translations } from './translations'

interface I18nCtx {
  locale:    Locale
  dir:       Dir
  t:         Translations
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nCtx>({
  locale:    'ar',
  dir:       'rtl',
  t:         translations.ar,
  setLocale: () => {},
})

const STORAGE_KEY = 'glow-locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (saved && (saved === 'ar' || saved === 'en')) setLocaleState(saved)
    } catch {}
  }, [])

  // Apply dir + lang to <html> element whenever locale changes
  useEffect(() => {
    const loc  = LOCALES.find(l => l.value === locale)!
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir',  loc.dir)
    document.documentElement.style.setProperty('--dir', loc.dir)
    // flip horizontal paddings/margins automatically via CSS
  }, [locale])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }

  const dir = LOCALES.find(l => l.value === locale)!.dir
  const t   = translations[locale]

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

/** Use inside any client component to access translations + locale */
export function useI18n(): I18nCtx {
  return useContext(I18nContext)
}

/** Convenience re-export */
export { LOCALES, type Locale, type Dir }
