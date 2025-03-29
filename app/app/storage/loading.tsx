import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

