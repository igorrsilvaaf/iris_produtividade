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
}

export function DatePicker({
  date,
  setDate,
  className,
  mode = "single",
  selected,
  onSelect,
  numberOfMonths = 1,
}: DatePickerProps) {
  const { t } = useTranslation()
  
  const handleSelect = React.useCallback(
    (value: Date | DateRange | undefined) => {
      if (onSelect) {
        onSelect(value);
      } else if (setDate && mode === "single" && value instanceof Date) {
        setDate(value);
      }
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
    
    return t("Pick a date");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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