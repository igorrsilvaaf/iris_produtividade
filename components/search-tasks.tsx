"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import type { Todo } from "@/lib/todos"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { TaskDetail } from "@/components/task-detail"
import { format } from "date-fns"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { cn } from "@/lib/utils"

// Componente DialogContent personalizado sem o botão de fechar
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg p-0 overflow-hidden border-none",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
CustomDialogContent.displayName = "CustomDialogContent"

export function SearchTasks() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    } else if (open && query.length >= 2) {
      performSearch(query)
    }
    
    // Focar no input quando o diálogo abrir
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      setSearchError(null)
      return
    }

    setIsLoading(true)
    setSearchError(null)

    try {
      const normalizedQuery = searchQuery.trim()
      console.log("Buscando por:", normalizedQuery)
      
      const timestamp = new Date().getTime()
      const url = `/api/tasks/search?q=${encodeURIComponent(normalizedQuery)}&_=${timestamp}`
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = "Failed to search tasks"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
          
          if (response.status === 401) {
            toast({
              variant: "destructive",
              title: t("Não autorizado"),
              description: t("Sua sessão expirou. Recarregando a página..."),
            })
            
            setTimeout(() => {
              window.location.reload()
            }, 2000)
            return
          }
        } catch (e) {
          // Erro ao analisar resposta
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Resultados:", data.tasks?.length || 0)
      
      setResults(data.tasks || [])
      setIsLoading(false)
    } catch (error: unknown) {
      let errorMessage = t("failedToSearchTasks")
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = t("A busca demorou muito. Tente novamente.")
        }
      }
      
      setSearchError(errorMessage)
      
      toast({
        variant: "destructive",
        title: t("searchFailed"),
        description: errorMessage,
      })
      
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query || query.length < 2) {
      setResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null

    const date = new Date(dueDate)
    
    const isAllDay = date.getHours() === 0 && date.getMinutes() === 0
    const dateStr = date.toLocaleDateString()
    
    if (!isAllDay) {
      return `${dateStr} ${format(date, "HH:mm")}`
    }
    
    return dateStr
  }

  const handleSelectTask = (task: Todo) => {
    setOpen(false)
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleTaskDetailClose = (open: boolean) => {
    setShowTaskDetail(open)
    if (!open) {
      setSelectedTask(null)
      router.refresh()
      if (query && query.length >= 1) {
        performSearch(query)
      }
    }
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start rounded-md bg-background text-sm font-normal text-muted-foreground shadow-sm border border-border/50 hover:bg-accent/50 hover:text-accent-foreground"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4 text-muted-foreground/70" />
          <span className="hidden sm:inline-flex text-muted-foreground/90">{t("searchTasks")}</span>
          <span className="inline-flex sm:hidden text-muted-foreground/90">{t("search")}...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <CustomDialogContent className="shadow-lg max-w-lg bg-background">
          <DialogTitle>
            <VisuallyHidden>{t("searchTasks")}</VisuallyHidden>
          </DialogTitle>
          
          {/* Input de pesquisa - Design melhorado */}
          <div className="flex items-center px-4 py-3 border-b border-border/40">
            <Search className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/70 text-foreground pl-1"
              placeholder={t("searchTasks")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground flex-shrink-0 ml-1"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setSearchError(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">{t("Clear")}</span>
              </Button>
            )}
          </div>
          
          {/* Conteúdo da pesquisa */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-3 text-sm text-muted-foreground">{t("searching")}</span>
              </div>
            )}
            
            {!isLoading && searchError && (
              <div className="py-8 text-center">
                <p className="text-sm text-destructive">{searchError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => performSearch(query)}
                  className="mt-3"
                >
                  {t("Tentar novamente")}
                </Button>
              </div>
            )}
            
            {!isLoading && query.length > 0 && query.length < 2 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t("Digite pelo menos 2 caracteres para buscar")}
              </div>
            )}
            
            {!isLoading && query.length >= 2 && !searchError && results.length === 0 && (
              <div className="py-10 text-center">
                <div className="mb-3 text-xl">🔍</div>
                <p className="text-sm text-muted-foreground/90">{t("noResultsFound")}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{t("Tente outra palavra-chave")}</p>
              </div>
            )}
            
            {results.length > 0 && (
              <div>
                <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  {t("Tasks")} ({results.length})
                </div>
                <div className="space-y-1">
                  {results.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => handleSelectTask(task)}
                      className="relative flex cursor-pointer items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none"
                    >
                      <div className="mr-3 flex h-5 w-5 items-center justify-center">
                        <div className={`h-3 w-3 rounded-full ${task.completed ? "bg-muted" : "bg-primary"}`}></div>
                      </div>
                      <div className="flex flex-col overflow-hidden flex-grow">
                        <span className={`truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground/80 truncate mt-0.5">
                            {t("Due")}: {" "}
                            <span className={task.due_date && new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0 ? "" : "font-medium"}>
                              {formatDueDate(task.due_date)}
                            </span>
                          </span>
                        )}
                      </div>
                      {task.project_name && (
                        <div
                          className="ml-2 flex-shrink-0 flex items-center rounded-full px-2 py-0.5 text-xs whitespace-nowrap"
                          style={{
                            backgroundColor: `${task.project_color}15`,
                            color: task.project_color,
                          }}
                        >
                          {task.project_name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CustomDialogContent>
      </Dialog>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={showTaskDetail}
          onOpenChange={handleTaskDetailClose}
        />
      )}
    </>
  )
}