"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// Definir uma nova interface para as props que inclui indicatorClassName
interface CustomProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CustomProgressProps // Usar a nova interface de props aqui
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    data-testid={props['data-testid'] || "progress"}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all", // Classes padrão do indicador
        indicatorClassName // Adicionar a classe customizada aqui
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      data-testid={props['data-testid'] ? `${props['data-testid']}-indicator` : "progress-indicator"}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
