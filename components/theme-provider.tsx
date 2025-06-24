'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme
} from 'next-themes'

function ThemeDebug() {
  const { theme, systemTheme, resolvedTheme } = useTheme()
  
  React.useEffect(() => {
    console.log('Theme Debug:', {
      theme,
      systemTheme,
      resolvedTheme,
      time: new Date().toISOString()
    })
  }, [theme, systemTheme, resolvedTheme])
  
  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    console.log('ThemeProvider mounted with props:', props)
  }, [props])
  
  return (
    <NextThemesProvider {...props}>
      <ThemeDebug />
      {children}
    </NextThemesProvider>
  )
}
