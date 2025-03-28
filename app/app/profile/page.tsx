import { requireAuth } from "@/lib/auth"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const session = await requireAuth()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <ProfileForm user={session.user} />
    </div>
  )
}

