"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Todo } from "@/lib/todos"

interface DraggableTaskProps {
  task: Todo
  language: string
  getTaskStatusClass: (task: Todo) => string
  onClick: (task: Todo) => void
  className?: string
}

export function DraggableTask({
  task,
  language,
  getTaskStatusClass,
  onClick,
  className
}: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
    data: {
      type: "task",
      task,
    },
  })

  const formatOptions = language === "pt" ? { locale: ptBR } : undefined

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "text-[10px] sm:text-xs p-1.5 rounded-md truncate border-l-2 cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-[1.02]",
        getTaskStatusClass(task),
        isDragging && "opacity-50 scale-105 z-50",
        className
      )}
      onClick={() => onClick(task)}
    >
      <div className="flex items-center justify-between">
        <span className="truncate flex-1">{task.title}</span>
        {task.due_date && new Date(task.due_date).getHours() !== 0 && (
          <span className="ml-1 font-medium text-[9px] opacity-75">
            {format(new Date(task.due_date), "HH:mm", formatOptions)}
          </span>
        )}
      </div>
    </div>
  )
} 