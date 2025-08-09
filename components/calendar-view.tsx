"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
  isFuture,
  isPast,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import type { Todo } from "@/lib/todos";
import type { Project } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { useToast } from "@/components/ui/use-toast";
import { TaskDetail } from "@/components/task-detail";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarSkeleton } from "@/components/ui/calendar-skeleton";
import { CalendarFilters } from "@/components/ui/calendar-filters";
import { CalendarActions } from "@/components/ui/calendar-actions";
import { TaskTooltip } from "@/components/ui/task-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarViewProps {
  userId: number;
}

interface TaskCache {
  [key: string]: {
    tasks: Todo[];
    timestamp: number;
  };
}

export function CalendarView({ userId }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const { toast } = useToast();
  const { language, t } = useTranslation();

  const tasksCache = useRef<TaskCache>({});
  const isFetchingRef = useRef(false);

  const getMonthKey = useCallback((date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("[calendar] Erro ao buscar projetos:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchTasksForMonth = useCallback(
    async (date: Date) => {
      const monthKey = getMonthKey(date);
      const cached = tasksCache.current[monthKey];
      const now = Date.now();

      if (cached && now - cached.timestamp < 30 * 60 * 1000) {
        setTasks(cached.tasks);
        setIsLoading(false);
        return;
      }

      if (isFetchingRef.current) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsLoading(true);

        const start = format(startOfMonth(date), "yyyy-MM-dd");
        const end = format(endOfMonth(date), "yyyy-MM-dd");

        const response = await fetch(
          `/api/tasks/calendar?start=${start}&end=${end}`,
          {
            headers: {
              "Cache-Control": "no-store, max-age=0",
              Pragma: "no-cache",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar tarefas: ${response.status}`);
        }

        const data = await response.json();

        tasksCache.current[monthKey] = {
          tasks: data.tasks,
          timestamp: now,
        };

        setTasks(data.tasks);
      } catch (error) {
        console.error("[calendar] Erro ao buscar tarefas:", error);
        toast({
          variant: "destructive",
          title: t("Failed to load tasks"),
          description: t("Please try again later."),
        });
        if (cached) {
          setTasks(cached.tasks);
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 300);
      }
    },
    [getMonthKey, toast, t],
  );

  useEffect(() => {
    fetchTasksForMonth(currentMonth);
  }, [currentMonth]);

  const filteredTasks = useCallback(() => {
    let filtered = tasks;

    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }

    if (selectedProject && selectedProject !== "all") {
      
      filtered = filtered.filter(task => {
        const taskProjectId = task.project_id?.toString();
        const selectedProjectId = selectedProject.toString();
        return taskProjectId === selectedProjectId;
      });
    }

    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter(task => {
        if (selectedStatus === "completed") return task.completed;
        if (selectedStatus === "pending") return !task.completed;
        if (selectedStatus === "overdue") {
          return !task.completed && task.due_date && 
            parseISO(task.due_date) < new Date();
        }
        return true;
      });
    }

    return filtered;
  }, [tasks, selectedProject, selectedStatus, showCompleted]);

  const handleProjectChange = useCallback((projectId: string) => {
    setSelectedProject(projectId);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedProject("all");
    setSelectedStatus("all");
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  }, []);

  const prevMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  }, []);

  const renderHeader = useCallback(() => {
    const formatOptions = language === "pt" ? { locale: ptBR } : undefined;
    const today = new Date();
    const isCurrentMonth = isSameMonth(currentMonth, today);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevMonth}
              className="transition-all duration-200 hover:scale-105"
              data-testid="calendar-prev-month-button"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextMonth}
              className="transition-all duration-200 hover:scale-105"
              data-testid="calendar-next-month-button"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg sm:text-xl font-bold">
              {format(currentMonth, "MMMM yyyy", formatOptions)}
            </h2>
            {isCurrentMonth && (
              <Badge variant="secondary" className="text-xs">
                {t("current")}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="text-xs transition-all duration-200 hover:scale-105"
              data-testid="calendar-today-button"
            >
              {t("today")}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <CalendarActions
          tasks={filteredTasks()}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          showCompleted={showCompleted}
          onToggleCompleted={setShowCompleted}
        />

        {/* Filters */}
        <CalendarFilters
          projects={projects}
          selectedProject={selectedProject}
          selectedStatus={selectedStatus}
          onProjectChange={handleProjectChange}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
        />
      </div>
    );
  }, [currentMonth, language, nextMonth, prevMonth, t, projects, selectedProject, selectedStatus, showCompleted, filteredTasks, handleProjectChange, handleStatusChange, handleClearFilters]);

  const renderDays = useCallback(() => {
    const getDaysOfWeek = () => {
      if (language === "pt") {
        return isMobile
          ? ["D", "S", "T", "Q", "Q", "S", "S"]
          : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      } else {
        return isMobile
          ? ["S", "M", "T", "W", "T", "F", "S"]
          : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      }
    };

    const days = getDaysOfWeek();

    return (
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-semibold py-3 text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
    );
  }, [isMobile, language]);

  const openTaskDetail = useCallback((task: Todo) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  }, []);

  const getTaskStatusClass = useCallback((task: Todo) => {
    if (task.completed)
      return "bg-green-100 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 shadow-sm";

    if (task.due_date) {
      const dueDate = parseISO(task.due_date);

      if (isToday(dueDate))
        return "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300 shadow-sm";
      if (isPast(dueDate))
        return "bg-red-100 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300 shadow-sm";
      if (isFuture(dueDate))
        return "bg-blue-100 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm";
    }

    return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm";
  }, []);

  const renderCells = useCallback(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dateFormat = "d";
    const rows = [];

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let formattedDays = [];

    const formatOptions = language === "pt" ? { locale: ptBR } : undefined;
    const filteredTasksList = filteredTasks();

    for (const day of days) {
      const tasksForDay = filteredTasksList.filter((task) => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return isSameDay(taskDate, day);
      });

      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isTodayDate = isToday(day);
      const isHovered = hoveredDay && isSameDay(hoveredDay, day);

      formattedDays.push(
        <div
          key={day.getTime()}
          className={cn(
            "min-h-[80px] sm:min-h-[120px] p-2 border rounded-lg transition-all duration-200",
            isCurrentMonth
              ? isTodayDate
                ? "bg-primary/10 border-primary/50 shadow-md"
                : "bg-background hover:bg-accent/50 border-border"
              : "bg-muted/30 text-muted-foreground border-muted",
            isHovered && "ring-2 ring-primary/20 bg-accent/50",
            tasksForDay.length > 0 && "border-l-4 border-l-primary/50"
          )}
          onMouseEnter={() => setHoveredDay(day)}
          onMouseLeave={() => setHoveredDay(null)}
        >
          <div className="flex justify-between items-start mb-2">
            <span
              className={cn(
                "text-xs sm:text-sm font-medium transition-all duration-200",
                isTodayDate
                  ? "bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-sm"
                  : "text-foreground"
              )}
            >
              {format(day, dateFormat, formatOptions)}
            </span>
            <AddTaskDialog
              initialProjectId={undefined}
              initialLanguage={language}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                data-testid={`calendar-add-task-${day.toISOString().split('T')[0]}`}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </AddTaskDialog>
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[100px]">
            {tasksForDay.slice(0, 3).map((task) => (
              <TooltipProvider key={task.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      data-testid={`calendar-task-${task.id}`}
                      className={cn(
                        "text-[10px] sm:text-xs p-1.5 rounded-md truncate border-l-2 cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-[1.02]",
                        getTaskStatusClass(task)
                      )}
                      onClick={() => openTaskDetail(task)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">{task.title}</span>
                        {task.due_date && new Date(task.due_date).getHours() !== 0 && (
                          <span className="ml-1 font-medium text-[9px] opacity-75">
                            {format(new Date(task.due_date), "HH:mm", formatOptions)}
                          </span>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="p-0">
                    <TaskTooltip task={task} language={language} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {tasksForDay.length > 3 && (
              <div className="text-[9px] text-muted-foreground text-center py-1">
                +{tasksForDay.length - 3} {t("more")}
              </div>
            )}
          </div>
        </div>
      );

      if (formattedDays.length === 7) {
        rows.push(
          <div key={`row-${day.getTime()}`} className="grid grid-cols-7 gap-2">
            {formattedDays}
          </div>,
        );
        formattedDays = [];
      }
    }

    return <div className="space-y-2">{rows}</div>;
  }, [currentMonth, filteredTasks, language, getTaskStatusClass, openTaskDetail, hoveredDay, t]);

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {renderHeader()}
          {renderDays()}
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <div className="group">
              {renderCells()}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={showTaskDetail}
          onOpenChange={(open) => {
            setShowTaskDetail(open);
            if (!open) setSelectedTask(null);
          }}
          onDeleted={(id) => {
            setTasks(prev => prev.filter(t => t.id !== id));
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
