"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, isToday, isTomorrow, format } from "date-fns"
import { pt, enUS } from "date-fns/locale"
import type { Todo } from "@/lib/todos"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TaskDetail } from "@/components/task-detail"

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
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)

  const totalCount = taskNotifications.overdueCount + taskNotifications.dueTodayCount + taskNotifications.upcomingCount

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dateLocale = language === "pt" ? pt : enUS
    const now = new Date()
    const isSameDateAs = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    };
    
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (isSameDateAs(date, today)) {
      return t("taskDueToday")
    } else if (isSameDateAs(date, tomorrow)) {
      return t("taskDueTomorrow")
    } else if (date < now) {
      const distance = formatDistanceToNow(date, { locale: dateLocale, addSuffix: false })
      return t("taskOverdue").replace("{days}", distance)
    } else {
      if (date.getFullYear() !== now.getFullYear()) {
        return format(date, "MMM d, yyyy", { locale: dateLocale });
      } else {
        const distance = formatDistanceToNow(date, { locale: dateLocale, addSuffix: false })
        return t("taskDueInDays").replace("{days}", distance)
      }
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    setCompletingTask(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}/${taskId}/complete`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to complete task")
      }

      toast({
        title: t("Task completed"),
        description: t("The task has been marked as complete."),
      })

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

  const handleViewTask = (task: Todo) => {
    try {

      setSelectedTask({...task});
      setShowTaskDetail(true);
    } catch (error) {
      console.error("Erro ao abrir detalhes da tarefa da lista:", error);
      toast({
        variant: "destructive",
        title: t("Erro"),
        description: t("Não foi possível abrir os detalhes da tarefa."),
      });
    }
  };

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
    <>
      <div className="space-y-8">
        {/* Tarefas vencidas */}
        {taskNotifications.overdueCount > 0 && (
          <div>
            <h3 className="mb-4 text-rose-600 font-semibold text-lg">{t("overdueTasks")}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {taskNotifications.overdueTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="overflow-hidden border-l-4 border-l-rose-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewTask(task)}
                >
                  <div className="p-3">
                    <div 
                      className="cursor-pointer hover:underline font-medium text-sm sm:text-base mb-2 line-clamp-2"
                    >
                      {task.title}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">
                        {formatDate(task.due_date!)}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 sm:h-7 text-xs sm:text-sm gap-1 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                        disabled={completingTask === task.id}
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        {t("Complete")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tarefas para hoje */}
        {taskNotifications.dueTodayCount > 0 && (
          <div>
            <h3 className="mb-4 text-amber-600 font-semibold text-lg">{t("dueTasks")} - {t("Today")}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {taskNotifications.dueTodayTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="overflow-hidden border-l-4 border-l-amber-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewTask(task)}
                >
                  <div className="p-3">
                    <div 
                      className="cursor-pointer hover:underline font-medium text-sm sm:text-base mb-2 line-clamp-2"
                    >
                      {task.title}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-medium">
                        {formatDate(task.due_date!)}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 sm:h-7 text-xs sm:text-sm gap-1 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                        disabled={completingTask === task.id}
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        {t("Complete")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tarefas para os próximos dias */}
        {taskNotifications.upcomingCount > 0 && (
          <div>
            <h3 className="mb-4 text-blue-600 font-semibold text-lg">
              {(() => {
                if (taskNotifications.upcomingCount === 1 && 
                    taskNotifications.upcomingTasks.length === 1 && 
                    isTomorrow(new Date(taskNotifications.upcomingTasks[0].due_date!))) {
                  return t("dueTasks") + " - " + t("Tomorrow");
                } else {
                  return t("dueTasks") + " - " + t("Next {days} days").replace("{days}", String(daysAhead));
                }
              })()}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {taskNotifications.upcomingTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewTask(task)}
                >
                  <div className="p-3">
                    <div 
                      className="cursor-pointer hover:underline font-medium text-sm sm:text-base mb-2 line-clamp-2"
                    >
                      {task.title}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {formatDate(task.due_date!)}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 sm:h-7 text-xs sm:text-sm gap-1 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                        disabled={completingTask === task.id}
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        {t("Complete")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          open={showTaskDetail} 
          onOpenChange={(open) => {

            setShowTaskDetail(open);
            if (!open) {
              setTimeout(() => setSelectedTask(null), 300);
            }
          }} 
        />
      )}
    </>
  )
} 