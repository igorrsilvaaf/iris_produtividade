'use client'

import { useEffect, useState } from 'react'
import { useLanguageStore } from '@/lib/i18n'
import { useTheme } from 'next-themes'

interface AppLoadingProps {
  children: React.ReactNode
}

export function AppLoading({ children }: AppLoadingProps) {
  const { isHydrated } = useLanguageStore()
  const { resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && isHydrated && resolvedTheme) {
      console.log('AppLoading - All ready:', { isMounted, isHydrated, resolvedTheme })
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isMounted, isHydrated, resolvedTheme])

  if (!isReady) {
    console.log('AppLoading - Waiting for app to be ready...', { isMounted, isHydrated, resolvedTheme })
    return null
  }

  console.log('AppLoading - Rendering app')
  return <>{children}</>
}
