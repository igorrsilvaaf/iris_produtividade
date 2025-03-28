import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>

          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <Skeleton key={dayIndex} className="h-24 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

