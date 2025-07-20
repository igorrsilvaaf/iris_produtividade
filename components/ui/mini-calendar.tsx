"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface MiniCalendarProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  className?: string
}

export function MiniCalendar({ 
  currentMonth, 
  onMonthChange, 
  className 
}: MiniCalendarProps) {
  const { language, t } = useTranslation()
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null)

  const formatOptions = language === "pt" ? { locale: ptBR } : undefined

  const getDaysOfWeek = () => {
    if (language === "pt") {
      return ["D", "S", "T", "Q", "Q", "S", "S"]
    } else {
      return ["S", "M", "T", "W", "T", "F", "S"]
    }
  }

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = new Date(monthStart)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    const endDate = new Date(monthEnd)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    onMonthChange(new Date())
  }

  const handleDayClick = (day: Date) => {
    onMonthChange(day)
  }

  return (
    <div className={cn("p-3 bg-card rounded-lg border shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-6 w-6 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold">
            {format(currentMonth, "MMM yyyy", formatOptions)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="h-5 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("today")}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-6 w-6 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {getDaysOfWeek().map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {getCalendarDays().map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isTodayDate = isToday(day)
          const isHovered = hoveredDay && day.toDateString() === hoveredDay.toDateString()

          return (
            <Button
              key={day.getTime()}
              variant="ghost"
              size="sm"
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={cn(
                "h-6 w-6 p-0 text-xs font-normal transition-all duration-200",
                isCurrentMonth
                  ? isTodayDate
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-foreground hover:bg-accent"
                  : "text-muted-foreground hover:text-foreground",
                isHovered && "ring-1 ring-primary/50"
              )}
            >
              {format(day, "d")}
            </Button>
          )
        })}
      </div>
    </div>
  )
} 