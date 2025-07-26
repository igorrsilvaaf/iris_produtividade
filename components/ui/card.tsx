import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, 'data-testid': testId, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    data-testid={testId || 'card'}
    role="region"
    aria-label="Card"
    {...props}
  />
))
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  CardHeaderProps
>(({ className, 'data-testid': testId, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    data-testid={testId || 'card-header'}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

const CardTitle = React.forwardRef<
  HTMLDivElement,
  CardTitleProps
>(({ className, 'data-testid': testId, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    data-testid={testId || 'card-title'}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

const CardDescription = React.forwardRef<
  HTMLDivElement,
  CardDescriptionProps
>(({ className, 'data-testid': testId, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    data-testid={testId || 'card-description'}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

const CardContent = React.forwardRef<
  HTMLDivElement,
  CardContentProps
>(({ className, 'data-testid': testId, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    data-testid={testId || 'card-content'}
    {...props} 
  />
))
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

const CardFooter = React.forwardRef<
  HTMLDivElement,
  CardFooterProps
>(({ className, 'data-testid': testId, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    data-testid={testId || 'card-footer'}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
