"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTranslation } from "@/lib/i18n"
import { DateRange } from "react-day-picker"

interface DatePickerProps {
  date?: Date
  setDate?: (date: Date | undefined) => void
  className?: string
  mode?: "single" | "range"
  selected?: Date | DateRange
  onSelect?: (value: Date | DateRange | undefined) => void
  numberOfMonths?: number
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({
  date,
  setDate,
  className,
  mode = "single",
  selected,
  onSelect,
  numberOfMonths = 1,
  disabled = false,
  placeholder,
}: DatePickerProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleSelect = React.useCallback(
    (value: Date | DateRange | undefined) => {
      if (onSelect) {
        onSelect(value);
      } else if (setDate && mode === "single" && value instanceof Date) {
        setDate(value);
      }
      // Fechar popover após seleção
      setTimeout(() => setIsOpen(false), 150);
    },
    [onSelect, setDate, mode]
  );

  const getDisplayValue = () => {
    if (mode === "range" && selected && typeof selected === "object" && "from" in selected) {
      const { from, to } = selected as DateRange;
      
      if (from && to) {
        return `${format(from, "PP")} - ${format(to, "PP")}`;
      }
      
      if (from) {
        return format(from, "PP");
      }
    } else if (mode === "single" && selected && selected instanceof Date && isValid(selected)) {
      return format(selected, "PP");
    }
    
    return placeholder || t("Pick a date");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal transition-all duration-200 hover:bg-accent/50",
              !selected && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              isOpen && "ring-2 ring-primary/20 bg-accent/50"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{getDisplayValue()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 shadow-lg border-0" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          {mode === "range" ? (
            <Calendar
              mode="range"
              selected={selected as DateRange}
              onSelect={handleSelect as (value: DateRange | undefined) => void}
              numberOfMonths={numberOfMonths}
              initialFocus
            />
          ) : (
            <Calendar
              mode="single"
              selected={selected as Date}
              onSelect={handleSelect as (value: Date | undefined) => void}
              numberOfMonths={numberOfMonths}
              initialFocus
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
} 