"use client"

import { useMemo, useState, useCallback, memo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Flag, Clock, CircleDot, Check, Trash, Calendar, FileText, ArrowUpDown } from "lucide-react"
import type { Todo } from "@/lib/todos"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SortOption = "priority" | "title" | "dueDate" | "createdAt"

const TaskItem = memo(({ 
  task, 
  onToggle, 
  onDelete, 
  formatDueDate, 
  getPriorityColor, 
  getPointsColor 
}: {
  task: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  formatDueDate: (date: string | null) => string | null
  getPriorityColor: (priority: number) => string
  getPointsColor: (points: number) => string
}) => {
  return (
    <li 
      className={cn(
        "flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-all",
        task.completed && "opacity-60"
      )}
      data-testid={`task-item-${task.id}`}
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="h-5 w-5"
          data-testid={`task-checkbox-${task.id}`}
        />
        <div>
          <div className={cn("font-medium", task.completed && "line-through")} data-testid={`task-title-${task.id}`}>
            {task.title}
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap" data-testid={`task-metadata-${task.id}`}>
            {task.due_date && (
              <div className="flex items-center text-xs text-muted-foreground" data-testid={`task-due-date-${task.id}`}>
                <Clock className="mr-1 h-3 w-3" />
                <span>{formatDueDate(task.due_date)}</span>
              </div>
            )}
            <div className="flex items-center text-xs" data-testid={`task-priority-${task.id}`}>
              <Flag className={`mr-1 h-3 w-3 ${getPriorityColor(task.priority)}`} />
              <span>P{task.priority}</span>
            </div>
            {task.points && (
              <div className="flex items-center text-xs" data-testid={`task-points-${task.id}`}>
                <CircleDot className={`mr-1 h-3 w-3 ${getPointsColor(task.points)}`} />
                <span>{task.points} pts</span>
              </div>
            )}
            {task.project_name && (
              <div
                className="flex items-center text-xs rounded-full px-2 py-0.5"
                style={{ 
                  backgroundColor: `${task.project_color}20`,
                  color: task.project_color 
                }}
                data-testid={`task-project-${task.id}`}
              >
                <span>{task.project_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700 p-1"
        title="Excluir tarefa"
        aria-label="Excluir tarefa"
        data-testid={`task-delete-button-${task.id}`}
      >
        <Trash className="h-4 w-4" />
      </button>
    </li>
  )
})

TaskItem.displayName = "TaskItem"

export const TodoList = memo(function TodoList({ tasks }: { tasks: Todo[] }) {
  const [sortBy, setSortBy] = useState<SortOption>("priority")
  const [optimisticTasks, setOptimisticTasks] = useState<Todo[]>(tasks)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Sincronizar com as props quando mudarem
  useEffect(() => {
    setOptimisticTasks(tasks)
  }, [tasks])

  const sortedTasks = useMemo(() => {
    const tasksCopy = [...optimisticTasks];
    
    switch (sortBy) {
      case "priority":
        return tasksCopy.sort((a, b) => a.priority - b.priority);
      case "title":
        return tasksCopy.sort((a, b) => a.title.localeCompare(b.title));
      case "dueDate":
        return tasksCopy.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
      case "createdAt":
        return tasksCopy.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      default:
        return tasksCopy;
    }
  }, [optimisticTasks, sortBy]);

  const toggleTaskCompletion = useCallback(async (taskId: number) => {
    // Atualização otimista - atualizar UI imediatamente
    const originalTasks = [...optimisticTasks]
    const updatedTasks = optimisticTasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    )
    setOptimisticTasks(updatedTasks)

    try {
      const response = await fetch(`/api/tasks/toggle/${taskId}`, {
        method: "PATCH",
      })
      
      if (!response.ok) {
        throw new Error(`Failed to toggle task: ${response.statusText}`)
      }

      toast({
        title: t("Task updated"),
        description: t("Task status has been updated."),
      })

      // Sincronização silenciosa - sem refresh imediato para melhor UX

    } catch (error) {
      // Reverter mudanças otimistas em caso de erro
      setOptimisticTasks(originalTasks)
      
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      })
    }
  }, [optimisticTasks, toast, t, router])

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`)
      }

      toast({
        title: t("taskDeleted"),
        description: t("Task has been deleted successfully."),
      })

      router.refresh()

    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again."),
      })
    }
  }, [toast, t, router])

  const getPriorityColor = useCallback((priority: number) => {
    switch (priority) {
      case 1: return "text-red-500"
      case 2: return "text-orange-500"
      case 3: return "text-blue-500"
      default: return "text-gray-400"
    }
  }, [])

  const getPointsColor = useCallback((points: number) => {
    switch (points) {
      case 1: return "text-green-500"
      case 2: return "text-blue-500"
      case 3: return "text-yellow-500"
      case 4: return "text-orange-500"
      case 5: return "text-red-500"
      default: return "text-gray-400"
    }
  }, [])

  const getPointsLabel = useCallback((points: number) => {
    switch (points) {
      case 1: return t("veryEasy") || "Muito fácil"
      case 2: return t("easy") || "Fácil"
      case 3: return t("medium") || "Médio"
      case 4: return t("hard") || "Difícil"
      case 5: return t("veryHard") || "Muito difícil"
      default: return t("medium") || "Médio"
    }
  }, [t])

  const formatDueDate = useCallback((dueDate: string | null) => {
    if (!dueDate) return null

    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    
    const isSameDate = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    };
    
    if (isSameDate(date, today)) {
      return t("today")
    } else if (isSameDate(date, tomorrow)) {
      return t("tomorrow")
    } else {
      return format(date, "dd/MM/yyyy")
    }
  }, [t])

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed" data-testid="todo-list-empty">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="rounded-full bg-primary/10 p-3">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-medium">{t("allCaughtUp")}</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">{t("noTasksMessage")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" data-testid="todo-list">
      <div className="flex items-center justify-end mb-4" data-testid="todo-list-controls">
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]" data-testid="todo-list-sort-trigger">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("Sort by") || "Ordenar por"} />
              </div>
            </SelectTrigger>
            <SelectContent data-testid="todo-list-sort-content">
              <SelectItem value="priority" data-testid="todo-list-sort-priority">
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  {t("Prioridade") || "Prioridade"}
                </div>
              </SelectItem>
              <SelectItem value="title" data-testid="todo-list-sort-title">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {t("Título") || "Título"}
                </div>
              </SelectItem>
              <SelectItem value="dueDate" data-testid="todo-list-sort-duedate">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("Data de Vencimento") || "Data de Vencimento"}
                </div>
              </SelectItem>
              <SelectItem value="createdAt" data-testid="todo-list-sort-createdat">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {t("Data de Criação") || "Data de Criação"}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="space-y-3" data-testid="todo-list-items">
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleTaskCompletion}
            onDelete={deleteTask}
            formatDueDate={formatDueDate}
            getPriorityColor={getPriorityColor}
            getPointsColor={getPointsColor}
          />
        ))}
      </ul>
    </div>
  )
})

export default TodoList 