import { getUserSettings } from "@/lib/settings"
import { getTasksForNotifications } from "@/lib/todos"
import { TaskNotificationsList } from "@/components/task-notifications-list"
import { buttonVariants } from "@/components/ui/button"
import { getServerTranslation } from "@/lib/server-i18n"
import { Bell } from "lucide-react"
import { markAllNotificationsAsRead } from "./actions"
import { requireAuth } from "@/lib/auth"
import { cookies } from "next/headers"

export default async function NotificationsPage() {
  // Autenticar usuário
  const session = await requireAuth()
  const userId = session.user.id
  
  // Obter idioma dos cookies
  const cookieStore = await cookies()
  const langCookie = cookieStore.get("i18n_language")
  const lang = langCookie?.value as "en" | "pt" || "pt"
  
  // Função de tradução
  const t = (key: string) => getServerTranslation(key, lang)
  
  // Buscar configurações do usuário
  const settings = await getUserSettings(userId)
  
  // Buscar notificações de tarefas
  const taskNotifications = await getTasksForNotifications(userId, settings.task_notification_days || 3)
  const hasNotifications = taskNotifications && (
    taskNotifications.overdueCount + 
    taskNotifications.dueTodayCount + 
    taskNotifications.upcomingCount
  ) > 0
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("notifications")}</h1>
        {hasNotifications && (
          <form action={markAllNotificationsAsRead}>
            <button
              type="submit"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {t("markAllAsRead")}
            </button>
          </form>
        )}
      </div>

      {hasNotifications ? (
        <TaskNotificationsList 
          taskNotifications={taskNotifications} 
          daysAhead={settings.task_notification_days || 3} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border bg-card">
          <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-xl mb-2">{t("No task notifications")}</h3>
          <p className="text-muted-foreground">
            {t("You don't have any tasks due in the next {days} days").replace(
              "{days}", 
              String(settings.task_notification_days || 3)
            )}
          </p>
        </div>
      )}
    </div>
  )
}

