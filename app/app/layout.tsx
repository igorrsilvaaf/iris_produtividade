import type React from "react"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { getUserSettings } from "@/lib/settings"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { LanguageProvider } from "@/components/language-provider"

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

  return (
    <LanguageProvider initialLanguage={settings.language}>
      <div className="flex min-h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r bg-background">
          <AppSidebar user={session.user} />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader user={session.user} />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}

