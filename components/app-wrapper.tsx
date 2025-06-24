'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useLanguageStore } from '@/lib/i18n'
import { useTheme } from 'next-themes'

interface AppWrapperProps {
  children: ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { isHydrated, language } = useLanguageStore()
  const { resolvedTheme } = useTheme()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    console.log('AppWrapper - Initial state:', {
      isHydrated,
      language,
      resolvedTheme,
      isReady
    })

    // Verificar se tudo está pronto
    if (isHydrated && resolvedTheme) {
      console.log('AppWrapper - All dependencies are ready')
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isHydrated, language, resolvedTheme])

  if (!isReady) {
    console.log('AppWrapper - Waiting for all dependencies to be ready...')
    return null
  }

  console.log('AppWrapper - Rendering children')
  return <>{children}</>
}
