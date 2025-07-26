"use client"

import { useEffect, useState } from 'react'
import { useTranslation, rehydrateLanguageStore } from '@/lib/i18n'

interface LanguageInitializerProps {
  children: React.ReactNode
  initialLanguage?: string
}

export function LanguageInitializer({ children, initialLanguage }: LanguageInitializerProps) {
  const { language, isHydrated, setLanguage } = useTranslation()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    
    if (!isHydrated) {
      rehydrateLanguageStore()
      return
    }

    if (!isInitialized && isHydrated) {
      setIsInitialized(true)
      
      if (initialLanguage && initialLanguage !== language) {
        setLanguage(initialLanguage)
      }
    }
  }, [initialLanguage, language, isHydrated, setLanguage, isInitialized])

  useEffect(() => {
    if (isInitialized) {
    }
  }, [isInitialized])

  if (!isHydrated || !isInitialized) {
    return null
  }

  return <div data-testid="language-initializer">{children}</div>
}
