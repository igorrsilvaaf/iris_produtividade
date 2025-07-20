"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Todo } from "@/lib/todos"

interface TaskTooltipProps {
  task: Todo
  language: string
  className?: string
}

export function TaskTooltip({ task, language, className }: TaskTooltipProps) {
  const formatOptions = language === "pt" ? { locale: ptBR } : undefined
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-red-500 text-red-50"
      case 2: return "bg-orange-500 text-orange-50"
      case 3: return "bg-yellow-500 text-yellow-50"
      case 4: return "bg-blue-500 text-blue-50"
      case 5: return "bg-green-500 text-green-50"
      default: return "bg-gray-500 text-gray-50"
    }
  }

  return (
    <div className={cn("p-3 space-y-3 min-w-[280px]", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm leading-tight">
            {task.title}
          </h4>
        </div>
        <Badge 
          variant="secondary" 
          className={cn("text-xs", getPriorityColor(task.priority))}
        >
          P{task.priority}
        </Badge>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Details */}
      <div className="space-y-2 text-xs">
        {task.due_date && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-medium">
              {format(new Date(task.due_date), "PPp", formatOptions)}
            </span>
          </div>
        )}
        
        {task.points && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Points:</span>
            <span className="font-medium">{task.points}</span>
          </div>
        )}
        
        {task.estimated_time && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated:</span>
            <span className="font-medium">{task.estimated_time}min</span>
          </div>
        )}
        
        {task.project && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Project:</span>
            <span className="font-medium">{task.project.name}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Badge 
            variant={task.completed ? "default" : "secondary"}
            className="text-xs"
          >
            {task.completed ? "Completed" : "Pending"}
          </Badge>
        </div>
      </div>
    </div>
  )
} 