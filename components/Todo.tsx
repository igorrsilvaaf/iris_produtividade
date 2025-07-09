"use client"

import { useState, useEffect, useRef } from "react"
import type { Todo as TodoType } from "@/lib/todos"
import { CircleDot, Flag, Clock, Trash, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TodoProps {
  todo?: TodoType
  onComplete?: (id: number) => void
  onDelete?: (id: number) => void
  onClick?: (todo: TodoType) => void
}

// Helper function to get points color
function getPointsColor(points: number) {
  switch (points) {
    case 1: return "text-green-500"
    case 2: return "text-blue-500"
    case 3: return "text-yellow-500" 
    case 4: return "text-orange-500"
    case 5: return "text-red-500"
    default: return "text-blue-500"
  }
}

// Helper function to get points label
function getPointsLabel(points: number) {
  switch (points) {
    case 1: return "Muito Fácil"
    case 2: return "Fácil"
    case 3: return "Médio"
    case 4: return "Difícil"
    case 5: return "Muito Difícil"
    default: return "Médio"
  }
}

// Helper function to get priority color
function getPriorityColor(priority: number) {
  switch (priority) {
    case 1: return "text-red-500"
    case 2: return "text-orange-500"
    case 3: return "text-blue-500"
    default: return "text-gray-400"
  }
}

// Helper function to format the due date
function formatDueDate(dueDate: string | null, t: any) {
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
  
  // Verifica se o horário não é 00:00
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  const timeString = hasTime ? ` ${format(date, "HH:mm")}` : "";
  
  if (isSameDate(date, today)) {
    return hasTime 
      ? `${t ? t("today") : "Hoje"}${timeString}`
      : t ? t("today") : "Hoje"
  } else if (isSameDate(date, tomorrow)) {
    return hasTime 
      ? `${t ? t("tomorrow") : "Amanhã"}${timeString}`
      : t ? t("tomorrow") : "Amanhã"
  } else {
    return hasTime 
      ? `${format(date, "dd/MM/yyyy")}${timeString}`
      : format(date, "dd/MM/yyyy")
  }
}

export function Todo({ todo, onComplete, onDelete, onClick }: TodoProps) {
  const [isClient, setIsClient] = useState(false)
  const [optimisticTodo, setOptimisticTodo] = useState<TodoType | null>(todo || null)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  
  // Usar ref para rastrear a primeira renderização
  const initialLoadDone = useRef(false)
  
  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Estado para dados locais
  const [localData, setLocalData] = useState<TodoType | null>(null)

  // Sincronizar com props quando mudarem
  useEffect(() => {
    if (todo) {
      setOptimisticTodo(todo)
    }
  }, [todo])
  
  // Carregar dados do localStorage apenas no cliente e apenas na primeira renderização
  useEffect(() => {
    if (!isClient || initialLoadDone.current) return
    
    try {
      if (!todo && localStorage) {
        const saved = localStorage.getItem('todo-data')
        if (saved) {
          const parsed = JSON.parse(saved)
          setLocalData(parsed)
          setOptimisticTodo(parsed)
        }
      }
      initialLoadDone.current = true
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error)
    }
  }, [isClient, todo])

  useEffect(() => {
    if (!isClient || !optimisticTodo) return
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('todo-data', JSON.stringify(optimisticTodo))
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error)
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [isClient, optimisticTodo])

  const todoData = optimisticTodo || localData
  
  if (!todoData) {
    return null
  }

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onComplete) {
      onComplete(todoData.id)
    } else {
      try {
        const response = await fetch(`/api/tasks/toggle/${todoData.id}`, {
          method: "PATCH",
        })
        
        if (!response.ok) {
          throw new Error(`Failed to toggle task: ${response.statusText}`)
        }
        
        const updatedTask = { ...todoData, completed: !todoData.completed }
        
        toast({
          title: t ? t("Task updated") : "Tarefa atualizada",
          description: t ? t("Task status has been updated.") : "O status da tarefa foi atualizado.",
        })
        
        // Disparar evento para outros componentes
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('taskCompleted', { 
            detail: { 
              taskId: todoData.id, 
              completed: updatedTask.completed,
              timestamp: Date.now() 
            }
          });
          window.dispatchEvent(event);
        }
        
        // Se a tarefa foi concluída, remover da visualização atual
        if (updatedTask.completed && onDelete) {
          setTimeout(() => {
            onDelete(todoData.id);
          }, 100);
        }
        
      } catch (error) {
        toast({
          variant: "destructive",
          title: t ? t("Failed to update task") : "Falha ao atualizar tarefa",
          description: t ? t("Please try again.") : "Por favor, tente novamente.",
        })
      }
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(todoData.id)
    } else {
      try {
        const response = await fetch(`/api/tasks/${todoData.id}/${todoData.id}`, {
          method: "DELETE",
        })
        
        if (!response.ok) {
          throw new Error(`Failed to delete task: ${response.statusText}`)
        }
        
        toast({
          title: t ? t("taskDeleted") : "Tarefa excluída",
          description: t ? t("Task has been deleted successfully.") : "A tarefa foi excluída com sucesso.",
        })
        
        router.refresh()
      } catch (error) {
        toast({
          variant: "destructive",
          title: t ? t("Failed to delete task") : "Falha ao excluir tarefa",
          description: t ? t("Please try again.") : "Por favor, tente novamente.",
        })
      }
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick(todoData)
    }
  }
  
  return (
    <div 
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer",
        todoData.completed && "opacity-60 bg-muted/30"
      )}
      onClick={handleClick}
      data-testid={`todo-item-${todoData.id}`}
    >
      <div 
        className="flex items-center" 
        onClick={(e) => e.stopPropagation()}
        data-testid={`todo-checkbox-wrapper-${todoData.id}`}
      >
        <input
          type="checkbox"
          checked={todoData.completed}
          onChange={handleComplete}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          data-testid={`todo-checkbox-${todoData.id}`}
          aria-label={`Marcar tarefa ${todoData.title} como ${todoData.completed ? 'incompleta' : 'concluída'}`}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 
            className={cn(
              "font-medium truncate",
              todoData.completed && "line-through text-muted-foreground"
            )}
            data-testid={`todo-title-${todoData.id}`}
          >
            {todoData.title}
          </h3>
          
          {todoData.priority && todoData.priority <= 3 && (
            <Flag 
              className={cn("h-4 w-4 shrink-0", getPriorityColor(todoData.priority))}
              data-testid={`todo-priority-flag-${todoData.id}`}
            />
          )}
          
          {todoData.points && todoData.points > 0 && (
            <div 
              className="flex items-center gap-1"
              data-testid={`todo-points-${todoData.id}`}
            >
              <CircleDot className={cn("h-3 w-3", getPointsColor(todoData.points))} />
              <span className="text-xs text-muted-foreground">{todoData.points}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {todoData.due_date && (
            <div 
              className="flex items-center gap-1"
              data-testid={`todo-due-date-${todoData.id}`}
            >
              <Clock className="h-3 w-3" />
              <span>{formatDueDate(todoData.due_date, t)}</span>
            </div>
          )}
          
          {todoData.project_name && (
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ 
                backgroundColor: `${todoData.project_color}20`,
                color: todoData.project_color 
              }}
              data-testid={`todo-project-${todoData.id}`}
            >
              <span>{todoData.project_name}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDelete}
                className="p-1 rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive"
                data-testid={`todo-delete-button-${todoData.id}`}
                aria-label={`Excluir tarefa ${todoData.title}`}
              >
                <Trash className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Delete task")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleComplete}
                className="p-1 rounded-md hover:bg-green-500/10 text-green-500 hover:text-green-600"
                data-testid={`todo-complete-button-${todoData.id}`}
                aria-label={`${todoData.completed ? 'Marcar como incompleta' : 'Marcar como concluída'} tarefa ${todoData.title}`}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{todoData.completed ? t("Mark as incomplete") : t("Mark as complete")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default Todo 