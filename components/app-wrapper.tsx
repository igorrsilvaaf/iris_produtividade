'use client'

import { ReactNode, useEffect, useState, memo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useTheme } from 'next-themes'

interface AppWrapperProps {
  children: ReactNode
}

export const AppWrapper = memo(function AppWrapper({ children }: AppWrapperProps) {
  const { isHydrated, language } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (isHydrated && resolvedTheme) {
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [isHydrated, resolvedTheme])

  if (!isReady) {
    return null
  }

  return <div data-testid="app-wrapper">{children}</div>
})
