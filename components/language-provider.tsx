"use client"

import { useEffect } from "react"
import { useLanguage } from "@/lib/i18n"

interface LanguageProviderProps {
  initialLanguage: "en" | "pt"
  children: React.ReactNode
}

export function LanguageProvider({ initialLanguage, children }: LanguageProviderProps) {
  const { setLanguage } = useLanguage()

  useEffect(() => {
    setLanguage(initialLanguage)
  }, [initialLanguage, setLanguage])

  return <>{children}</>
}

