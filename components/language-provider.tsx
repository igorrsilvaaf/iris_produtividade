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
  const router = useRouter()
  const { setLanguage } = useLanguageStore()

  useEffect(() => {

    
    // Clear old cookie before setting new one
    document.cookie = `language-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    
    // Set new cookie
    setCookie('user-language', initialLanguage)
    
    // Update language in Zustand state
    setLanguage(initialLanguage)
    
    // Update HTML attributes
    document.documentElement.lang = initialLanguage === 'en' ? 'en' : 'pt-BR'
    document.documentElement.setAttribute('data-language', initialLanguage)
    
    // Verify if cookie was set correctly
    setTimeout(() => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const langCookie = cookies.find(c => c.startsWith('user-language='))

    }, 100)
  }, [initialLanguage, setLanguage])

  return <>{children}</>
}

