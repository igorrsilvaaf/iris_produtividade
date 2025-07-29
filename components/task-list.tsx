"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Check, ChevronRight, Edit, Flag, MoreHorizontal, Trash, ArrowUpDown, Clock, FileText, Link, Timer, CircleDot } from "lucide-react"
import type { Todo } from "@/lib/todos"
import type { TodoWithEditMode } from "@/components/task-detail"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { TaskDetail } from "@/components/task-detail"
import { useTranslation } from "@/lib/i18n"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { useTaskContext } from "@/contexts/task-context"
import { useTaskUpdates } from "@/hooks/use-task-updates"

type SortOption = "priority" | "title" | "dueDate" | "createdAt"

const processDescription = (text: string) => {
  if (!text) return "";
  
  const truncatedText = text.length > 100 
    ? text.substring(0, 100) + '...'
    : text;
    
  return truncatedText
    .replace(/#{1,6}\s/g, '') 
    .replace(/\*\*(.+?)\*\*/g, '$1') 
    .replace(/\*(.+?)\*/g, '$1') 
    .replace(/~~(.+?)~~/g, '$1') 
    .replace(/`(.+?)`/g, '$1') 
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') 
    .replace(/!\[(.+?)\]\(.+?\)/g, '[Image: $1]') 
    .replace(/```[\s\S]+?```/g, '[Code block]') 
    .replace(/^>\s(.+)$/gm, '$1') 
    .replace(/^-\s(.+)$/gm, '• $1') 
    .replace(/\[([ xX]?)\]/g, (match, inside) => inside === 'x' || inside === 'X' ? '✓ ' : '□ ');
};

interface TaskListProps {
  initialTasks?: Todo[];
  user?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  showCompleted?: boolean;
}

export function TaskList({ initialTasks, user, showCompleted = false }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("priority")
  const [localTasks, setLocalTasks] = useState<Todo[]>(initialTasks || [])
  const { notifyTaskCompleted, notifyTaskDeleted } = useTaskUpdates()
  const { state } = useTaskContext()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Atualizar tarefas locais quando initialTasks mudar
  useEffect(() => {
    if (initialTasks) {
      setLocalTasks(initialTasks)
    }
  }, [initialTasks])

  // Escutar notificações de criação de tarefas
  useEffect(() => {
    if (state.tasks.length > 0) {
      const lastTask = state.tasks[0] // A tarefa mais recente
      const taskExists = localTasks.some(task => task.id === lastTask.id)
      
      // Só adicionar se a tarefa não existe e é apropriada para esta página
      if (!taskExists) {
        if (showCompleted) {
          // Na página de concluídos, só adicionar se a tarefa estiver concluída
          if (lastTask.completed) {
            setLocalTasks(prevTasks => [lastTask, ...prevTasks])
          }
        } else {
          // Nas páginas ativas, só adicionar se a tarefa NÃO estiver concluída
          if (!lastTask.completed) {
            setLocalTasks(prevTasks => [lastTask, ...prevTasks])
          }
        }
      }
    }
  }, [state.lastUpdate, state.tasks, localTasks, showCompleted])

  // Usar tarefas locais em vez do contexto global
  const tasks = localTasks

  const sortedTasks = useMemo(() => {
    const tasksCopy = [...tasks];
    
    // Filtrar tarefas baseado na prop showCompleted
    let filteredTasks = tasksCopy;
    if (!showCompleted) {
      // Se não deve mostrar concluídas, filtra apenas incompletas
      filteredTasks = tasksCopy.filter(task => !task.completed);
    } else {
      // Se deve mostrar concluídas, filtra apenas concluídas
      filteredTasks = tasksCopy.filter(task => task.completed);
    }
    
    switch (sortBy) {
      case "priority":
        return filteredTasks.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
      case "title":
        return filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
      case "dueDate":
        return filteredTasks.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
      case "createdAt":
        return filteredTasks.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      default:
        return filteredTasks;
    }
  }, [tasks, sortBy, showCompleted]);

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/toggle/${taskId}`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error(`Failed to toggle task: ${response.statusText}`)
      }

      const result = await response.json()

      // Atualizar estado local baseado no novo status
      setLocalTasks(prevTasks => {
        if (showCompleted) {
          // Na página de concluídos: adicionar se concluída, remover se não concluída
          if (result.task.completed) {
            // Adicionar se não existe
            const exists = prevTasks.some(task => task.id === taskId)
            if (!exists) {
              return [result.task, ...prevTasks]
            } else {
              // Atualizar se existe
              return prevTasks.map(task => task.id === taskId ? result.task : task)
            }
          } else {
            // Remover se não está mais concluída
            return prevTasks.filter(task => task.id !== taskId)
          }
        } else {
          // Nas páginas ativas: remover se concluída, adicionar se não concluída
          if (result.task.completed) {
            // Remover se foi concluída
            return prevTasks.filter(task => task.id !== taskId)
          } else {
            // Adicionar se não está mais concluída
            const exists = prevTasks.some(task => task.id === taskId)
            if (!exists) {
              return [result.task, ...prevTasks]
            } else {
              // Atualizar se existe
              return prevTasks.map(task => task.id === taskId ? result.task : task)
            }
          }
        }
      })

      toast({
        title: t("Task updated"),
        description: t("Task status has been updated."),
      })

      // Notificar sobre a atualização da task (para outras funcionalidades)
      if (result.task) {
        notifyTaskCompleted(taskId, result.task)
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      })
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`)
      }

      // Atualizar estado local
      setLocalTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      )

      toast({
        title: t("taskDeleted"),
        description: t("Task has been deleted successfully."),
      })

      // Notificar sobre a remoção da task (para outras funcionalidades)
      notifyTaskDeleted(taskId)

    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again."),
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

  const getPointsColor = (points: number) => {
    switch (points) {
      case 1:
        return "text-green-500"
      case 2:
        return "text-blue-500"
      case 3:
        return "text-yellow-500"
      case 4:
        return "text-orange-500"
      case 5:
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }

  const getPointsLabel = (points: number) => {
    switch (points) {
      case 1:
        return t("veryEasy") || "Muito fácil"
      case 2:
        return t("easy") || "Fácil"
      case 3:
        return t("medium") || "Médio"
      case 4:
        return t("hard") || "Difícil"
      case 5:
        return t("veryHard") || "Muito difícil"
      default:
        return t("medium") || "Médio"
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return t("Grave")
      case 2:
        return t("Alta")
      case 3:
        return t("Média")
      case 4:
        return t("Baixa")
      default:
        return t("Baixa")
    }
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null

    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const isAllDay = date.getHours() === 0 && date.getMinutes() === 0;
    
    let dateDisplay;
    
    const isSameDate = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    };
    
    if (isSameDate(date, today)) {
      dateDisplay = t("today");
    } else if (isSameDate(date, tomorrow)) {
      dateDisplay = t("tomorrow");
    } else {
      if (date.getFullYear() !== today.getFullYear()) {
        dateDisplay = format(date, "MMM d, yyyy");
      } else {
        dateDisplay = format(date, "MMM d");
      }
    }
    
    if (!isAllDay) {
      return `${dateDisplay} ${format(date, "HH:mm")}`;
    }
    
    return dateDisplay;
  }

  const openTaskDetail = (task: Todo) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const openTaskDetailInEditMode = (task: Todo) => {
    setSelectedTask({...task, isEditMode: true} as TodoWithEditMode)
    setShowTaskDetail(true)
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed" data-testid="task-list-empty">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-medium" data-testid="task-list-empty-title">{t("allCaughtUp")}</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground" data-testid="task-list-empty-message">{t("noTasksMessage")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" data-testid="task-list">
      <div className="flex items-center justify-end" data-testid="task-list-controls">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground" data-testid="sort-by-label">{t("Sort by")}:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]" data-testid="task-list-sort-trigger">
              <SelectValue placeholder={t("Sort by")} />
            </SelectTrigger>
            <SelectContent data-testid="task-list-sort-content">
              <SelectItem value="priority" data-testid="task-list-sort-priority">
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  {t("Prioridade")}
                </div>
              </SelectItem>
              <SelectItem value="title" data-testid="task-list-sort-title">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {t("Descrição")}
                </div>
              </SelectItem>
              <SelectItem value="dueDate" data-testid="task-list-sort-duedate">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("Data de Vencimento")}
                </div>
              </SelectItem>
              <SelectItem value="createdAt" data-testid="task-list-sort-createdat">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {t("Data de Criação")}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            data-testid={`task-item-${task.id}`}
            className={cn(
              "flex flex-col rounded-lg border p-3 text-left text-sm transition-all duration-300 ease-in-out hover:bg-accent hover:shadow-md cursor-pointer",
              task.completed && "opacity-50 bg-muted/30"
            )}
            onClick={() => openTaskDetail(task)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  data-testid={`task-checkbox-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className={cn(
                    "h-5 w-5 transition-all duration-300 ease-in-out",
                    task.completed ? "data-[state=checked]:scale-125" : "scale-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <div
                    data-testid={`task-title-${task.id}`}
                    className={cn(
                      "font-medium cursor-pointer transition-colors duration-300 ease-in-out",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </div>
                  {!expandedTask && task.description && (
                    <div
                      data-testid={`task-description-${task.id}`}
                      className="text-xs text-muted-foreground line-clamp-1 cursor-pointer transition-opacity duration-300 ease-in-out"
                    >
                      {processDescription(task.description)}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {task.due_date && (
                      <div data-testid={`task-duedate-${task.id}`} className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{formatDueDate(task.due_date)}</span>
                      </div>
                    )}
                    <div data-testid={`task-priority-${task.id}`} className="flex items-center text-xs">
                      <Flag className={`mr-1 h-3 w-3 ${getPriorityColor(task.priority ?? 0)}`} />
                      <span>{getPriorityLabel(task.priority ?? 0)}</span>
                    </div>
                    {task.points && (
                      <div data-testid={`task-points-${task.id}`} className="flex items-center text-xs">
                        <CircleDot className={`mr-1 h-3 w-3 ${getPointsColor(task.points)}`} />
                        <span>{task.points} - {getPointsLabel(task.points)}</span>
                      </div>
                    )}
                    {task.project_name && (
                      <div
                        data-testid={`task-project-${task.id}`}
                        className="flex items-center text-xs rounded-full px-2 py-0.5 whitespace-nowrap"
                        style={{ 
                          backgroundColor: `${task.project_color}10`,
                          color: task.project_color 
                        }}
                      >
                        <span>{task.project_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      data-testid={`task-options-button-${task.id}`}
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t("options")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem 
                      data-testid={`task-edit-button-${task.id}`}
                      onSelect={(e) => {
                        e.preventDefault();
                        openTaskDetailInEditMode(task);
                      }}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      data-testid={`task-pomodoro-button-${task.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/app/pomodoro?taskId=${task.id}`);
                      }}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Timer className="mr-2 h-4 w-4" />
                      {t("startPomodoro")}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      data-testid={`task-delete-button-${task.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  data-testid={`task-expand-button-${task.id}`}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedTask(expandedTask === task.id ? null : task.id);
                  }}
                >
                  <ChevronRight className={`h-4 w-4 ${expandedTask === task.id ? "transform rotate-90" : ""}`} />
                  <span className="sr-only">{t("view")}</span>
                </Button>
              </div>
            </div>
            
            {expandedTask === task.id && task.description && (
              <div 
                data-testid={`task-expanded-description-${task.id}`}
                className="mt-2 text-sm text-muted-foreground p-2 bg-muted/30 rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <MarkdownRenderer content={task.description} />
              </div>
            )}
