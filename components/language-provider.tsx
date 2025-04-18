"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguageStore } from "@/lib/i18n"

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Strict`
}

interface LanguageProviderProps {
  initialLanguage: "en" | "pt"
  children: React.ReactNode
}

export function LanguageProvider({ initialLanguage, children }: LanguageProviderProps) {
  const { setLanguage } = useLanguageStore()
  const router = useRouter()

  useEffect(() => {
    console.log("LanguageProvider initialLanguage:", initialLanguage)
    
    setLanguage(initialLanguage)
    
    setCookie('user-language', initialLanguage)
    
    document.documentElement.lang = initialLanguage === 'en' ? 'en' : 'pt-BR'
    
    document.documentElement.setAttribute('data-language', initialLanguage)
    
    const cookies = document.cookie.split(';').map(c => c.trim())
  }, [initialLanguage, setLanguage])

  return <>{children}</>
}

