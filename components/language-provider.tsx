"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguageStore } from "@/lib/i18n"
import { translations } from "@/lib/i18n"

// Função para definir cookie diretamente com opções melhoradas
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Strict`
  console.log(`Cookie '${name}' definido para: '${value}'`)
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
    
    // Definir o idioma no estado
    setLanguage(initialLanguage)
    
    // Forçar a definição do cookie diretamente
    setCookie('user-language', initialLanguage)
    
    // Definir o atributo lang no documento HTML
    document.documentElement.lang = initialLanguage === 'en' ? 'en' : 'pt-BR'
    
    // Definir um atributo de data para debugging
    document.documentElement.setAttribute('data-language', initialLanguage)
    
    console.log("Idioma configurado:", initialLanguage)
    console.log("HTML lang attribute:", document.documentElement.lang)
    
    // Verificar cookies existentes para debugging
    console.log("Cookies de idioma existentes:")
    const cookies = document.cookie.split(';').map(c => c.trim())
    console.log(cookies.filter(c => c.startsWith('user-language') || c.startsWith('language-storage')))
  }, [initialLanguage, setLanguage])

  return <>{children}</>
}

