import { requireAuth } from "@/lib/auth"
import { BackupRestore } from "@/components/backup-restore"
import { cookies } from "next/headers"
import { translations } from "@/lib/i18n"

export default async function StoragePage() {
  const session = await requireAuth()
  
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("language-storage")
  let initialLanguage = "pt"

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

  const t = (key: string) => translations[key]?.[initialLanguage as "en" | "pt"] || key

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Storage & Backup")}</h1>
      </div>

      <div className="grid gap-6">
        <BackupRestore />
      </div>
    </div>
  )
}

