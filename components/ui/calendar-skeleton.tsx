"use client"

import { cn } from "@/lib/utils"

interface CalendarSkeletonProps {
  className?: string
}

export function CalendarSkeleton({ className }: CalendarSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted animate-pulse rounded-md" />
          <div className="w-8 h-8 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-muted animate-pulse rounded" />
          <div className="w-32 h-6 bg-muted animate-pulse rounded-md" />
          <div className="w-12 h-5 bg-muted animate-pulse rounded" />
        </div>
        <div className="w-16 h-8 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Days Header Skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "min-h-[80px] sm:min-h-[120px] p-2 border rounded-lg",
                  "bg-muted animate-pulse"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-6 h-6 bg-muted-foreground/20 animate-pulse rounded-full" />
                  <div className="w-5 h-5 bg-muted-foreground/20 animate-pulse rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-3 bg-muted-foreground/20 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted-foreground/20 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
} 