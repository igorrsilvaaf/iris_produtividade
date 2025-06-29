"use client"

import { useTheme } from "next-themes"
import { useTranslation } from "@/lib/i18n"
import { useEffect, useState } from "react"

interface AppLoadingProps {
  children: React.ReactNode
}

export function AppLoading({ children }: AppLoadingProps) {
  const { resolvedTheme } = useTheme()
  const { isHydrated } = useTranslation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isReady = isMounted && isHydrated && resolvedTheme

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
