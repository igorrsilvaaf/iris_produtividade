import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/language-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Todoist Clone",
  description: "A Todoist clone with Pomodoro timer and more",
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Tentar obter a preferência de idioma dos cookies
  const cookieStore = cookies()
  const languageCookie = cookieStore.get("language-storage")
  let initialLanguage = "pt" // Definir português como padrão

  if (languageCookie) {
    try {
      const parsedData = JSON.parse(languageCookie.value)
      if (parsedData.state && parsedData.state.language) {
        initialLanguage = parsedData.state.language
      }
    } catch (e) {
      console.error("Error parsing language cookie:", e)
    }
  }

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider initialLanguage={initialLanguage}>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'