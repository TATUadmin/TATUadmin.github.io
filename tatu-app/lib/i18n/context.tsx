'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations, TranslationKey } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'tatu-language'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es' || savedLanguage === 'pt')) {
        setLanguageState(savedLanguage)
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0]
        if (browserLang === 'es' || browserLang === 'pt') {
          setLanguageState(browserLang)
        }
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
      // Update HTML lang attribute
      document.documentElement.lang = lang
    }
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}


