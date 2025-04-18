import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { requireAuth } from "@/lib/auth"
import { getUserSettings } from "@/lib/settings"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { LanguageProvider } from "@/components/language-provider"
import { ChangelogNotification } from "@/components/changelog-notification"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  if (!session) {
    redirect("/login")
  }

  // Carregar as configurações do usuário para obter o idioma
  const settings = await getUserSettings(session.user.id)
  
  // Verificar se existe um cookie de idioma
  const cookieStore = await cookies()
  const userLanguageCookie = cookieStore.get("user-language")
  
  // Definir o idioma inicial (priorizar o cookie, se existir)
  let initialLanguage = settings.language as "pt" | "en"
  
  if (userLanguageCookie) {
    const cookieValue = userLanguageCookie.value
    if (cookieValue === "en" || cookieValue === "pt") {
      initialLanguage = cookieValue
      console.log("Usando idioma do cookie:", initialLanguage)
    }
  } else {
    console.log("Cookie de idioma não encontrado, usando idioma das configurações:", initialLanguage)
  }

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <div className="flex min-h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r bg-background md:block hidden">
          <AppSidebar user={session.user} />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader user={session.user} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <ChangelogNotification />
            {children}
          </main>
        </div>
      </div>
    </LanguageProvider>
  )
}

