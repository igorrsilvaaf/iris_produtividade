"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Check, ChevronRight, Edit, Flag, MoreHorizontal, Trash, ArrowUpDown, Clock, FileText, Link, Timer } from "lucide-react"
import type { Todo } from "@/lib/todos"
import type { TodoWithEditMode } from "@/components/task-detail"
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

const processDescription = (text: string) => {
  if (!text) return "";
  
  const checkboxText = text.replace(/\[([ xX]?)\]/g, (match, inside) => {
    if (inside === 'x' || inside === 'X') {
      return '✓ ';
    }
    return '□ ';
  });
  
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

    const isAllDay = date.getHours() === 0 && date.getMinutes() === 0;
    
    let dateDisplay;
    
    const isSameDate = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    };
    
    if (isSameDate(date, today)) {
      dateDisplay = t("today");
    } else if (isSameDate(date, tomorrow)) {
      dateDisplay = t("tomorrow");
    } else {
      if (date.getFullYear() !== today.getFullYear()) {
        dateDisplay = format(date, "MMM d, yyyy");
      } else {
        dateDisplay = format(date, "MMM d");
      }
    }
    
    if (!isAllDay) {
      return `${dateDisplay} ${format(date, "HH:mm")}`;
    }
    
    return dateDisplay;
  }

  const openTaskDetail = (task: Todo) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const openTaskDetailInEditMode = (task: Todo) => {
    setSelectedTask({...task, isEditMode: true} as TodoWithEditMode)
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

      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex flex-col rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent hover:shadow-md cursor-pointer",
              task.completed && "opacity-60"
            )}
            onClick={() => openTaskDetail(task)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="h-5 w-5"
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <div
                    className={cn(
                      "font-medium cursor-pointer",
                      task.completed && "line-through"
                    )}
                  >
                    {task.title}
                  </div>
                  {!expandedTask && task.description && (
                    <div
                      className="text-xs text-muted-foreground line-clamp-1 cursor-pointer"
                    >
                      {processDescription(task.description)}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {task.due_date && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{formatDueDate(task.due_date)}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs">
                      <Flag className={`mr-1 h-3 w-3 ${getPriorityColor(task.priority)}`} />
                      <span>{getPriorityLabel(task.priority)}</span>
                    </div>
                    {task.project_name && (
                      <div
                        className="flex items-center text-xs rounded-full px-2 py-0.5 whitespace-nowrap"
                        style={{ 
                          backgroundColor: `${task.project_color}10`,
                          color: task.project_color 
                        }}
                      >
                        <span>{task.project_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t("options")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        openTaskDetailInEditMode(task);
                      }}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/app/pomodoro?taskId=${task.id}`);
                      }}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Timer className="mr-2 h-4 w-4" />
                      {t("startPomodoro")}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedTask(expandedTask === task.id ? null : task.id);
                  }}
                >
                  <ChevronRight className={`h-4 w-4 ${expandedTask === task.id ? "transform rotate-90" : ""}`} />
                  <span className="sr-only">{t("view")}</span>
                </Button>
              </div>
            </div>
            
            {/* Exibir a descrição expandida se esta tarefa estiver expandida */}
            {expandedTask === task.id && task.description && (
              <div 
                className="mt-2 text-sm text-muted-foreground p-2 bg-muted/30 rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                {processDescription(task.description)}
              </div>
            )}
          </div>
        ))}
      </div>

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

