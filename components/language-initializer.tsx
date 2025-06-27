"use client"

import { useEffect, useState } from "react"
import { useLanguageStore } from "@/lib/i18n"

interface LanguageInitializerProps {
  initialLanguage: "pt" | "en"
}

export function LanguageInitializer({ initialLanguage }: LanguageInitializerProps) {
  const { language, setLanguage, isHydrated } = useLanguageStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log('LanguageInitializer - Initializing with:', {
      initialLanguage,
      currentLanguage: language,
      isHydrated,
      isInitialized
    })

    // Só prosseguir se a store estiver hidratada
    if (!isHydrated) {
      console.log('LanguageInitializer - Store not hydrated yet, waiting...')
      return
    }

    // Só sincronizar uma vez após a hidratação
    if (!isInitialized) {
      console.log('LanguageInitializer - First run after hydration, syncing language...')
      
      // Atualizar o idioma se for diferente
      if (language !== initialLanguage) {
        console.log(`LanguageInitializer - Updating language from '${language}' to '${initialLanguage}'`)
        setLanguage(initialLanguage)
      }
      
      // Atualizar o cookie para garantir consistência
      document.cookie = `user-language=${initialLanguage}; path=/; max-age=31536000; SameSite=Strict`
      
      // Atualizar atributos HTML
      document.documentElement.lang = initialLanguage === 'en' ? 'en' : 'pt-BR'
      document.documentElement.setAttribute('data-language', initialLanguage)
      
      setIsInitialized(true)
      console.log('LanguageInitializer - Language sync completed')
    }
  }, [initialLanguage, language, setLanguage, isHydrated, isInitialized])

  // Não renderizar nada
  return null
}
