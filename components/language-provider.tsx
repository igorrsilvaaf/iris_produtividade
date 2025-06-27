"use client"

import { useEffect, useState } from "react"
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
  const { language: currentLanguage, setLanguage, isHydrated } = useLanguageStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    document.cookie = `language-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    
    setCookie('user-language', initialLanguage)
    setLanguage(initialLanguage)
    
    document.documentElement.lang = initialLanguage === 'en' ? 'en' : 'pt-BR'
    document.documentElement.setAttribute('data-language', initialLanguage)
    
    const timer = setTimeout(() => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const langCookie = cookies.find(c => c.startsWith('user-language='))
      
      setIsReady(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [initialLanguage, setLanguage, currentLanguage])

  if (!isHydrated || !isReady) {
    console.log('LanguageProvider - Waiting for hydration and language setup...');
    return null;
  }
  
  return <>{children}</>
}

