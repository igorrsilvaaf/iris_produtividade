"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguageStore } from "@/lib/i18n"
import { translations } from "@/lib/i18n"

// Função para definir cookie diretamente
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
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
    
    console.log("Cookie 'user-language' definido para:", initialLanguage)

    // Remover o evento que causa recarregamento
    // const handleStorageChange = () => {
    //   console.log("Linguagem alterada, recarregando a página")
    //   router.refresh()
    // }

    // window.addEventListener('storage', handleStorageChange)
    
    // return () => {
    //   window.removeEventListener('storage', handleStorageChange)
    // }
  }, [initialLanguage, setLanguage])

  return <>{children}</>
}

