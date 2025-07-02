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
  tasks: Todo[];
  user?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
}

export function TaskList({ tasks, user }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("priority")
  const [optimisticTasks, setOptimisticTasks] = useState<Todo[]>(tasks)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Sincronizar com as props quando mudarem
  useEffect(() => {
    setOptimisticTasks(tasks)
  }, [tasks])
  
  // Listener para o evento de criação de tarefa
  useEffect(() => {
    const handleTaskCreated = (event: CustomEvent) => {
      console.log('[TaskList] Nova tarefa criada:', event.detail);
      
      if (!event.detail || !event.detail.task) return;
      
      const newTask = event.detail.task;
      
      // Adicionar a nova tarefa instantaneamente
      setOptimisticTasks(prevTasks => {
        // Verificar se a tarefa já existe para evitar duplicatas
        if (prevTasks.some(task => task.id === newTask.id)) {
          return prevTasks;
        }
        
        // Adicionar a nova tarefa no início da lista
        return [newTask, ...prevTasks];
      });
    };

    const handleTaskCompleted = (event: CustomEvent) => {
      console.log('[TaskList] Tarefa concluída em outro componente:', event.detail);
      
      if (!event.detail || !event.detail.taskId) return;
      
      const { taskId, completed } = event.detail;
      
      // Se a tarefa foi concluída, remover da lista atual
      if (completed) {
        setOptimisticTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      }
    };
    
    window.addEventListener('taskCreated', handleTaskCreated as EventListener);
    window.addEventListener('taskCompleted', handleTaskCompleted as EventListener);
    
    return () => {
      window.removeEventListener('taskCreated', handleTaskCreated as EventListener);
      window.removeEventListener('taskCompleted', handleTaskCompleted as EventListener);
    };
  }, []);

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

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/toggle/${taskId}`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error(`Failed to toggle task: ${response.statusText}`)
      }

      const taskBeingToggled = optimisticTasks.find(task => task.id === taskId);
      const wasCompleted = !taskBeingToggled?.completed;

      toast({
        title: t("Task updated"),
        description: t("Task status has been updated."),
      })

      // Disparar evento para outros componentes
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('taskCompleted', { 
          detail: { 
            taskId: taskId, 
            completed: wasCompleted,
            timestamp: Date.now() 
          }
        });
        window.dispatchEvent(event);
      }

      // Se a tarefa foi concluída, remover da lista atual
      if (wasCompleted) {
        setOptimisticTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        // Se foi desmarcada, atualizar localmente
        setOptimisticTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, completed: false }
              : task
          )
        );
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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-medium">{t("allCaughtUp")}</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">{t("noTasksMessage")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("Sort by")}:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("Sort by")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  {t("Prioridade")}
                </div>
              </SelectItem>
              <SelectItem value="title">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {t("Descrição")}
                </div>
              </SelectItem>
              <SelectItem value="dueDate">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("Data de Vencimento")}
                </div>
              </SelectItem>
              <SelectItem value="createdAt">
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
            className={cn(
              "flex flex-col rounded-lg border p-3 text-left text-sm transition-all duration-300 ease-in-out hover:bg-accent hover:shadow-md cursor-pointer",
              task.completed && "opacity-50 bg-muted/30"
            )}
            onClick={() => openTaskDetail(task)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
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
                    className={cn(
                      "font-medium cursor-pointer transition-colors duration-300 ease-in-out",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </div>
                  {!expandedTask && task.description && (
                    <div
                      className="text-xs text-muted-foreground line-clamp-1 cursor-pointer transition-opacity duration-300 ease-in-out"
                    >
                      {processDescription(task.description)}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {task.due_date && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{formatDueDate(task.due_date)}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs">
                      <Flag className={`mr-1 h-3 w-3 ${getPriorityColor(task.priority)}`} />
                      <span>{getPriorityLabel(task.priority)}</span>
                    </div>
                    {task.points && (
                      <div className="flex items-center text-xs">
                        <CircleDot className={`mr-1 h-3 w-3 ${getPointsColor(task.points)}`} />
                        <span>{task.points} - {getPointsLabel(task.points)}</span>
                      </div>
                    )}
                    {task.project_name && (
                      <div
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
                className="mt-2 text-sm text-muted-foreground p-2 bg-muted/30 rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <MarkdownRenderer content={task.description} />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={showTaskDetail}
          onOpenChange={(open) => {
            setShowTaskDetail(open)
            if (!open) setSelectedTask(null)
          }}
          user={user}
        />
      )}
    </div>
  )
}
