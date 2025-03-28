"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Bell, Check, Trash } from "lucide-react"
import type { Notification } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface NotificationsListProps {
  initialNotifications: Notification[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const router = useRouter()
  const { toast } = useToast()

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      )

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to mark notification as read",
        description: "Please try again.",
      })
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete notification")
      }

      setNotifications(notifications.filter((notification) => notification.id !== id))

      toast({
        title: "Notification deleted",
        description: "The notification has been deleted.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete notification",
        description: "Please try again.",
      })
    }
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-medium">No notifications</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You don&apos;t have any notifications at the moment.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={notification.is_read ? "bg-background" : "bg-primary/5"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{notification.title}</CardTitle>
              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
            <CardDescription>{format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{notification.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

