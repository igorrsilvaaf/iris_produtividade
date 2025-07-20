"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { format, isSameMonth, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddTaskDialog } from "@/components/add-task-dialog"
import type { Todo } from "@/lib/todos"

interface CalendarDropZoneProps {
  day: Date
  currentMonth: Date
  tasks: Todo[]
  language: string
  onTaskClick: (task: Todo) => void
  onTaskDrop: (taskId: number, newDate: Date) => void
  getTaskStatusClass: (task: Todo) => string
  children: React.ReactNode
}

export function CalendarDropZone({
  day,
  currentMonth,
  tasks,
  language,
  onTaskClick,
  onTaskDrop,
  getTaskStatusClass,
  children
}: CalendarDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.toISOString()}`,
    data: {
      type: "day",
      date: day,
    },
  })

  const formatOptions = language === "pt" ? { locale: ptBR } : undefined
  const dateFormat = "d"
  const isCurrentMonth = isSameMonth(day, currentMonth)
  const isTodayDate = isToday(day)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] sm:min-h-[120px] p-2 border rounded-lg transition-all duration-200",
        isCurrentMonth
          ? isTodayDate
            ? "bg-primary/10 border-primary/50 shadow-md"
            : "bg-background hover:bg-accent/50 border-border"
          : "bg-muted/30 text-muted-foreground border-muted",
        isOver && "ring-2 ring-primary/50 bg-primary/5",
        tasks.length > 0 && "border-l-4 border-l-primary/50"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={cn(
            "text-xs sm:text-sm font-medium transition-all duration-200",
            isTodayDate
              ? "bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-sm"
              : "text-foreground"
          )}
        >
          {format(day, dateFormat, formatOptions)}
        </span>
        <AddTaskDialog
          initialProjectId={undefined}
          initialLanguage={language}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </AddTaskDialog>
      </div>
      
      <div className="space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[100px]">
        {children}
      </div>
    </div>
  )
} 