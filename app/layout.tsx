import type React from "react"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/language-provider"
import { metadata, viewport } from "./metadata"

const inter = Inter({ subsets: ["latin"] })

export { metadata, viewport }

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Tentar obter a preferência de idioma dos cookies
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("language-storage")
  let initialLanguage = "pt" as "pt" | "en" // Definir português como padrão

  if (languageCookie) {
    try {
      const parsedData = JSON.parse(languageCookie.value)
      if (parsedData.state && parsedData.state.language) {
        initialLanguage = parsedData.state.language as "pt" | "en"
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