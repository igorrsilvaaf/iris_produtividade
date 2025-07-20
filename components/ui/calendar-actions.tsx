"use client"

import { useState } from "react"
import { Download, Calendar, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTranslation } from "@/lib/i18n"
import { downloadICalFile, getCalendarStats } from "@/lib/ical-export"
import { MiniCalendar } from "@/components/ui/mini-calendar"
import type { Todo } from "@/lib/todos"

interface CalendarActionsProps {
  tasks: Todo[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
  showCompleted?: boolean
  onToggleCompleted?: (show: boolean) => void
  className?: string
}

export function CalendarActions({
  tasks,
  currentMonth,
  onMonthChange,
  showCompleted = true,
  onToggleCompleted,
  className
}: CalendarActionsProps) {
  const { t } = useTranslation()
  const [showMiniCalendar, setShowMiniCalendar] = useState(false)

  const stats = getCalendarStats(tasks)

  const handleExport = () => {
    downloadICalFile(
      tasks,
      `iris-calendar-${new Date().toISOString().split('T')[0]}.ics`,
      {
        includeCompleted: false,
        includeDescription: true,
        calendarName: "Íris Tasks"
      }
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stats Badge */}
      <Badge variant="outline" className="text-xs">
        {stats.total} {t("tasks")} • {stats.completionRate}% {t("completed")}
      </Badge>

      {/* Toggle Completed */}
      {onToggleCompleted && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleCompleted(!showCompleted)}
          className="h-8"
        >
          {showCompleted ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
          {showCompleted ? t("hideCompleted") : t("showCompleted")}
        </Button>
      )}

      {/* Mini Calendar */}
      <Popover open={showMiniCalendar} onOpenChange={setShowMiniCalendar}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Calendar className="w-3 h-3 mr-1" />
            {t("quickNav")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <MiniCalendar
            currentMonth={currentMonth}
            onMonthChange={(date) => {
              onMonthChange(date)
              setShowMiniCalendar(false)
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Export Calendar */}
      <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
        <Download className="w-3 h-3 mr-1" />
        {t("export")}
      </Button>
    </div>
  )
} 