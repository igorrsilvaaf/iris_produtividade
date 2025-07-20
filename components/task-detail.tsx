"use client";

// Bibliotecas externas do React
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// Componentes locais
import { TaskComments } from "./task-comments";

// Bibliotecas de terceiros
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Ícones (organizados por categoria/uso)
import {
  // Ações principais
  Plus,
  Save,
  Edit,
  Edit2,
  Check,
  CheckCheck,
  Copy,

  // Navegação
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ExternalLink,

  // Interface
  X,
  MoreHorizontal,
  EllipsisVertical,
  CircleDot,
  Star,

  // Arquivos e documentos
  FilePlus,
  FileText,
  Image,
  Paperclip,
  Download,

  // Tempo e calendário
  CalendarIcon,
  CalendarRange,
  Clock,
  Timer,
  TimerOff,

  // Organização
  Flag,
  Tag,
  Folders,
  Square,
  CheckSquare,
  Link,

  // Ações destrutivas
  Trash,
  Trash2,
} from "lucide-react";

// Types
import type { Todo } from "@/lib/todos";
import type { Project } from "@/lib/projects";

// Hooks e utils locais
import { useTranslation } from "@/lib/i18n";
import { useProjectsLabelsUpdates } from "@/hooks/use-projects-labels-updates";
import { useTaskUpdates } from "@/hooks/use-task-updates";
import { cn } from "@/lib/utils";

// 6. Componentes UI (agrupados por funcionalidade)
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

// Componentes de overlay/modal
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Componentes de formulário
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

// Componentes específicos do domínio
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { TaskLabels } from "@/components/task-labels";
import { ProjectForm } from "@/components/project-form";
import { RichTextEditor } from "@/components/rich-text-editor";

export type TodoWithEditMode = Todo & {
  isEditMode?: boolean;
};

interface TaskDetailProps {
  task: TodoWithEditMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
}

export function TaskDetail({ task, open, onOpenChange, user }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [dueTime, setDueTime] = useState<string | undefined>(
    task.due_date ? new Date(task.due_date).toTimeString().slice(0, 5) : "00:00"
  );
  const [dueTimeUpdate, setDueTimeUpdate] = useState(false);
  const [isAllDay, setIsAllDay] = useState(
    task.due_date
      ? new Date(task.due_date).getHours() === 0 &&
          new Date(task.due_date).getMinutes() === 0
      : true
  );
  const [priority, setPriority] = useState(task.priority.toString());
  const [points, setPoints] = useState(task.points || 3);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskLabelsKey, setTaskLabelsKey] = useState(0);
  const [status, setStatus] = useState(task.kanban_column || "inProgress");

  const [showAddProject, setShowAddProject] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{ type: string; url: string; name: string }>
  >(task.attachments || []);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState("link");
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [fileUploadRef, setFileUploadRef] = useState<HTMLInputElement | null>(
    null
  );
  const [imageUploadRef, setImageUploadRef] = useState<HTMLInputElement | null>(
    null
  );
  const [estimatedTime, setEstimatedTime] = useState<number | null>(
    task.estimated_time || null
  );
  const [estimatedTimeUnit, setEstimatedTimeUnit] = useState<string>("min");
  const router = useRouter();
  const { toast } = useToast();
  const { t, language, setLanguage, isHydrated } = useTranslation();
  const { notifyTaskCompleted, notifyTaskUpdated, notifyTaskDeleted } = useTaskUpdates();
  const { projects } = useProjectsLabelsUpdates();

  const safeTranslate = (key: string) => {
    if (!isHydrated) return key;
    try {
      return t(key);
    } catch (error) {
      return key;
    }
  };

  if (!isHydrated) {
    return null;
  }

  useEffect(() => {
    const fetchTaskProject = async () => {
      if (!open || task.id === undefined) return;

      try {
        const response = await fetch(`/api/tasks/${task.id}/${task.id}/project`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.projectId) {
            setProjectId(data.projectId.toString());
          } else {
            setProjectId(null);
          }
        } else {
          console.error(`[TaskDetail] Erro ao buscar projeto - Status: ${response.status}`);
          const errorData = await response.text();
          console.error(`[TaskDetail] Detalhes do erro:`, errorData);
        }
      } catch (error) {
        console.error(`[TaskDetail] Erro ao buscar projeto da tarefa:`, error);
      }
    };

    fetchTaskProject();
  }, [open, task.id]);

  useEffect(() => {
    if (open) {
      setTaskLabelsKey((prev) => prev + 1);
      if (task.isEditMode) {
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
      }

      setTitle(task.title);
      setDescription(task.description || "");
      setPoints(task.points || 3);
      setStatus(task.kanban_column || "inProgress");

      if (task.due_date) {
        try {
          const dueDate = new Date(task.due_date);
          setDueDate(dueDate);

          const hours = dueDate.getHours();
          const minutes = dueDate.getMinutes();
          const timeString = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
          setDueTime(timeString);

          const isAllDayTime = hours === 0 && minutes === 0;
          setIsAllDay(isAllDayTime);
        } catch (error) {
          console.error(`[TaskDetail] Erro ao processar data: ${error}`);
          setDueDate(undefined);
          setDueTime("00:00");
          setIsAllDay(true);
        }
      } else {
        setDueDate(undefined);
        setDueTime("00:00");
        setIsAllDay(true);
      }

      setPriority(task.priority.toString());

      try {
        let normalizedAttachments = [];
        if (task.attachments) {
          if (Array.isArray(task.attachments)) {
            normalizedAttachments = task.attachments;
          } else if (typeof task.attachments === "string") {
            try {
              normalizedAttachments = JSON.parse(task.attachments);
            } catch (e) {
              console.error(
                `[TaskDetail] Erro ao parsear anexos como string: ${e}`
              );
              normalizedAttachments = [];
            }
          }
        }

        setAttachments(normalizedAttachments);
      } catch (error) {
        console.error(`[TaskDetail] Erro ao processar anexos:`, error);
        setAttachments([]);
      }
    }
  }, [open, task]);

  useEffect(() => {
    if (dueTimeUpdate) {
      setDueTimeUpdate(false);
    }
  }, [dueTimeUpdate]);

  useEffect(() => {
    if (open && task.due_date) {
      if (dueDate === undefined) {
        try {
          setDueDate(new Date(task.due_date));
        } catch (error) {
        }
      }
    }
  }, [open, task.due_date, dueDate]);

  const startPomodoro = () => {
    router.push(`/app/pomodoro?taskId=${task.id}`);
    onOpenChange(false);
  };

  const toggleCompletion = async () => {
    try {
      const response = await fetch(`/api/tasks/toggle/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle task completion");
      }

      const responseData = await response.json();

      toast({
        title: task.completed
                  ? safeTranslate("Task marked as incomplete")
        : safeTranslate("Task marked as complete"),
        variant: "success",
      });

      notifyTaskCompleted(task.id, responseData.task);
    } catch (error) {
      toast({
        variant: "destructive",
        title: safeTranslate("Failed to update task"),
        description: safeTranslate("Please try again."),
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
        setDueTime("00:00");
        setIsAllDay(true);
      }

      setPriority(task.priority.toString());
    }
  }, [isEditMode, task]);

  const getPointsColor = (points: number) => {
    switch (points) {
      case 1:
        return "text-green-500";
      case 2:
        return "text-blue-500";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-orange-500";
      case 5:
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getPointsLabel = (points: number) => {
    switch (points) {
      case 1:
        return safeTranslate("veryEasy");
      case 2:
        return safeTranslate("easy");
      case 3:
        return safeTranslate("medium");
      case 4:
        return safeTranslate("hard");
      case 5:
        return safeTranslate("veryHard");
      default:
        return safeTranslate("medium");
    }
  };

  const PointsDisplay = () => {
    return (
      <div className="flex items-center">
        <CircleDot className={`mr-2 h-4 w-4 ${getPointsColor(points)}`} />
        <span>
          {points} - {getPointsLabel(points)}
        </span>
      </div>
    );
  };

  const formatEstimatedTime = (minutes: number | null | undefined) => {
    if (!minutes) return null;

    const days = Math.floor(minutes / (60 * 8));
    const remainingHours = Math.floor((minutes % (60 * 8)) / 60);
    const remainingMinutes = minutes % 60;

    if (days > 0) {
      if (remainingHours > 0 || remainingMinutes > 0) {
        return `${days}d ${remainingHours > 0 ? `${remainingHours}h` : ""} ${
          remainingMinutes > 0 ? `${remainingMinutes}min` : ""
        }`.trim();
      }
      return `${days}d`;
    } else if (remainingHours > 0) {
      if (remainingMinutes > 0) {
        return `${remainingHours}h ${remainingMinutes}min`;
      }
      return `${remainingHours}h`;
    } else {
      return `${remainingMinutes}min`;
    }
  };

  useEffect(() => {
    if (task.attachments) {
      setAttachments(task.attachments);
    }
  }, [task.attachments]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", task.id.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      const newAttachment = {
        id: data.id,
        type: data.type,
        url: data.url,
        name: data.name,
      };

      const taskDetailResponse = await fetch(`/api/tasks/${task.id}/${task.id}`);

      if (!taskDetailResponse.ok) {
        throw new Error("Failed to fetch updated task");
      }

      const updatedTaskData = await taskDetailResponse.json();

      if (updatedTaskData && updatedTaskData.attachments) {
        task.attachments = updatedTaskData.attachments;
        setAttachments(updatedTaskData.attachments);
      } else {
        const currentAttachments = Array.isArray(task.attachments)
          ? [...task.attachments]
          : [];
        const updatedAttachments = [...currentAttachments, newAttachment];
        task.attachments = updatedAttachments;
        setAttachments(updatedAttachments);
      }

      setShowAddAttachment(false);

      if (event.target) {
        event.target.value = "";
      }

      toast({
        title: t("Attachment added"),
        description: t("Your attachment has been added successfully."),
      });

      notifyTaskUpdated(task.id, updatedTaskData);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: safeTranslate("Failed to upload file"),
        description: safeTranslate("Please try again."),
      });
    }
  };

  const addAttachment = async () => {
    if (!attachmentUrl.trim()) return;

    try {
      const newAttachment = {
        type: attachmentType,
        url: attachmentUrl.trim(),
        name: attachmentName.trim() || attachmentUrl.trim(),
      };

      let currentAttachments = [];
      if (task.attachments) {
        if (Array.isArray(task.attachments)) {
          currentAttachments = [...task.attachments];
        } else if (typeof task.attachments === "string") {
          try {
            currentAttachments = JSON.parse(task.attachments);
          } catch (e) {
            console.error(
              `[addAttachment] Erro ao parsear anexos existentes: ${e}`
            );
            currentAttachments = [];
          }
        }
      }

      const updatedAttachments = [...currentAttachments, newAttachment];

      const taskResponse = await fetch(`/api/tasks/${task.id}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachments: updatedAttachments,
        }),
      });

      if (!taskResponse.ok) {
        throw new Error("Failed to update task attachments");
      }

      const updatedTask = await taskResponse.json();
      task.attachments = updatedTask.attachments;

      setAttachmentUrl("");
      setAttachmentName("");
      setShowAddAttachment(false);

      toast({
        title: t("Attachment added"),
        description: t("Your attachment has been added successfully."),
      });

      notifyTaskUpdated(task.id, updatedTask);
    } catch (error) {
      console.error("Error adding attachment:", error);
      toast({
        variant: "destructive",
        title: safeTranslate("Failed to add attachment"),
        description: safeTranslate("Please try again."),
      });
    }
  };

  const removeAttachment = async (index: number) => {
    try {
      let currentAttachments = [];
      if (task.attachments) {
        if (Array.isArray(task.attachments)) {
          currentAttachments = [...task.attachments];
        } else if (typeof task.attachments === "string") {
          try {
            currentAttachments = JSON.parse(task.attachments);
          } catch (e) {
            console.error(
              `[removeAttachment] Erro ao parsear anexos existentes: ${e}`
            );
            currentAttachments = [];
          }
        }
      }

      if (index < 0 || index >= currentAttachments.length) {
        console.error(
          `[removeAttachment] Índice inválido: ${index}, total de anexos: ${currentAttachments.length}`
        );
        throw new Error("Invalid attachment index");
      }

      const updatedAttachments = [...currentAttachments];
      updatedAttachments.splice(index, 1);

      const taskResponse = await fetch(`/api/tasks/${task.id}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachments: updatedAttachments,
        }),
      });

      if (!taskResponse.ok) {
        throw new Error("Failed to update task attachments");
      }

      const updatedTask = await taskResponse.json();
      task.attachments = updatedTask.attachments;

      toast({
        title: safeTranslate("Attachment removed"),
        description: safeTranslate("Your attachment has been removed successfully."),
      });

      notifyTaskUpdated(task.id, updatedTask);
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast({
        variant: "destructive",
        title: safeTranslate("Failed to remove attachment"),
        description: safeTranslate("Please try again."),
      });
    }
  };

  const triggerFileUpload = () => {
    if (attachmentType === "image") {
      imageUploadRef?.click();
    } else if (attachmentType === "file") {
      fileUploadRef?.click();
    }
  };

  const getTimeUnitAndValue = (
    minutes: number | null
  ): { value: number | null; unit: string } => {
    if (minutes === null) return { value: null, unit: "min" };

    if (minutes % (60 * 8) === 0 && minutes >= 60 * 8) {
      return { value: minutes / (60 * 8), unit: "d" };
    } else if (minutes % 60 === 0 && minutes >= 60) {
      return { value: minutes / 60, unit: "h" };
    } else {
      return { value: minutes, unit: "min" };
    }
  };

  const convertTimeToMinutes = (
    timeValue: number | null,
    unit: string
  ): number | null => {
    if (timeValue === null) return null;

    switch (unit) {
      case "h":
        return timeValue * 60;
      case "d":
        return timeValue * 60 * 8;
      default:
        return timeValue;
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      backlog: {
        label: safeTranslate("backlog") || "Backlog",
        color: "bg-gray-500",
        icon: "📋"
      },
      planning: {
        label: safeTranslate("planning") || "Planejamento", 
        color: "bg-blue-500",
        icon: "🕐"
      },
      inProgress: {
        label: safeTranslate("inProgress") || "Em Progresso",
        color: "bg-yellow-500", 
        icon: "▶️"
      },
      validation: {
        label: safeTranslate("validation") || "Validação",
        color: "bg-orange-500",
        icon: "⚠️"
      },
      completed: {
        label: safeTranslate("completed") || "Concluída",
        color: "bg-green-500",
        icon: "✅"
      }
    };
    return configs[status as keyof typeof configs] || configs.inProgress;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: safeTranslate("Error"),
        description: safeTranslate("Title is required"),
      });
      return;
    }

    setIsSaving(true);

    try {
      let normalizedDueDate: Date | null = null;
      if (dueDate) {
        if (isAllDay) {
          normalizedDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        } else {
          const [hours, minutes] = dueTime!.split(":").map(Number);
          normalizedDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), hours, minutes);
        }
      }

      const updateData: any = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: normalizedDueDate?.toISOString() || null,
        priority: parseInt(priority),
        points,
        estimated_time: convertTimeToMinutes(estimatedTime, estimatedTimeUnit),
        attachments,
        kanban_column: status
      };

      const response = await fetch(`/api/tasks/${task.id}/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        notifyTaskUpdated(updatedTask.task);
        
        toast({
          title: safeTranslate("Task updated"),
          description: title,
        });
        
        setIsEditMode(false);
        onOpenChange(false);
      } else {
        const errorText = await response.text();
        console.error(`Erro ao atualizar tarefa: Status ${response.status}, Detalhes: ${errorText}`);
        
        toast({
          variant: "destructive",
          title: safeTranslate("Failed to update task"),
          description: safeTranslate("Please try again"),
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      
      toast({
        variant: "destructive",
        title: safeTranslate("Failed to update task"),
        description: safeTranslate("An unexpected error occurred"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task.id) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}/${task.id}`, {
        method: "DELETE",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete task: ${errorData.error}`);
      }

      onOpenChange(false);

      toast({
        title: safeTranslate("Task deleted"),
        description: safeTranslate("Your task has been deleted successfully."),
        variant: "success",
      });

      notifyTaskDeleted(task.id);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: safeTranslate("Failed to delete task"),
        description: error instanceof Error ? error.message : safeTranslate("Please try again."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (task.estimated_time !== undefined && task.estimated_time !== null) {
      const { value, unit } = getTimeUnitAndValue(task.estimated_time);
      setEstimatedTime(value);
      setEstimatedTimeUnit(unit);
    }
  }, [task.estimated_time]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && isEditMode) {
          setIsEditMode(false);
        }
        onOpenChange(newOpen);
      }}
      data-testid="task-detail-dialog"
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto w-[95vw] sm:w-full" data-testid="task-detail-content">
        <DialogHeader>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle data-testid="task-detail-title" className="text-lg sm:text-xl">
                  {isEditMode ? safeTranslate("editTask") : safeTranslate("taskDetails")}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mr-8">
                {isEditMode ? (
                  <Select
                    value={status}
                    onValueChange={setStatus}
                    data-testid="task-detail-status-select"
                  >
                    <SelectTrigger className="w-[120px] sm:w-[140px] text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          <span className="text-sm">{safeTranslate("backlog") || "Backlog"}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="planning">
                        <div className="flex items-center gap-2">
                          <span>🕐</span>
                          <span className="text-sm">{safeTranslate("planning") || "Planejamento"}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inProgress">
                        <div className="flex items-center gap-2">
                          <span>▶️</span>
                          <span className="text-sm">{safeTranslate("inProgress") || "Em Progresso"}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="validation">
                        <div className="flex items-center gap-2">
                          <span>⚠️</span>
                          <span className="text-sm">{safeTranslate("validation") || "Validação"}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span className="text-sm">{safeTranslate("completed") || "Concluída"}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-md bg-muted text-xs sm:text-sm">
                    <span>{getStatusConfig(status).icon}</span>
                    <span className="font-medium truncate max-w-[80px] sm:max-w-none">{getStatusConfig(status).label}</span>
                  </div>
                )}
              </div>
            </div>
            <DialogDescription data-testid="task-detail-description" className="text-sm">
              {isEditMode
                ? safeTranslate("Edite os detalhes da sua tarefa.")
                : safeTranslate("Visualize os detalhes da sua tarefa.")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4" data-testid="task-detail-form">
          <div className="space-y-2">
            <label className="text-sm font-medium">{safeTranslate("title")}</label>
            <Textarea
              id="title"
              data-testid="task-detail-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
                              placeholder={safeTranslate("Task title")}
              className="min-h-[80px] text-base"
              rows={3}
              readOnly={!isEditMode}
              disabled={!isEditMode}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{safeTranslate("description")}</label>
            {isEditMode ? (
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder={safeTranslate("Add details about your task")}
                disabled={isSaving}
                minHeight="200px"
                className="w-full"
                showActions={false}
                dataTestid="task-detail-description-input"
              />
            ) : (
              <div className="p-3 border rounded-md min-h-[120px] cursor-not-allowed" data-testid="task-detail-description-display">
                {description ? (
                  <MarkdownRenderer content={description} />
                ) : (
                  <p className="text-muted-foreground">{safeTranslate("No description")}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{safeTranslate("dueDate")}</label>
              <div className="flex flex-col space-y-2">
                <Popover
                  open={isEditMode ? datePickerOpen : false}
                  onOpenChange={isEditMode ? setDatePickerOpen : undefined}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        !dueDate && "text-muted-foreground",
                        !isEditMode && "cursor-not-allowed"
                      )}
                      disabled={!isEditMode}
                      data-testid="task-detail-due-date-button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {dueDate ? (
                          isAllDay ? (
                            format(dueDate, "dd/MM/yyyy")
                          ) : (
                            `${format(dueDate, "dd/MM/yyyy")} ${dueTime}`
                          )
                        ) : (
                          safeTranslate("Pick a date")
                        )}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" data-testid="task-detail-date-picker">
                    <div className="p-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{safeTranslate("Date")}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDueDate(undefined);
                            setDatePickerOpen(false);
                          }}
                          data-testid="task-detail-date-picker-close"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">{safeTranslate("close")}</span>
                        </Button>
                      </div>
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          if (date) {
                            setDueDate(date);
                            setTimeout(() => setDatePickerOpen(false), 100);
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        data-testid="task-detail-calendar"
                      />
                      <div className="pt-3 pb-2 border-t mt-3">
                        <div className="flex flex-row items-center space-x-3 space-y-0 h-9">
                          <Checkbox
                            id="taskDetailAllDay"
                            checked={isAllDay}
                            onCheckedChange={(checked) => {
                              setIsAllDay(checked === true);
                              if (checked) {
                                setDueTime("00:00");
                              } else {
                                setDueTime("00:00");
                              }
                              if (typeof window !== "undefined") {
                                setTimeout(() => {
                                  setDueTimeUpdate(!dueTimeUpdate);
                                }, 0);
                              }
                            }}
                            data-testid="task-detail-all-day-checkbox"
                          />
                          <label
                            className="text-sm font-normal cursor-pointer"
                            htmlFor="taskDetailAllDay"
                          >
                            {safeTranslate("allDay")}
                          </label>
                        </div>
                      </div>
                      <div className={`mt-2 ${isAllDay ? "hidden" : ""}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Input
                            type="time"
                            value={dueTime}
                            onChange={(e) => {
                              setDueTime(e.target.value || "00:00");
                              setDueTimeUpdate(true);
                            }}
                            className="w-full"
                            inputMode="text"
                            pattern="[0-9]{2}:[0-9]{2}"
                            placeholder="HH:MM"
                            onClick={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.focus();
                              if (
                                typeof window !== "undefined" &&
                                /iPhone|iPad|iPod/.test(navigator.userAgent)
                              ) {
                                setTimeout(() => {
                                  target.click();
                                }, 100);
                              }
                            }}
                            data-testid="task-detail-due-time-input"
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{safeTranslate("priority")}</label>
              <Select
                value={priority}
                onValueChange={setPriority}
                disabled={!isEditMode}
              >
                <SelectTrigger data-testid="task-detail-priority-select"
                  className={!isEditMode ? "cursor-not-allowed" : ""}
                >
                  <SelectValue placeholder={safeTranslate("Select priority")} />
                </SelectTrigger>
                <SelectContent data-testid="task-detail-priority-content">
                  <SelectItem value="1" data-testid="task-detail-priority-1">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPointsColor(1)}`}
                      />
                      {safeTranslate("priority1")}
                    </div>
                  </SelectItem>
                  <SelectItem value="2" data-testid="task-detail-priority-2">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPointsColor(2)}`}
                      />
                      {safeTranslate("priority2")}
                    </div>
                  </SelectItem>
                  <SelectItem value="3" data-testid="task-detail-priority-3">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPointsColor(3)}`}
                      />
                      {safeTranslate("priority3")}
                    </div>
                  </SelectItem>
                  <SelectItem value="4" data-testid="task-detail-priority-4">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPointsColor(4)}`}
                      />
                      {safeTranslate("priority4")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {safeTranslate("points") || "Pontos"}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between text-left font-normal ${
                      !isEditMode ? "cursor-not-allowed" : ""
                    }`}
                    disabled={!isEditMode}
                    data-testid="task-detail-points-button"
                  >
                    <div className="flex items-center">
                      <CircleDot
                        className={`mr-2 h-4 w-4 ${getPointsColor(points)}`}
                      />
                      <span>
                        {points} - {getPointsLabel(points)}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" data-testid="task-detail-points-content">
                  <div className="grid grid-cols-1 gap-2 p-2">
                    {[
                      { value: 1, label: safeTranslate("veryEasy") },
                      { value: 2, label: safeTranslate("easy") },
                      { value: 3, label: safeTranslate("medium") },
                      { value: 4, label: safeTranslate("hard") },
                      { value: 5, label: safeTranslate("veryHard") },
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={points === value ? "default" : "ghost"}
                        className="justify-start font-normal"
                        onClick={() => {
                          setPoints(value);
                        }}
                        data-testid={`task-detail-points-${value}`}
                      >
                        <CircleDot
                          className={`mr-2 h-4 w-4 ${getPointsColor(value)}`}
                        />
                        <span>
                          {value} - {label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {safeTranslate("task.estimatedTime")}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="number"
                  placeholder={safeTranslate("task.timeValue")}
                  className={`flex-1 ${
                    !isEditMode ? "cursor-not-allowed" : ""
                  }`}
                  min="0"
                  disabled={!isEditMode}
                  value={estimatedTime === null ? "" : estimatedTime}
                  onChange={(e) =>
                    setEstimatedTime(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  data-testid="task-detail-estimated-time-input"
                />
                <Select
                  value={estimatedTimeUnit}
                  onValueChange={setEstimatedTimeUnit}
                  disabled={!isEditMode}
                >
                  <SelectTrigger
                    className={`w-full sm:w-[110px] ${
                      !isEditMode ? "cursor-not-allowed" : ""
                    }`}
                    data-testid="task-detail-estimated-time-unit-select"
                  >
                    <SelectValue placeholder={safeTranslate("task.timeUnit")} />
                  </SelectTrigger>
                  <SelectContent data-testid="task-detail-estimated-time-unit-content">
                    <SelectItem value="min" data-testid="task-detail-estimated-time-unit-minutes">{safeTranslate("timeUnit.minutes")}</SelectItem>
                    <SelectItem value="h" data-testid="task-detail-estimated-time-unit-hours">{safeTranslate("timeUnit.hours")}</SelectItem>
                    <SelectItem value="d" data-testid="task-detail-estimated-time-unit-days">{safeTranslate("timeUnit.days")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{safeTranslate("project")}</label>
            <div className={`${!isEditMode ? "cursor-not-allowed" : ""}`}>
              {projectId && projects.find((p) => p.id.toString() === projectId) ? (
                <div
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: projects.find((p) => p.id.toString() === projectId)?.color || "#ccc",
                    color: "#fff",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                  />
                  <span>
                    {projects.find((p) => p.id.toString() === projectId)?.name}
                  </span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => setProjectId(null)}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                      aria-label={`Remove project`}
                      title="Remove project"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{safeTranslate("noProject")}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{safeTranslate("labels")}</label>
            <div className={`${!isEditMode ? "cursor-not-allowed" : ""}`} data-testid="task-detail-labels-container">
              <TaskLabels
                key={taskLabelsKey}
                taskId={task.id}
                readOnly={!isEditMode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {safeTranslate("attachment.list")}
            </label>
            <div
              className={`space-y-2 ${!isEditMode ? "cursor-not-allowed" : ""}`}
            >
              {task.attachments && task.attachments.length > 0 && (
                <div className="space-y-2">
                  {task.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {attachment.type === "link" && (
                          <Link className="h-4 w-4" />
                        )}
                        {attachment.type === "image" && (
                          <Image className="h-4 w-4" />
                        )}
                        {attachment.type === "file" && (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="truncate">{attachment.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {attachment.type === "link" ? (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 flex-shrink-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <a
                            href={`/api/attachments/download/${attachment.id}`}
                            download
                            className="text-primary hover:text-primary/80 flex-shrink-0"
                            onClick={(e) => {
                              // Impede que o clique no link feche o modal
                              e.stopPropagation();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        {isEditMode && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEditMode ? (
                showAddAttachment ? (
                  <div className="space-y-2 border rounded-md p-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={
                          attachmentType === "link" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setAttachmentType("link")}
                        className="w-full"
                      >
                        Link
                      </Button>
                      <Button
                        type="button"
                        variant={
                          attachmentType === "image" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setAttachmentType("image")}
                        className="w-full"
                      >
                        {safeTranslate("Image")}
                      </Button>
                      <Button
                        type="button"
                        variant={
                          attachmentType === "file" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setAttachmentType("file")}
                        className="w-full"
                      >
                        {safeTranslate("File")}
                      </Button>
                    </div>

                    {attachmentType === "link" ? (
                      <>
                        <Input
                          placeholder="URL"
                          value={attachmentUrl}
                          onChange={(e) => setAttachmentUrl(e.target.value)}
                        />

                        <Input
                          placeholder={safeTranslate("Name (optional)")}
                          value={attachmentName}
                          onChange={(e) => setAttachmentName(e.target.value)}
                        />

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            onClick={addAttachment}
                            disabled={!attachmentUrl.trim()}
                            size="sm"
                          >
                            {safeTranslate("Add")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddAttachment(false);
                              setAttachmentUrl("");
                              setAttachmentName("");
                            }}
                          >
                            {safeTranslate("Cancel")}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept={
                            attachmentType === "image" ? "image/*" : "*/*"
                          }
                          className="hidden"
                          onChange={handleFileUpload}
                          ref={(node) =>
                            attachmentType === "image"
                              ? setImageUploadRef(node)
                              : setFileUploadRef(node)
                          }
                          title={attachmentType === "image" ? safeTranslate("Select Image") : safeTranslate("Select File")}
                        />
                        <Button
                          type="button"
                          onClick={triggerFileUpload}
                          className="w-full"
                          size="sm"
                        >
                          {attachmentType === "image"
                            ? safeTranslate("Select Image")
                            : safeTranslate("Select File")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddAttachment(false)}
                          className="w-full"
                        >
                          {safeTranslate("Cancel")}
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddAttachment(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {safeTranslate("attachment.add")}
                  </Button>
                )
              ) : null}
            </div>
          </div>

          {/* Seção de Comentários */}
          <div className="border-t pt-4 mt-6" data-testid="task-detail-comments-section">
            <h3 className="text-lg font-medium mb-4 px-1" data-testid="task-detail-comments-title">Comentários</h3>
            <div className="px-1" data-testid="task-detail-comments-container">
              <TaskComments taskId={task.id} user={user || null} />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 px-2" data-testid="task-detail-footer">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (isEditMode) {
                setIsEditMode(false);
                setTitle(task.title);
                setDescription(task.description || "");
                setPriority(task.priority.toString());
                setPoints(task.points || 3);
                setStatus(task.kanban_column || "inProgress");
                if (task.due_date) {
                  setDueDate(new Date(task.due_date));
                  setDueTime(
                    new Date(task.due_date).getHours() === 0 &&
                      new Date(task.due_date).getMinutes() === 0
                      ? "00:00"
                      : new Date(task.due_date).toTimeString().slice(0, 5)
                  );
                  setIsAllDay(
                    new Date(task.due_date).getHours() === 0 &&
                      new Date(task.due_date).getMinutes() === 0
                  );
                } else {
                  setDueDate(undefined);
                  setDueTime("00:00");
                  setIsAllDay(true);
                }
              } else {
                onOpenChange(false);
              }
            }}
            className="w-full sm:w-auto min-w-[100px]"
            data-testid="task-detail-cancel-close-button"
          >
            <X className="mr-1 h-4 w-4" />
            {isEditMode ? safeTranslate("cancel") : safeTranslate("close")}
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto" data-testid="task-detail-actions">
            {isEditMode ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto min-w-[100px]"
                  data-testid="task-detail-delete-button"
                >
                  <Trash className="mr-1 h-4 w-4" />
                  {isDeleting ? safeTranslate("Deleting...") : safeTranslate("delete")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto min-w-[100px]"
                  data-testid="task-detail-save-button"
                >
                  <Check className="mr-1 h-4 w-4" />
                  {isSaving ? safeTranslate("Saving...") : safeTranslate("save")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="w-full sm:w-auto min-w-[100px]"
                  data-testid="task-detail-edit-button"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {safeTranslate("edit")}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
