import { cookies } from "next/headers"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/language-provider"
import { metadata, viewport } from "./metadata"
import { PomodoroProvider } from "@/lib/pomodoro-context"
import { getUserSettings } from "@/lib/settings"
import { getSession } from "@/lib/auth"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
// import { SpotifyPortal } from "@/components/spotify-portal" // Comentado ou removido
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Importação correta do CSS global
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export { metadata, viewport }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  
  // Verificar primeiro o novo cookie user-language
  const userLanguageCookie = cookieStore.get("user-language")
  
  // Log de todos os cookies para debug - REDUZIDO para evitar poluição do console
  // console.log("------ COOKIES DISPONÍVEIS NO SERVIDOR ------")
  // for (const cookie of cookieStore.getAll()) {
  //   console.log(`Cookie: ${cookie.name} = ${cookie.value.substring(0, 20)}${cookie.value.length > 20 ? '...' : ''}`)
  // }
  // console.log("--------------------------------")
  
  // Definir o idioma padrão como português
  let initialLanguage = "pt" as "pt" | "en"

  // Tenta ler o idioma do usuário logado das configurações do banco de dados
  const session = await getSession()
  const settings = session ? await getUserSettings(session.user.id) : null
  
  if (settings && settings.language && (settings.language === "en" || settings.language === "pt")) {
    // Prioridade 1: Usar o idioma das configurações salvas no banco
    initialLanguage = settings.language as "pt" | "en"
    // console.log("RootLayout: Usando idioma das configurações do usuário:", initialLanguage)
  } else if (userLanguageCookie) {
    // Prioridade 2: Usar o valor do cookie se estiver disponível e for válido
    const cookieValue = userLanguageCookie.value
    if (cookieValue === "en" || cookieValue === "pt") {
      initialLanguage = cookieValue
      // console.log("RootLayout: Usando idioma do cookie user-language:", initialLanguage)
    }
  } else {
    // Verificar o cookie antigo como fallback
    const legacyCookie = cookieStore.get("language-storage")
    if (legacyCookie) {
      try {
        const parsedData = JSON.parse(legacyCookie.value)
        if (parsedData.state && parsedData.state.language) {
          initialLanguage = parsedData.state.language as "pt" | "en"
          // console.log("RootLayout: Usando idioma do cookie legacy:", initialLanguage)
        }
      } catch (e) {
        console.error("Error parsing language cookie:", e)
      }
    } else {
      // console.log("RootLayout: Nenhum cookie de idioma encontrado, usando pt como padrão")
    }
  }

  // Reduzindo logs para evitar poluição do console
  // console.log("RootLayout: Idioma definido:", initialLanguage)
  // console.log(`RootLayout: HTML lang será definido como: ${initialLanguage === "en" ? "en" : "pt-BR"}`)
  
  // Para usuários logados, verificar se existe discrepância entre cookie e configurações do banco
  if (session && settings && userLanguageCookie) {
    const cookieLang = userLanguageCookie.value;
    const dbLang = settings.language;
    
    if (cookieLang !== dbLang) {
      console.log(`ALERTA: Discrepância entre idioma do cookie (${cookieLang}) e banco de dados (${dbLang})`);
    }
  }

  return (
    <html 
      lang={initialLanguage === "en" ? "en" : "pt-BR"} 
      suppressHydrationWarning
      data-language={initialLanguage}
    >
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
                <ServiceWorkerRegistration />
                {/* <SpotifyPortal /> // Comentado ou removido */}
                <div className="flex-1">{children}</div>
              </PomodoroProvider>
            ) : (
              <>
                <ServiceWorkerRegistration />
                {/* <SpotifyPortal /> // Comentado ou removido */}
                <div className="flex-1">{children}</div>
              </>
            )}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        {/* <SpotifyPortal /> // Comentado ou removido */}
      </body>
    </html>
  )
}