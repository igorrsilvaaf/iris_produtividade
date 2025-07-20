"use client"

import { cn } from "@/lib/utils"
import { Circle, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface TaskStatusIndicatorProps {
  status: "completed" | "today" | "overdue" | "upcoming" | "default"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TaskStatusIndicator({ 
  status, 
  size = "sm", 
  className 
}: TaskStatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4"
  }

  const iconSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  }

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      className: "text-green-500 bg-green-100 dark:bg-green-900/20"
    },
    today: {
      icon: Clock,
      className: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20"
    },
    overdue: {
      icon: AlertCircle,
      className: "text-red-500 bg-red-100 dark:bg-red-900/20"
    },
    upcoming: {
      icon: Circle,
      className: "text-blue-500 bg-blue-100 dark:bg-blue-900/20"
    },
    default: {
      icon: Circle,
      className: "text-gray-500 bg-gray-100 dark:bg-gray-800"
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full",
      config.className,
      sizeClasses[size],
      className
    )}>
      <Icon className={cn(iconSize[size], "fill-current")} />
    </div>
  )
} 