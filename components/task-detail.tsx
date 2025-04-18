"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { 
  CalendarIcon, Flag, Tag, X, FilePlus, Trash, MoreHorizontal, Clock, 
  TimerOff, Timer, Check, Plus, Save, Edit, CheckSquare, Square, Link, ArrowLeft
} from "lucide-react"
import type { Todo } from "@/lib/todos"
import type { Project } from "@/lib/projects"
import { useTranslation } from "@/lib/i18n"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { TaskLabels } from "@/components/task-labels"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { ProjectForm } from "@/components/project-form"

export type TodoWithEditMode = Todo & {
  isEditMode?: boolean;
}

interface TaskDetailProps {
  task: TodoWithEditMode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isAllDayDate(dateString: string | null): boolean {
  if (!dateString) return true;
  try {
    const date = new Date(dateString);
    return date.getHours() === 0 && date.getMinutes() === 0;
  } catch (e) {
    return true;
  }
}

function getTimeFromDate(dateString: string | null): string {
  if (!dateString) return "12:00";
  try {
    const date = new Date(dateString);
    if (date.getHours() === 0 && date.getMinutes() === 0) return "12:00";
    return date.toTimeString().slice(0, 5);
  } catch (e) {
    return "12:00";
  }
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(task.due_date ? new Date(task.due_date) : undefined)
  const [dueTime, setDueTime] = useState<string | undefined>(
    task.due_date
      ? new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0
        ? "12:00"
        : new Date(task.due_date).toTimeString().slice(0, 5)
      : "12:00"
  )
  const [dueTimeUpdate, setDueTimeUpdate] = useState(false)
  const [isAllDay, setIsAllDay] = useState(
    task.due_date
      ? new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0
      : true
  )
  const [priority, setPriority] = useState(task.priority.toString())
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string>("")
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [taskLabelsKey, setTaskLabelsKey] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const [showAddProject, setShowAddProject] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    const fetchTaskProject = async () => {
      if (!open || task.id === undefined) return;
      
      try {
        console.log(`[TaskDetail] Buscando projeto para tarefa ${task.id}`);
        const response = await fetch(`/api/tasks/${task.id}/project`);
        if (response.ok) {
          const data = await response.json();
          if (data.projectId) {
            setProjectId(data.projectId.toString());
          } else {
            setProjectId(null);
          }
        }
      } catch (error) {
        console.error(`[TaskDetail] Erro ao buscar projeto da tarefa:`, error);
      }
    };

    fetchTaskProject();
  }, [open, task.id]);

  useEffect(() => {
    if (open) {
      setTaskLabelsKey(prev => prev + 1)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setIsEditMode(task.isEditMode === true)
      
      setTitle(task.title)
      setDescription(task.description || "")
      
      if (task.due_date) {
        console.log(`[TaskDetail] Data da tarefa: ${task.due_date}`)
        try {
          const dueDate = new Date(task.due_date)
          setDueDate(dueDate)
          setDueTime(
            dueDate.getHours() === 0 && dueDate.getMinutes() === 0
              ? "12:00"
              : dueDate.toTimeString().slice(0, 5)
          )
          setIsAllDay(dueDate.getHours() === 0 && dueDate.getMinutes() === 0)
          console.log(`[TaskDetail] Data configurada: ${dueDate}, isAllDay: ${dueDate.getHours() === 0 && dueDate.getMinutes() === 0}, hora: ${dueDate.toTimeString().slice(0, 5)}`)
        } catch (error) {
          console.error(`[TaskDetail] Erro ao processar data: ${error}`)
          setDueDate(undefined)
          setDueTime("12:00")
          setIsAllDay(true)
        }
      } else {
        setDueDate(undefined)
        setDueTime("12:00")
        setIsAllDay(true)
      }
      
      setPriority(task.priority.toString())
    }
  }, [open, task])

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects);
          
          if (projectId) {
            const project = data.projects.find((p: Project) => p.id.toString() === projectId);
            if (project) {
              setProjectName(project.name);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [projectId, open]);

  const handleCreateProjectSuccess = () => {
    setShowCreateProject(false);
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data.projects);
      })
      .catch((error) => {
        console.error("Failed to refresh projects:", error);
      });
  };

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      console.log(`[TaskDetail] Salvando alterações para tarefa ${task.id}`);

      let dueDateWithTime = null;
      
      if (dueDate) {
        if (isAllDay) {
          const date = new Date(dueDate);
          date.setHours(0, 0, 0, 0);
          dueDateWithTime = date.toISOString();
          console.log(`[TaskDetail] Data para dia todo: ${dueDateWithTime}, objeto date: ${date.toString()}`);
        } else if (dueTime) {
          const date = new Date(dueDate);
          const [hours, minutes] = dueTime.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);
          dueDateWithTime = date.toISOString();
          console.log(`[TaskDetail] Data com hora específica: ${dueDateWithTime}, objeto date: ${date.toString()}`);
        }
      }

      console.log(`[TaskDetail] Salvando alterações para tarefa ${task.id}`);
      console.log(`[TaskDetail] Nova data: ${dueDateWithTime}`);
      console.log(`[TaskDetail] Nova descrição: "${description}"`);
      console.log(`[TaskDetail] Descrição está vazia: ${description === ""}`);

      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description,
          due_date: dueDateWithTime,
          priority: Number.parseInt(priority),
        }),
      });

      if (!taskResponse.ok) {
        throw new Error("Failed to update task details");
      }

      console.log(`[TaskDetail] Resposta da API para atualização de detalhes da tarefa:`, taskResponse.status);
      console.log(`[TaskDetail] ID do projeto atual:`, projectId);

      const updatedTaskData = await taskResponse.json();
      console.log(`[TaskDetail] Dados atualizados da tarefa:`, updatedTaskData);

      const currentProjectId = projectId ? Number.parseInt(projectId) : null;
      
      const projectResponse = await fetch(`/api/tasks/${task.id}/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProjectId,
        }),
      });

      if (!projectResponse.ok) {
        throw new Error("Failed to update task project");
      }

      console.log(`[TaskDetail] Projeto atualizado com sucesso:`, currentProjectId);
      
      if (currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        if (project) {
          setProjectName(project.name);
        }
      } else {
        setProjectName("");
      }

      setIsEditMode(false);
      
      router.refresh();

      toast({
        title: t("Task updated"),
        description: t("Your task has been updated successfully."),
        variant: "success",
      });
    } catch (error) {
      console.error(`[TaskDetail] Erro ao salvar alterações:`, error);
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = async () => {
    if (!task.id) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      
      onOpenChange(false);
      
      toast({
        title: t("Task deleted"),
        description: t("Your task has been deleted successfully."),
        variant: "success",
      });
      
      setTimeout(() => {
        router.refresh();
      }, 300);
    } catch (error) {
      console.error(`[TaskDetail] Erro ao excluir tarefa:`, error);
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "1":
        return "text-red-500"
      case "2":
        return "text-orange-500"
      case "3":
        return "text-blue-500"
      default:
        return "text-gray-400"
    }
  }

  const getPriorityName = (p: string) => {
    switch (p) {
      case "1":
        return t("priority1")
      case "2":
        return t("priority2")
      case "3":
        return t("priority3")
      case "4":
        return t("priority4")
      default:
        return t("priority4")
    }
  }

  const toggleCheckboxInDescription = (index: number) => {
    if (isEditMode) return;
    
    const regex = /\[([x ])\]/g;
    let match;
    const checkboxPositions = [];
    
    while ((match = regex.exec(description)) !== null) {
      checkboxPositions.push({
        position: match.index,
        checked: match[1] === 'x'
      });
    }
    
    if (index >= checkboxPositions.length) {
      return;
    }
    
    const position = checkboxPositions[index];
    const newDescription = description.substring(0, position.position + 1) + 
      (position.checked ? ' ' : 'x') + 
      description.substring(position.position + 2);
    
    setDescription(newDescription);
    
    setTimeout(() => {
      updateTaskDescription(newDescription);
    }, 100);
  };
  
  const updateTaskDescription = async (newDescription: string) => {
    try {
      console.log(`[TaskDetail] Atualizando descrição da tarefa ${task.id}:`, newDescription);
      console.log(`[TaskDetail] Descrição está vazia: ${newDescription === ""}`);
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newDescription,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[TaskDetail] Erro ao atualizar descrição:`, errorData);
        throw new Error("Failed to update task description");
      }
      
      const updatedData = await response.json();
      console.log(`[TaskDetail] Descrição atualizada com sucesso:`, updatedData);
      
      toast({
        title: t("Task updated"),
        description: t("Checklist item has been updated."),
      });
      
      router.refresh();
    } catch (error) {
      console.error(`[TaskDetail] Erro ao atualizar descrição:`, error);
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      });
    }
  };
  
  const renderDescription = () => {
    if (!description) return <p className="text-muted-foreground">{t("No description")}</p>;
    
    const allCheckboxes = [];
    const checkboxRegex = /\[([ x]?)\]/g;
    let match;
    let tempDescription = description;
    
    while((match = checkboxRegex.exec(tempDescription)) !== null) {
      allCheckboxes.push({
        index: match.index,
        checked: match[1] === 'x' || match[1] === 'X'
      });
    }
    
    console.log(`Total de checkboxes encontrados: ${allCheckboxes.length}`);
    
    let globalCheckboxIndex = 0;
    return description.split('\n').map((line, lineIndex) => {
      if (line.trim() === '') {
        return <br key={`empty-line-${lineIndex}`} />;
      }
      
      const isBullet = line.trim().match(/^-\s(.+)$/);
      if (isBullet) {
        const bulletContent = isBullet[1];
        const processedContent = processBulletContent(bulletContent, lineIndex, globalCheckboxIndex);
        globalCheckboxIndex += processedContent.checkboxCount;
        
        return (
          <p key={`bullet-line-${lineIndex}`} className="mb-2 flex">
            <span className="mr-2">•</span>
            <span>{processedContent.content}</span>
          </p>
        );
      }
      
      const processedLine = processLineContent(line, lineIndex, globalCheckboxIndex);
      globalCheckboxIndex += processedLine.checkboxCount;
      
      return (
        <p key={`regular-line-${lineIndex}`} className="mb-2">
          {processedLine.content}
        </p>
      );
    });
  };
  
  const processBulletContent = (content: string, lineIndex: number, startCheckboxIndex: number) => {
    return processLineContent(content, lineIndex, startCheckboxIndex);
  };
  
  const processLineContent = (line: string, lineIndex: number, startCheckboxIndex: number) => {
    let segments = [];
    let lastIndex = 0;
    let checkboxCount = 0;
    let segmentIndex = 0;
    
    const combinedRegex = /(\[([ x]?)\]|https?:\/\/[^\s]+)/g;
    let match;
    let lastCheckbox = null;
    
    while ((match = combinedRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const textSegment = line.substring(lastIndex, match.index);
        if (lastCheckbox && lastCheckbox.isChecked) {
          segments.push(
            <span 
              key={`text-${lineIndex}-${lastIndex}-${segmentIndex++}`}
              className="line-through text-muted-foreground"
            >
              {textSegment}
            </span>
          );
        } else {
          segments.push(<span key={`text-${lineIndex}-${lastIndex}-${segmentIndex++}`}>{textSegment}</span>);
        }
        lastCheckbox = null;
      }
      
      if (match[0].startsWith('[')) {
        const isChecked = match[2] === 'x' || match[2] === 'X';
        const currentCheckboxIndex = startCheckboxIndex + checkboxCount;
        
        segments.push(
          <span key={`checkbox-${lineIndex}-${match.index}-${segmentIndex++}`} className="inline-flex items-center align-middle">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Clicando no checkbox ${currentCheckboxIndex}, estado atual: ${isChecked}`);
                toggleCheckboxInDescription(currentCheckboxIndex);
              }}
              disabled={isEditMode}
              className="inline-flex items-center justify-center w-[18px] h-[18px] rounded mr-2 border border-input hover:bg-accent hover:text-accent-foreground"
              role="checkbox"
              data-state={isChecked ? "checked" : "unchecked"}
              aria-checked="false"
            >
              {isChecked && <Check className="h-3 w-3" />}
            </button>
          </span>
        );
        
        lastCheckbox = { isChecked };
        checkboxCount++;
      } 
      else if (match[0].match(/https?:\/\//)) {
        segments.push(
          <a 
            key={`url-${lineIndex}-${match.index}-${segmentIndex++}`}
            href={match[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-500 hover:underline inline-flex items-center ${lastCheckbox && lastCheckbox.isChecked ? "line-through" : ""}`}
          >
            {match[0]}
          </a>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < line.length) {
      const restText = line.substring(lastIndex);
      if (lastCheckbox && lastCheckbox.isChecked) {
        segments.push(
          <span 
            key={`text-${lineIndex}-${lastIndex}-${segmentIndex++}`}
            className="line-through text-muted-foreground"
          >
            {restText}
          </span>
        );
      } else {
        segments.push(<span key={`text-${lineIndex}-${lastIndex}-${segmentIndex++}`}>{restText}</span>);
      }
    }
    
    return {
      content: segments.length > 0 ? segments : line,
      checkboxCount
    };
  };

  useEffect(() => {
    if (dueTimeUpdate) {
      setDueTimeUpdate(false);
    }
  }, [dueTimeUpdate]);

  useEffect(() => {
    if (open && task.due_date) {
      console.log(`[TaskDetail] Verificando data ao abrir: ${task.due_date}`);
      if (dueDate === undefined) {
        console.warn("[TaskDetail] Data indefinida detectada, tentando reparar");
        try {
          setDueDate(new Date(task.due_date));
        } catch (error) {
          console.error(`[TaskDetail] Falha ao reparar data: ${error}`);
        }
      }
    }
  }, [open, task.due_date, dueDate]);

  const startPomodoro = () => {
    router.push(`/app/pomodoro?taskId=${task.id}`);
    onOpenChange(false);
  }

  const toggleCompletion = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion status");
      }
      
      router.refresh();
      
      toast({
        title: task.completed ? t("Task marked as incomplete") : t("Task marked as complete"),
        variant: "success",
      });
    } catch (error) {
      console.error(`[TaskDetail] Erro ao atualizar status de conclusão:`, error);
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      });
    }
  };

  const handleCloseWithoutSaving = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
      setTitle(task.title);
      setDescription(task.description || "");
      
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        setDueDate(dueDate);
        setDueTime(dueDate.toTimeString().slice(0, 5));
        setIsAllDay(dueDate.getHours() === 0 && dueDate.getMinutes() === 0);
      } else {
        setDueDate(undefined);
        setDueTime("12:00");
        setIsAllDay(true);
      }
      
      setPriority(task.priority.toString());
    }
  }, [isEditMode, task]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && isEditMode) {
          setIsEditMode(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-auto">
        <DialogHeader className="flex flex-col space-y-1">
          <div className="flex flex-row items-center w-full">
            <BackButton 
              onClick={() => onOpenChange(false)} 
              className="md:hidden mr-2"
            />
            <DialogTitle>{t("Detalhes da Tarefa")}</DialogTitle>
          </div>
          <DialogDescription className="text-xl font-bold">{title}</DialogDescription>
        </DialogHeader>

        {isEditMode ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("title")}
              </label>
              <Textarea 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder={t("Task title")}
                className="min-h-[80px] text-base"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("description")}
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("Task description")}
                rows={8}
                className="min-h-[200px] text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("dueDate")}
                </label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="dueDate"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {dueDate 
                        ? isAllDay 
                          ? format(dueDate, "PPP") 
                          : `${format(dueDate, "PPP")} - ${dueTime || "12:00"}`
                        : <span className="text-muted-foreground">{t("pickDate")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="start" 
                    side="bottom"
                    sideOffset={8}
                    alignOffset={0}
                    onInteractOutside={(e) => e.preventDefault()}
                  >
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{t("pickDate")}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 rounded-full" 
                          onClick={() => setDatePickerOpen(false)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">{t("close")}</span>
                        </Button>
                      </div>
                      <div className="calendar-container">
                        <Calendar 
                          mode="single" 
                          selected={dueDate} 
                          onSelect={(date) => {
                            setDueDate(date);
                          }}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="mobile-calendar-fix" 
                        />
                        {/* Estilos adicionados via CSS regular em vez de jsx global */}
                        <style>
                          {`
                            @media (max-width: 640px) {
                              .mobile-calendar-fix {
                                width: 100% !important;
                                min-width: 260px !important;
                              }
                            }
                          `}
                        </style>
                      </div>
                      <div className="pt-3 pb-2 border-t mt-3">
                        <div className="flex flex-row items-center space-x-3 space-y-0 h-9">
                          <Checkbox
                            id="taskDetailAllDay"
                            checked={isAllDay}
                            onCheckedChange={(checked) => {
                              setIsAllDay(checked);
                              if (checked) {
                                setDueTime("00:00");
                              } else {
                                setDueTime("12:00");
                              }
                              if (typeof window !== 'undefined') {
                                setTimeout(() => {
                                  setDueTimeUpdate(!dueTimeUpdate);
                                }, 0);
                              }
                            }}
                          />
                          <label className="text-sm font-normal cursor-pointer" htmlFor="taskDetailAllDay">
                            {t("allDay")}
                          </label>
                        </div>
                      </div>
                      <div className={`mt-2 ${isAllDay ? "hidden" : ""}`}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="time" 
                            value={dueTime}
                            onChange={(e) => {
                              setDueTime(e.target.value || "12:00");
                              setDueTimeUpdate(true);
                            }}
                            className="w-full"
                            inputMode="text"
                            pattern="[0-9]{2}:[0-9]{2}"
                            placeholder="HH:MM"
                            onClick={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.focus();
                              if (typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
                                setTimeout(() => {
                                  target.click();
                                }, 100);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("priority")}
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select priority")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <div className="flex items-center">
                        <Flag className={`mr-2 h-4 w-4 ${getPriorityColor("1")}`} />
                        {t("Grave")}
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center">
                        <Flag className={`mr-2 h-4 w-4 ${getPriorityColor("2")}`} />
                        {t("Alta")}
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center">
                        <Flag className={`mr-2 h-4 w-4 ${getPriorityColor("3")}`} />
                        {t("Média")}
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex items-center">
                        <Flag className={`mr-2 h-4 w-4 ${getPriorityColor("4")}`} />
                        {t("Baixa")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("project")}
              </label>
              <div className="space-y-2">
                {projectId ? (
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ 
                          backgroundColor: projects.find(p => p.id.toString() === projectId)?.color || "#ccc" 
                        }}
                      />
                      <span>{projects.find(p => p.id.toString() === projectId)?.name || t("Unknown project")}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectId(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">{t("Remove project")}</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-2">{t("noProject")}</p>
                )}
                <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <FilePlus className="mr-1 h-3 w-3" />
                      {t("Add Project")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="z-[60]" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>{t("Add Project")}</DialogTitle>
                      <DialogDescription>{t("Select a project or create a new one.")}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      {isLoadingProjects ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      ) : projects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("No projects found.")}</p>
                      ) : (
                        projects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                            onClick={() => {
                              setProjectId(project.id.toString());
                              setProjectName(project.name);
                              setShowAddProject(false);
                            }}
                          >
                      <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: project.color }}
                              />
                              <span>{project.name}</span>
                      </div>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="mt-4 border-t pt-4 flex justify-between">
                      <Button variant="outline" onClick={() => setShowAddProject(false)}>
                        {t("Cancel")}
                      </Button>
                      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                        <DialogTrigger asChild>
                          <Button onClick={(e) => {
                            e.stopPropagation();
                            setShowCreateProject(true);
                          }}>
                            {t("Create New Project")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="z-[70]" onClick={(e) => e.stopPropagation()}>
                          <DialogHeader>
                            <DialogTitle>{t("Create New Project")}</DialogTitle>
                            <DialogDescription>
                              {t("Fill in the details to create a new project.")}
                            </DialogDescription>
                          </DialogHeader>
                          <ProjectForm onSuccess={handleCreateProjectSuccess} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("Etiquetas")}
              </label>
              <TaskLabels key={taskLabelsKey} taskId={task.id} readOnly={!isEditMode} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="sr-only">
                  {task.title}
                </h2>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                  onClick={startPomodoro}
                >
                  <Timer className="h-3.5 w-3.5" />
                  {t("startPomodoro")}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("description")}
              </label>
              <div className="p-3 border rounded-md bg-muted/30 min-h-[200px] overflow-y-auto">
                {renderDescription()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("dueDate")}
                </label>
                <div className="p-2 border rounded-md bg-muted/30">
                  {dueDate 
                    ? isAllDay 
                      ? format(dueDate, "PPP") 
                      : `${format(dueDate, "PPP")} - ${dueTime || "12:00"}`
                    : <span className="text-muted-foreground">{t("No due date")}</span>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("priority")}
                </label>
                <div className="p-2 border rounded-md bg-muted/30 flex items-center">
                  <Flag className={`mr-2 h-4 w-4 ${getPriorityColor(priority)}`} />
                  {getPriorityName(priority)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("project")}
              </label>
              <div className="p-2 border rounded-md bg-muted/30">
                {projectId ? (
                  <div className="flex items-center">
                    <div 
                      className="mr-2 h-3 w-3 rounded-full" 
                      style={{ 
                        backgroundColor: projects.find(p => p.id.toString() === projectId)?.color || "#ccc" 
                      }} 
                    />
                    {projectName || t("Unknown project")}
                  </div>
                ) : (
                  <span className="text-muted-foreground">{t("noProject")}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("Etiquetas")}
              </label>
              <TaskLabels key={taskLabelsKey} taskId={task.id} readOnly={!isEditMode} />
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                {t("created")}: {format(new Date(task.created_at), "PPP p")}
              </p>
              {task.updated_at && (
                <p>
                  {t("updated")}: {format(new Date(task.updated_at), "PPP p")}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 sm:gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-28"
          >
            <X className="mr-1 h-4 w-4" />
            {t("cancel")}
          </Button>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2 w-full sm:w-auto">
            {isEditMode ? (
              <>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete} 
                  disabled={isDeleting}
                  className="w-full sm:w-28"
                >
                  <Trash className="mr-1 h-4 w-4" />
                  {isDeleting ? t("Deleting...") : t("delete")}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full sm:w-28"
                >
                  <Check className="mr-1 h-4 w-4" />
                  {isSaving ? t("Saving...") : t("save")}
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsEditMode(true)}
                className="w-full sm:w-28"
              >
                <Check className="mr-1 h-4 w-4" />
                {t("edit")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
