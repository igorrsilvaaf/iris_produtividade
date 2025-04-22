import { requireAuth } from "@/lib/auth"
import { SettingsForm } from "@/components/settings-form"
import { getUserSettings } from "@/lib/settings"

export default async function SettingsPage() {
  const session = await requireAuth()
  const settings = await getUserSettings(session.user.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="p-0 sm:p-4 md:p-6 -mx-4 sm:mx-0 bg-background rounded-lg shadow-sm">
        <SettingsForm settings={settings} />
      </div>
    </div>
  )
}

