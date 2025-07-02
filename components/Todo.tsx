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
        "p-4 border rounded-lg mb-2 hover:shadow-md transition-all",
        todoData.completed ? 'bg-gray-50 dark:bg-gray-900' : '',
        onClick ? 'cursor-pointer hover:bg-accent' : ''
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex justify-between">
        <h3 className={cn("font-medium text-base", todoData.completed ? 'line-through opacity-70' : '')}>
          {todoData.title}
        </h3>
        {todoData.completed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CheckCircle2 data-testid="check-icon" className="text-green-500 h-5 w-5" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t ? t("Completed") : "Concluído"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {todoData.description && (
        <p className={cn("text-sm text-muted-foreground mt-2 line-clamp-2", todoData.completed ? 'opacity-70' : '')}>
          {todoData.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {todoData.due_date && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>{formatDueDate(todoData.due_date, t)}</span>
          </div>
        )}
        {todoData.priority && (
          <div className="flex items-center text-xs">
            <Flag className={`mr-1 h-3 w-3 ${getPriorityColor(todoData.priority)}`} />
            <span>P{todoData.priority}</span>
          </div>
        )}
        {todoData.points && (
          <div className="flex items-center text-xs">
            <CircleDot className={`mr-1 h-3 w-3 ${getPointsColor(todoData.points)}`} />
            <span>{todoData.points} - {getPointsLabel(todoData.points)}</span>
          </div>
        )}
        {todoData.project_name && (
          <div
            className="flex items-center text-xs rounded-full px-2 py-0.5"
            style={{ 
              backgroundColor: `${todoData.project_color}20`,
              color: todoData.project_color 
            }}
          >
            <span>{todoData.project_name}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {!todoData.completed && (
          <button 
            onClick={handleComplete}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
          >
            {t ? t("Complete") : "Completar"}
          </button>
        )}
        <button 
          onClick={handleDelete}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          {t ? t("Delete") : "Excluir"}
        </button>
      </div>
    </div>
  )
}

export default Todo 