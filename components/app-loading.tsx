"use client"

import { useTheme } from "next-themes"
import { useTranslation } from "@/lib/i18n"
import { useEffect, useState } from "react"
import { getServerTranslation } from "@/lib/i18n"

interface AppLoadingProps {
  children: React.ReactNode
}

export function AppLoading({ children }: AppLoadingProps) {
  const { resolvedTheme } = useTheme()
  const { isHydrated, t } = useTranslation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isReady = isMounted && isHydrated && resolvedTheme

  if (!isReady) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center" 
        data-testid="app-loading"
        role="status"
        aria-live="polite"
        aria-label={t('loading')}
      >
        <div className="flex flex-col items-center gap-4">
          <div 
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" 
            data-testid="app-loading-spinner"
            aria-hidden="true"
          />
          <p 
            className="text-sm text-muted-foreground" 
            data-testid="app-loading-text"
          >
            {t('loading')}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
