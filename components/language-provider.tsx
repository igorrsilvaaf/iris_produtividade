"use client"

import type React from "react"

import { useEffect } from "react"
import { useLanguage } from "@/lib/i18n"

interface LanguageProviderProps {
  initialLanguage?: string
  children: React.ReactNode
}

export function LanguageProvider({ initialLanguage, children }: LanguageProviderProps) {
  const { setLanguage } = useLanguage()

  useEffect(() => {
    if (initialLanguage && (initialLanguage === "en" || initialLanguage === "pt")) {
      setLanguage(initialLanguage as "en" | "pt")
    }
  }, [initialLanguage, setLanguage])

  return <>{children}</>
}

