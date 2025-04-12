"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, isToday, isTomorrow } from "date-fns"
import { pt, enUS } from "date-fns/locale"
import type { Todo } from "@/lib/todos"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface TaskNotificationsListProps {
  taskNotifications: {
    overdueCount: number
    dueTodayCount: number
    upcomingCount: number
    overdueTasks: Todo[]
    dueTodayTasks: Todo[]
    upcomingTasks: Todo[]
  }
  daysAhead: number
}

export function TaskNotificationsList({ taskNotifications, daysAhead }: TaskNotificationsListProps) {
  const router = useRouter()
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const [completingTask, setCompletingTask] = useState<number | null>(null)

  const totalCount = taskNotifications.overdueCount + taskNotifications.dueTodayCount + taskNotifications.upcomingCount

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dateLocale = language === "pt" ? pt : enUS

    if (isToday(date)) {
      return t("taskDueToday")
    } else if (isTomorrow(date)) {
      return t("taskDueTomorrow")
    } else if (date < new Date()) {
      // Tarefa atrasada
      const distance = formatDistanceToNow(date, { locale: dateLocale, addSuffix: false })
      return t("taskOverdue").replace("{days}", distance)
    } else {
      // Tarefa futura
      const distance = formatDistanceToNow(date, { locale: dateLocale, addSuffix: false })
      return t("taskDueInDays").replace("{days}", distance)
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    setCompletingTask(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to complete task")
      }

      toast({
        title: t("Task completed"),
        description: t("The task has been marked as complete."),
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to complete task"),
        description: t("Please try again."),
      })
    } finally {
      setCompletingTask(null)
    }
  }

  const handleViewTask = (taskId: number) => {
    router.push(`/app/tasks/${taskId}`)
  }

  if (totalCount === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-medium">{t("No task notifications")}</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("You don't have any tasks due in the next {days} days.").replace("{days}", String(daysAhead))}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tarefas vencidas */}
      {taskNotifications.overdueCount > 0 && (
        <div>
          <h3 className="mb-4 text-rose-600 font-semibold text-lg">{t("overdueTasks")}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taskNotifications.overdueTasks.map((task) => (
              <Card 
                key={task.id} 
                className="overflow-hidden border-l-4 border-l-rose-500 hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle 
                    className="text-base cursor-pointer hover:underline"
                    onClick={() => handleViewTask(task.id)}
                  >
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                      {formatDate(task.due_date!)}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 gap-1 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/10"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingTask === task.id}
                    >
                      <Check className="h-4 w-4" />
                      {t("Complete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tarefas para hoje */}
      {taskNotifications.dueTodayCount > 0 && (
        <div>
          <h3 className="mb-4 text-amber-600 font-semibold text-lg">{t("dueTasks")} - {t("Today")}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taskNotifications.dueTodayTasks.map((task) => (
              <Card 
                key={task.id} 
                className="overflow-hidden border-l-4 border-l-amber-500 hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle 
                    className="text-base cursor-pointer hover:underline"
                    onClick={() => handleViewTask(task.id)}
                  >
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {formatDate(task.due_date!)}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 gap-1 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/10"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingTask === task.id}
                    >
                      <Check className="h-4 w-4" />
                      {t("Complete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tarefas para os próximos dias */}
      {taskNotifications.upcomingCount > 0 && (
        <div>
          <h3 className="mb-4 text-blue-600 font-semibold text-lg">{t("dueTasks")} - {t("Next {days} days").replace("{days}", String(daysAhead))}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taskNotifications.upcomingTasks.map((task) => (
              <Card 
                key={task.id} 
                className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle 
                    className="text-base cursor-pointer hover:underline"
                    onClick={() => handleViewTask(task.id)}
                  >
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {formatDate(task.due_date!)}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 gap-1 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/10"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingTask === task.id}
                    >
                      <Check className="h-4 w-4" />
                      {t("Complete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 