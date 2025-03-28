"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Check, ChevronRight, Edit, Flag, MoreHorizontal, Trash } from "lucide-react"
import type { Todo } from "@/lib/todos"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { TaskDetail } from "@/components/task-detail"

export function TaskList({ tasks }: { tasks: Todo[] }) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}/toggle`, {
        method: "PATCH",
      })

      toast({
        title: "Task updated",
        description: "Task status has been updated.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: "Please try again.",
      })
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: "Please try again.",
      })
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "text-red-500"
      case 2:
        return "text-orange-500"
      case 3:
        return "text-blue-500"
      default:
        return "text-gray-400"
    }
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null

    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return format(date, "MMM d")
    }
  }

  const openTaskDetail = (task: Todo) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-medium">All caught up!</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You don&apos;t have any tasks for today. Add a new task to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <div className="flex items-start p-3 sm:p-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              className="mt-1 flex-shrink-0"
            />
            <div
              className="ml-3 flex-1 cursor-pointer min-w-0"
              onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className={cn("font-medium truncate", task.completed && "line-through text-muted-foreground")}>
                  {task.title}
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 ml-1">
                  <ChevronRight
                    className={cn("h-4 w-4 transition-transform", expandedTask === task.id && "rotate-90")}
                  />
                </Button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {task.project_name && (
                  <span className="flex items-center gap-1 max-w-[120px] truncate">
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.project_color }}
                    />
                    <span className="truncate">{task.project_name}</span>
                  </span>
                )}
                {task.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    {formatDueDate(task.due_date)}
                  </span>
                )}
                {task.priority < 4 && <Flag className={cn("h-3 w-3 flex-shrink-0", getPriorityColor(task.priority))} />}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openTaskDetail(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteTask(task.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {expandedTask === task.id && task.description && (
            <CardContent className="border-t bg-muted/50 px-4 py-3">
              <p className="text-sm break-words">{task.description}</p>
            </CardContent>
          )}
        </Card>
      ))}

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
    </div>
  )
}

