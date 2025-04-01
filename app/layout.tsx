import { cookies } from "next/headers"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/language-provider"
import { metadata, viewport } from "./metadata"
import { PomodoroProvider } from "@/lib/pomodoro-context"
import { getUserSettings } from "@/lib/settings"
import { getSession } from "@/lib/auth"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export { metadata, viewport }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("language-storage")
  let initialLanguage = "pt" as "pt" | "en"

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

  const session = await getSession()
  const settings = session ? await getUserSettings(session.user.id) : null

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider initialLanguage={initialLanguage}>
            {settings ? (
              <PomodoroProvider
                initialSettings={{
                  workMinutes: settings.pomodoro_work_minutes,
                  shortBreakMinutes: settings.pomodoro_break_minutes,
                  longBreakMinutes: settings.pomodoro_long_break_minutes,
                  longBreakInterval: settings.pomodoro_cycles,
                  enableSound: settings.enable_sound,
                  notificationSound: settings.notification_sound,
                  enableDesktopNotifications: settings.enable_desktop_notifications,
                }}
              >
                {children}
              </PomodoroProvider>
            ) : (
              children
            )}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}