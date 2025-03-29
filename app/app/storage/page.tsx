import { requireAuth } from "@/lib/auth"
import { BackupRestore } from "@/components/backup-restore"

export default async function StoragePage() {
  const session = await requireAuth()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Storage & Backup</h1>
      </div>

      <div className="grid gap-6">
        <BackupRestore />
      </div>
    </div>
  )
}

