'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface TranslationsLoaderProps {
  children: React.ReactNode
  requiredKeys?: string[]
}

export function TranslationsLoader({ children, requiredKeys = [] }: TranslationsLoaderProps) {
  const { t, language } = useTranslation()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const missingKeys = requiredKeys.filter(key => {
      const translated = t(key)
      const isMissing = translated === key
      if (isMissing) {
        console.warn(`[TRANSLATION MISSING] Key "${key}" for language: ${language}`)
      }
      return isMissing
    })

    if (missingKeys.length === 0) {
      console.log('TranslationsLoader - All required translations are available')
      setIsReady(true)
    } else {
      const timer = setTimeout(() => {
        console.log('TranslationsLoader - Proceeding with missing translations')
        setIsReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [language, t])

  if (!isReady) {
    console.log('TranslationsLoader - Waiting for translations to be ready...')
    return null
  }
  
  return <>{children}</>
}
