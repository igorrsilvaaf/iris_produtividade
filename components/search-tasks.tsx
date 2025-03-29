"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import type { Todo } from "@/lib/todos"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"

export function SearchTasks() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()

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
    }
  }, [open])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query || query.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(query)}`)

        if (!response.ok) {
          throw new Error("Failed to search tasks")
        }

        const data = await response.json()
        setResults(data.tasks)
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("Search failed"),
          description: t("Failed to search tasks. Please try again."),
        })
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, toast, t])

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null

    const date = new Date(dueDate)
    return date.toLocaleDateString()
  }

  const handleSelectTask = (taskId: number) => {
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-flex">{t("searchTasks")}</span>
        <span className="inline-flex sm:hidden">{t("search")}...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("searchTasks")} value={query} onValueChange={setQuery} />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm text-muted-foreground">{t("Searching...")}</span>
            </div>
          )}
          <CommandEmpty>{t("No results found.")}</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading={t("Tasks")}>
              {results.map((task) => (
                <CommandItem key={task.id} onSelect={() => handleSelectTask(task.id)} className="flex items-center">
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <div className={`h-3 w-3 rounded-full ${task.completed ? "bg-muted" : "bg-primary"}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {t("Due")}: {formatDueDate(task.due_date)}
                      </span>
                    )}
                  </div>
                  {task.project_name && (
                    <div
                      className="ml-auto flex items-center rounded-full px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: `${task.project_color}20`,
                        color: task.project_color,
                      }}
                    >
                      {task.project_name}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

