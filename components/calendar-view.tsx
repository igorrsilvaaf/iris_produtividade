"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
  isFuture,
  isPast,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import type { Todo } from "@/lib/todos"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { useToast } from "@/components/ui/use-toast"
import { TaskDetail } from "@/components/task-detail"

interface CalendarViewProps {
  userId: number
}

export function CalendarView({ userId }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tasks, setTasks] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true)
      try {
        const start = format(startOfMonth(currentMonth), "yyyy-MM-dd")
        const end = format(endOfMonth(currentMonth), "yyyy-MM-dd")

        const response = await fetch(`/api/tasks/calendar?start=${start}&end=${end}`)

        if (!response.ok) {
          throw new Error("Failed to fetch tasks")
        }

        const data = await response.json()
        setTasks(data.tasks)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load tasks",
          description: "Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [currentMonth, toast])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base sm:text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderDays = () => {
    const days = isMobile ? ["S", "M", "T", "W", "T", "F", "S"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const openTaskDetail = (task: Todo) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const getTaskStatusClass = (task: Todo, day: Date) => {
    if (task.completed) return "bg-green-100 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300"

    if (task.due_date) {
      const dueDate = parseISO(task.due_date)

      if (isToday(dueDate))
        return "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300"
      if (isPast(dueDate)) return "bg-red-100 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300"
      if (isFuture(dueDate)) return "bg-blue-100 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300"
    }

    return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = new Date(monthStart)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    const endDate = new Date(monthEnd)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const dateFormat = "d"
    const rows = []

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    let formattedDays = []

    for (const day of days) {
      const tasksForDay = tasks.filter((task) => {
        if (!task.due_date) return false
        const taskDate = new Date(task.due_date)
        return isSameDay(taskDate, day)
      })

      formattedDays.push(
        <div
          key={day.toString()}
          className={`min-h-[80px] sm:min-h-[120px] p-1 border ${
            isSameMonth(day, currentMonth)
              ? isToday(day)
                ? "bg-primary/5 border-primary"
                : "bg-background"
              : "bg-muted/30 text-muted-foreground"
          }`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-xs sm:text-sm font-medium ${
                isToday(day)
                  ? "bg-primary text-primary-foreground rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                  : ""
              }`}
            >
              {format(day, dateFormat)}
            </span>
            <AddTaskDialog initialProjectId={undefined}>
              <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </AddTaskDialog>
          </div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[100px]">
            {tasksForDay.map((task) => (
              <div
                key={task.id}
                className={`text-[10px] sm:text-xs p-1 rounded truncate border-l-2 cursor-pointer hover:opacity-80 ${getTaskStatusClass(
                  task,
                  day,
                )}`}
                onClick={() => openTaskDetail(task)}
                title={task.title}
              >
                {task.title}
                {task.due_date && new Date(task.due_date).getHours() !== 0 && (
                  <span className="ml-1 font-medium">
                    {format(new Date(task.due_date), "HH:mm")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>,
      )

      if (formattedDays.length === 7) {
        rows.push(
          <div key={day.toString()} className="grid grid-cols-7 gap-1">
            {formattedDays}
          </div>,
        )
        formattedDays = []
      }
    }

    return <div className="space-y-1">{rows}</div>
  }

  return (
    <>
      <Card>
        <CardContent className="p-2 sm:p-4 md:p-6">
          {renderHeader()}
          {renderDays()}
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            renderCells()
          )}
        </CardContent>
      </Card>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={showTaskDetail}
          onOpenChange={(open) => {
            setShowTaskDetail(open)
            if (!open) setSelectedTask(null)
          }}
        />
      )}
    </>
  )
}

