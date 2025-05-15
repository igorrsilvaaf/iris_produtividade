import { requireAuth } from "@/lib/auth"
import { SettingsForm } from "@/components/settings-form"
import { getUserSettings } from "@/lib/settings"
import { Suspense } from "react"

export default async function SettingsPage(
  // searchParams não é mais explicitamente tipado aqui, pois será lido pelo Client Component
  // {
  //   searchParams: { [key: string]: string | string[] | undefined }
  // }
) {
  const session = await requireAuth()
  const settings = await getUserSettings(session.user.id)
  
  // Removida a lógica de defaultTab. Será tratada no SettingsForm.
  // const defaultTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'general'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="p-0 sm:p-4 md:p-6 -mx-4 sm:mx-0 bg-background rounded-lg shadow-sm">
        <Suspense fallback={<div>Loading...</div>}>
          {/* defaultTab não é mais passado como prop */}
          <SettingsForm settings={settings} />
        </Suspense>
      </div>
    </div>
  )
}

