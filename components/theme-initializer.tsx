"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeInitializerProps {
  children: React.ReactNode
  initialTheme?: string
}

export function ThemeInitializer({ children, initialTheme }: ThemeInitializerProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (initialTheme && !theme) {
      const defaultTheme = initialTheme === 'auto' ? 'system' : initialTheme
      
      setTheme(defaultTheme)
      
      setTimeout(() => setTheme(defaultTheme), 100)
    }
  }, [initialTheme, theme, setTheme])

  if (!mounted || !resolvedTheme) {
    return null
  }

  return <>{children}</>
}
