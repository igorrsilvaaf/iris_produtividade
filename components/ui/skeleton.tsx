import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

function Skeleton({
  className,
  'data-testid': testId,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      data-testid={testId || 'skeleton'}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  )
}

export { Skeleton }
