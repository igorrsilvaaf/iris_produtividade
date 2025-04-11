"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Check, ChevronRight, Edit, Flag, MoreHorizontal, Trash, ArrowUpDown, Clock, FileText, Link } from "lucide-react"
import type { Todo } from "@/lib/todos"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { TaskDetail } from "@/components/task-detail"
import { useTranslation } from "@/lib/i18n"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

type SortOption = "priority" | "title" | "dueDate" | "createdAt"

// Função para processar texto da descrição
const processDescription = (text: string) => {
  if (!text) return "";
  
  // Substituir [x] ou [ ] por checkbox
  const checkboxText = text.replace(/\[([ xX]?)\]/g, (match, inside) => {
    if (inside === 'x' || inside === 'X') {
      return '✓ ';
    }
    return '□ ';
  });
  
  // Substituir linhas que começam com - por bullet points
  return checkboxText.replace(/^-\s(.+)$/gm, '• $1');
};

export function TaskList({ tasks }: { tasks: Todo[] }) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("priority")
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Ordenar tarefas com base na opção selecionada
  const sortedTasks = useMemo(() => {
    const tasksCopy = [...tasks];
    
    switch (sortBy) {
      case "priority":
        return tasksCopy.sort((a, b) => a.priority - b.priority);
      case "title":
        return tasksCopy.sort((a, b) => a.title.localeCompare(b.title));
      case "dueDate":
        return tasksCopy.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
      case "createdAt":
        return tasksCopy.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      default:
        return tasksCopy;
    }
  }, [tasks, sortBy]);

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}/toggle`, {
        method: "PATCH",
      })

      toast({
        title: t("Task updated"),
        description: t("Task status has been updated."),
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      })
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      toast({
        title: t("taskDeleted"),
        description: t("Task has been deleted successfully."),
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again."),
      })
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "text-red-500"
      case 2:
        return "text-orange-500"
      case 3:
        return "text-blue-500"
      default:
        return "text-gray-400"
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return t("Grave")
      case 2:
        return t("Alta")
      case 3:
        return t("Média")
      case 4:
        return t("Baixa")
      default:
        return t("Baixa")
    }
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null

    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    // Verificar se é uma tarefa "dia todo" (00:00:00)
    const isAllDay = date.getHours() === 0 && date.getMinutes() === 0;
    
    // Formatar a parte da data
    let dateDisplay;
    if (date.toDateString() === today.toDateString()) {
      dateDisplay = t("today");
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateDisplay = t("tomorrow");
    } else {
      dateDisplay = format(date, "MMM d");
    }
    
    // Adicionar horário se não for 'dia todo'
    if (!isAllDay) {
      return `${dateDisplay} ${format(date, "HH:mm")}`;
    }
    
    return dateDisplay;
  }

  const openTaskDetail = (task: Todo) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-medium">{t("allCaughtUp")}</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">{t("noTasksMessage")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("Sort by")}:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("Sort by")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  {t("Prioridade")}
                </div>
              </SelectItem>
              <SelectItem value="title">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {t("Descrição")}
                </div>
              </SelectItem>
              <SelectItem value="dueDate">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("Data de Vencimento")}
                </div>
              </SelectItem>
              <SelectItem value="createdAt">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {t("Data de Criação")}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedTasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <div className="flex items-start p-3 sm:p-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              className={cn(
                "mt-1 flex-shrink-0 transition-all duration-200",
                task.completed && "animate-pulse-once"
              )}
            />
            <div
              className="ml-3 flex-1 cursor-pointer min-w-0"
              onClick={() => openTaskDetail(task)}
            >
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "font-medium truncate transition-all duration-300", 
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedTask(expandedTask === task.id ? null : task.id);
                  }}
                >
                  <ChevronRight
                    className={cn("h-4 w-4 transition-transform", expandedTask === task.id && "rotate-90")}
                  />
                </Button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {task.project_name && (
                  <span className="flex items-center gap-1 max-w-[120px] truncate">
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.project_color }}
                    />
                    <span className="truncate">{task.project_name}</span>
                  </span>
                )}
                {task.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className={task.due_date && new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0 ? "" : "font-medium"}>
                      {formatDueDate(task.due_date)}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Flag className={cn("h-3 w-3 flex-shrink-0", getPriorityColor(task.priority))} />
                  <span className={cn(getPriorityColor(task.priority))}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t("More")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openTaskDetail(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteTask(task.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  {t("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {expandedTask === task.id && task.description && (
            <CardContent className="border-t bg-muted/50 px-4 py-3">
              <div className="text-sm break-words whitespace-pre-wrap">
                {processDescription(task.description).split('\n').map((line, i) => {
                  // Encontra URLs no texto
                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  let parts = [];
                  let lastIndex = 0;
                  let match;
                  
                  // Para cada URL encontrada
                  while ((match = urlRegex.exec(line)) !== null) {
                    // Adiciona o texto antes da URL
                    if (match.index > lastIndex) {
                      parts.push(line.substring(lastIndex, match.index));
                    }
                    
                    // Adiciona a URL como um link
                    parts.push(
                      <a 
                        key={`${i}-${match.index}`} 
                        href={match[0]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline inline-flex items-center"
                      >
                        {match[0]}
                      </a>
                    );
                    
                    lastIndex = urlRegex.lastIndex;
                  }
                  
                  // Adiciona o restante do texto após a última URL
                  if (lastIndex < line.length) {
                    parts.push(line.substring(lastIndex));
                  }
                  
                  // Se não houver URLs, apenas retorna a linha
                  if (parts.length === 0) {
                    parts.push(line);
                  }
                  
                  // Verifica se a linha está vazia para pular adequadamente
                  if (line.trim() === '') {
                    return <br key={i} />;
                  }
                  
                  return (
                    <p key={i} className="mb-2">
                      {parts}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={showTaskDetail}
          onOpenChange={(open) => {
            setShowTaskDetail(open)
            if (!open) setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

