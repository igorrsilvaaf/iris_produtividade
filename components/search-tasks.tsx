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
import { DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { TaskDetail } from "@/components/task-detail"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { format } from "date-fns"

export function SearchTasks() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
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

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      console.log("Iniciando pesquisa por:", searchQuery);
      
      const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to search tasks";
        try {
          const errorData = await response.json();
          console.error("Detalhes do erro:", errorData);
          errorMessage = errorData.message || errorMessage;
          
          if (response.status === 401) {
            toast({
              variant: "destructive",
              title: t("Não autorizado"),
              description: t("Sua sessão expirou. Recarregando a página..."),
            });
            
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return;
          }
        } catch (e) {
          console.error("Não foi possível analisar a resposta de erro:", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Resultados encontrados:", data.tasks?.length || 0, data.tasks);
      setResults(data.tasks || []);
    } catch (error) {
      console.error("Erro durante a pesquisa:", error);
      toast({
        variant: "destructive",
        title: t("searchFailed"),
        description: t("failedToSearchTasks"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query || query.length < 1) {
      setResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  useEffect(() => {
    // Verificar se estamos logados
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        const data = await response.json();
        console.log("Session check:", data);
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };
    
    checkSession();
  }, []);

  // Verificar se existem tarefas no sistema para debug
  useEffect(() => {
    const checkTasks = async () => {
      try {
        const response = await fetch('/api/tasks/today', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Tarefas disponíveis no sistema:", data.tasks?.length || 0);
          if (data.tasks?.length > 0) {
            console.log("Exemplo de tarefa:", data.tasks[0]);
          }
        } else {
          console.log("Não foi possível verificar tarefas existentes:", response.status);
        }
      } catch (error) {
        console.error("Erro ao verificar tarefas existentes:", error);
      }
    };
    
    // Verificar tarefas quando o componente montar
    checkTasks();
  }, []);

  // Função para debug que carrega todas as tarefas como resultados de pesquisa
  const debugLoadAllTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/inbox', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("DEBUG: Carregando todas as tarefas:", data.tasks?.length || 0);
        setResults(data.tasks || []);
      } else {
        console.error("DEBUG: Erro ao carregar todas as tarefas:", response.status);
      }
    } catch (error) {
      console.error("DEBUG: Exceção ao carregar todas as tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null

    const date = new Date(dueDate)
    
    // Verificar se é uma tarefa "dia todo" (00:00:00)
    const isAllDay = date.getHours() === 0 && date.getMinutes() === 0;
    
    // Formato básico de data
    const dateStr = date.toLocaleDateString();
    
    // Adicionar horário se não for 'dia todo'
    if (!isAllDay) {
      return `${dateStr} ${format(date, "HH:mm")}`;
    }
    
    return dateStr;
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
      // Refazer a pesquisa para atualizar os resultados
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
        
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 right-0">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 text-xs" 
              onClick={(e) => {
                e.stopPropagation();
                debugLoadAllTasks();
                setOpen(true);
              }}
            >
              <span className="sr-only">Debug</span>
              <span className="opacity-30 text-[10px]">D</span>
            </Button>
          </div>
        )}
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle asChild>
          <VisuallyHidden>{t("searchTasks")}</VisuallyHidden>
        </DialogTitle>
        <CommandInput placeholder={t("searchTasks")} value={query} onValueChange={setQuery} />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm text-muted-foreground">{t("searching")}</span>
            </div>
          )}
          <CommandEmpty>{t("noResultsFound")}</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading={t("Tasks")}>
              {results.map((task) => (
                <CommandItem key={task.id} onSelect={() => handleSelectTask(task)} className="flex items-center">
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <div className={`h-3 w-3 rounded-full ${task.completed ? "bg-muted" : "bg-primary"}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {t("Due")}: 
                        <span className={task.due_date && new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0 ? "" : "font-medium"}>
                          {formatDueDate(task.due_date)}
                        </span>
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

