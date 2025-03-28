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

      <SettingsForm settings={settings} />
    </div>
  )
}

