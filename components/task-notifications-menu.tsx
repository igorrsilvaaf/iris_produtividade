"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { formatDistanceToNow, isToday, isTomorrow, format } from "date-fns"
import { pt, enUS } from "date-fns/locale"
import { Bell, Check } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "@/lib/i18n"
import { useToast } from "@/components/ui/use-toast"
import type { Todo } from "@/lib/todos"
import { TaskDetail } from "@/components/task-detail"

interface TaskNotification {
  enabled: boolean
  overdueCount: number
  dueTodayCount: number
  upcomingCount: number
  totalCount: number
  tasks: {
    overdueTasks: Todo[]
    dueTodayTasks: Todo[]
    upcomingTasks: Todo[]
  }
}

export function TaskNotificationsMenu() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [viewed, setViewed] = useState(false)
  const [completingTask, setCompletingTask] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [notifications, setNotifications] = useState<TaskNotification>({
    enabled: false,
    overdueCount: 0,
    dueTodayCount: 0,
    upcomingCount: 0,
    totalCount: 0,
    tasks: {
      overdueTasks: [],
      dueTodayTasks: [],
      upcomingTasks: []
    }
  })

  const fetchTaskNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications/tasks")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        console.error("Erro ao buscar notificações:", await response.text())
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchTaskNotifications()
      setViewed(true)
    }
  }, [open])
  
  useEffect(() => {
    fetchTaskNotifications()
    
    const interval = setInterval(() => {
      fetchTaskNotifications()
      if (!open) {
        setViewed(false)
      }
    }, 5 * 60 * 1000)
    
    return () => {
      clearInterval(interval)
    }
  }, [open])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTaskNotifications()
        if (!open) {
          setViewed(false)
        }
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [open])

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

  const handleCompleteTask = async (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation() 
    setCompletingTask(taskId)
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to complete task")
      }

      setNotifications(prev => {
        const filterTask = (tasks: Todo[]) => tasks.filter(task => task.id !== taskId)
        const newOverdueTasks = filterTask(prev.tasks.overdueTasks)
        const newDueTodayTasks = filterTask(prev.tasks.dueTodayTasks)
        const newUpcomingTasks = filterTask(prev.tasks.upcomingTasks)
        
        return {
          ...prev,
          overdueCount: newOverdueTasks.length,
          dueTodayCount: newDueTodayTasks.length,
          upcomingCount: newUpcomingTasks.length,
          totalCount: newOverdueTasks.length + newDueTodayTasks.length + newUpcomingTasks.length,
          tasks: {
            overdueTasks: newOverdueTasks,
            dueTodayTasks: newDueTodayTasks,
            upcomingTasks: newUpcomingTasks
          }
        }
      })

      toast({
        title: t("Task completed"),
        description: t("The task has been marked as complete."),
        duration: 3000,
      })
      
    } catch (error) {
      console.error("Error completing task:", error)
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
      setOpen(false);
      setSelectedTask({...task});
      setShowTaskDetail(true);
    } catch (error) {
      console.error("Erro ao abrir detalhes da tarefa:", error);
      toast({
        variant: "destructive",
        title: t("Erro"),
        description: t("Não foi possível abrir os detalhes da tarefa."),
      });
    }
  };

  const showNotificationBadge = notifications.totalCount > 0 && !viewed

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {showNotificationBadge && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs bg-rose-600 hover:bg-rose-700"
            >
              {notifications.totalCount > 99 ? "99+" : notifications.totalCount}
            </Badge>
          )}
          <span className="sr-only">{t("notifications")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[95vw] sm:w-80 md:w-96 p-0 overflow-hidden"
        align="center"
        side="bottom"
        sideOffset={12}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium text-base">{t("notifications")}</h4>
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-sm"
            onClick={() => { 
              setOpen(false) 
              router.push("/app/notifications")
            }}
          >
            {t("viewAllNotifications")}
          </Button>
        </div>

        {/* Usar alturas diferentes baseado no tamanho da tela */}
        <ScrollArea className="h-[65vh] sm:h-[420px]">
          <div className="p-3">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : notifications.totalCount === 0 ? (
              <div className="flex h-[250px] items-center justify-center flex-col p-4 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {notifications.overdueCount > 0 && (
                  <div>
                    <h5 className="text-base font-medium text-rose-600 mb-3">
                      {t("youHaveNTasks").replace("{count}", String(notifications.overdueCount))} {t("overdue")}
                    </h5>
                    <div className="space-y-3">
                      {notifications.tasks.overdueTasks.map(task => (
                        <Card key={task.id} className="cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/10 border-rose-200 dark:border-rose-800 overflow-hidden">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <CardContent 
                              className="p-3 flex-1" 
                              onClick={() => handleViewTask(task)}
                            >
                              <CardTitle className="text-sm sm:text-base mb-1 line-clamp-1">
                                {task.title}
                              </CardTitle>
                              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                                {formatDate(task.due_date!)}
                              </p>
                            </CardContent>
                            <div className="flex justify-end border-t md:border-t-0 md:border-l p-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-1.5 gap-1 text-xs hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/10"
                                onClick={(e) => handleCompleteTask(e, task.id)}
                                disabled={completingTask === task.id}
                              >
                                <Check className="h-3 w-3" />
                                {t("Complete")}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {notifications.dueTodayCount > 0 && (
                  <div>
                    <h5 className="text-base font-medium text-amber-600 mb-3">
                      {t("youHaveNTasks").replace("{count}", String(notifications.dueTodayCount))} {t("dueToday")}
                    </h5>
                    <div className="space-y-3">
                      {notifications.tasks.dueTodayTasks.map(task => (
                        <Card key={task.id} className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 border-amber-200 dark:border-amber-800 overflow-hidden">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <CardContent 
                              className="p-3 flex-1" 
                              onClick={() => handleViewTask(task)}
                            >
                              <CardTitle className="text-sm sm:text-base mb-1 line-clamp-1">
                                {task.title}
                              </CardTitle>
                              <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                                {formatDate(task.due_date!)}
                              </p>
                            </CardContent>
                            <div className="flex justify-end border-t md:border-t-0 md:border-l p-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-1.5 gap-1 text-xs hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/10"
                                onClick={(e) => handleCompleteTask(e, task.id)}
                                disabled={completingTask === task.id}
                              >
                                <Check className="h-3 w-3" />
                                {t("Complete")}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {notifications.upcomingCount > 0 && (
                  <div>
                    <h5 className="text-base font-medium text-blue-600 mb-3">
                      {(() => {
                        if (notifications.upcomingCount === 1 && 
                            notifications.tasks.upcomingTasks.length === 1 && 
                            isTomorrow(new Date(notifications.tasks.upcomingTasks[0].due_date!))) {
                          return t("youHaveNTasks").replace("{count}", "1") + " " + t("taskDueTomorrow");
                        } else {
                          return t("youHaveNTasks").replace("{count}", String(notifications.upcomingCount)) + " " + 
                                 t("dueInNextDays").replace("{days}", String(3));
                        }
                      })()}
                    </h5>
                    <div className="space-y-3">
                      {notifications.tasks.upcomingTasks.map(task => (
                        <Card key={task.id} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 border-blue-200 dark:border-blue-800 overflow-hidden">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <CardContent 
                              className="p-3 flex-1" 
                              onClick={() => handleViewTask(task)}
                            >
                              <CardTitle className="text-sm sm:text-base mb-1 line-clamp-1">
                                {task.title}
                              </CardTitle>
                              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                                {formatDate(task.due_date!)}
                              </p>
                            </CardContent>
                            <div className="flex justify-end border-t md:border-t-0 md:border-l p-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-1.5 gap-1 text-xs hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/10"
                                onClick={(e) => handleCompleteTask(e, task.id)}
                                disabled={completingTask === task.id}
                              >
                                <Check className="h-3 w-3" />
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
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
    
    {selectedTask && (
      <TaskDetail 
        task={selectedTask} 
        open={showTaskDetail} 
        onOpenChange={(open) => {
          console.log("Alterando estado do modal:", open);
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