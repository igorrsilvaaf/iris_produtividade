"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

interface TooltipTriggerProps 
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {
  'data-testid'?: string
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  TooltipTriggerProps
>(({ 'data-testid': testId, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    data-testid={testId || 'tooltip-trigger'}
    {...props}
  />
))

TooltipTrigger.displayName = 'TooltipTrigger'

interface TooltipContentProps 
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  'data-testid'?: string
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, 'data-testid': testId, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    data-testid={testId || 'tooltip-content'}
    role="tooltip"
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
