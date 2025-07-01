"use client"

import { useTranslation } from '@/lib/i18n'
import { useEffect, useState } from 'react'

interface TranslationsLoaderProps {
  children: React.ReactNode
  requiredKeys?: string[]
}

export function TranslationsLoader({ children, requiredKeys = [] }: TranslationsLoaderProps) {
  const { t, isHydrated } = useTranslation()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isHydrated) return

    if (requiredKeys.length === 0) {
      setIsReady(true)
      return
    }

    const allTranslationsAvailable = requiredKeys.every(key => {
      const translation = t(key)
      return translation !== key
    })

    if (allTranslationsAvailable) {
      setIsReady(true)
    } else {
      setIsReady(true)
    }
  }, [isHydrated, t, requiredKeys])

  if (!isHydrated || !isReady) {
    return null
  }

  return <>{children}</>
}
