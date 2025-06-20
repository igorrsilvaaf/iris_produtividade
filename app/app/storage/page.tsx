import { requireAuth } from "@/lib/auth"
import { BackupRestore } from "@/components/backup-restore"
import { cookies } from "next/headers"
import { getServerTranslation } from "@/lib/server-i18n"
import { Metadata } from "next"

// Define a metadata para forçar o idioma para esta página
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("user-language")
  let lang = "pt" // Default to PT if no cookie

  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    lang = languageCookie.value
  }

  // Usar a função getServerTranslation para traduzir o título
  const title = getServerTranslation("storage", lang as "en" | "pt");

  return {
    title,
  }
}

export default async function StoragePage() {
  const session = await requireAuth()
  
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("user-language")
  let initialLanguage = "pt"

  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    initialLanguage = languageCookie.value
  }


  
  // Obter a tradução diretamente usando getServerTranslation
  const translatedTitle = getServerTranslation("storage", initialLanguage as "en" | "pt");


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{translatedTitle}</h1>
      </div>

      <div className="grid gap-6">
        <BackupRestore initialLanguage={initialLanguage} />
      </div>
    </div>
  )
}

