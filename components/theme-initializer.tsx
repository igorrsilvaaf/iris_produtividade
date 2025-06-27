'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface ThemeInitializerProps {
  children: React.ReactNode
}

export function ThemeInitializer({ children }: ThemeInitializerProps) {
  const { theme, systemTheme, resolvedTheme, setTheme } = useTheme()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    console.log('ThemeInitializer - Theme state:', {
      theme,
      systemTheme,
      resolvedTheme,
      isReady
    })

    // Garantir que o tema está pronto
    if (resolvedTheme) {
      console.log('ThemeInitializer - Theme is ready:', resolvedTheme)
      setIsReady(true)
    } else {
      // Se não houver tema definido, usar o tema do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const defaultTheme = prefersDark ? 'dark' : 'light'
      
      console.log(`ThemeInitializer - No theme set, using system preference: ${defaultTheme}`)
      setTheme(defaultTheme)
      
      // Forçar atualização após um pequeno atraso
      const timer = setTimeout(() => {
        console.log('ThemeInitializer - Forcing theme update')
        setIsReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [theme, systemTheme, resolvedTheme, setTheme])

  if (!isReady) {
    console.log('ThemeInitializer - Waiting for theme to be ready...')
    return null
  }

  console.log('ThemeInitializer - Rendering children with theme:', resolvedTheme)
  return <>{children}</>
}
