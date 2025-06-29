"use client"

import { useEffect, useState } from 'react'
import { useTranslation, rehydrateLanguageStore } from '@/lib/i18n'

interface LanguageProviderProps {
  children: React.ReactNode
  initialLanguage?: string
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const { language, isHydrated, setLanguage } = useTranslation()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeLanguage = async () => {
      if (typeof window === 'undefined') return
      
      if (!isHydrated) {
        rehydrateLanguageStore()
      }
      
      if (initialLanguage && initialLanguage !== language) {
        setLanguage(initialLanguage)
      }
      
      setIsReady(true)
    }

    initializeLanguage()
  }, [initialLanguage, language, isHydrated, setLanguage])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return null
  }

  return <>{children}</>
}

