import { requireAuth } from "@/lib/auth"
import { getNotifications, markAllNotificationsAsRead } from "@/lib/notifications"
import { NotificationsList } from "@/components/notifications-list"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default async function NotificationsPage() {
  const session = await requireAuth()
  const notifications = await getNotifications(session.user.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <form
          action={async () => {
            "use server"
            await markAllNotificationsAsRead(session.user.id)
          }}
        >
          <Button variant="outline" type="submit">
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </form>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  )
}

