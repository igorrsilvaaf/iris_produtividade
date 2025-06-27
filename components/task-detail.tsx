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
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
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
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTaskProject = async () => {
      if (!open || task.id === undefined) return;

      try {
        console.log(`[TaskDetail] Buscando projeto para task ID: ${task.id}`);
        const response = await fetch(`/api/tasks/${task.id}/${task.id}/project`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[TaskDetail] Projeto encontrado:`, data);
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
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await fetch("/api/projects");
        
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);

          // Não precisa do setProjectName aqui - o nome do projeto é obtido dinamicamente
        } else {
          console.error("Failed to fetch projects - Status:", response.status);
          const errorData = await response.text();
          console.error("Error details:", errorData);
          
          if (response.status === 401) {
            console.error("Unauthorized - user may not be logged in");
          }
          
          setProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (open) {
      // Debug: verificar se usuário está autenticado
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(session => {
          console.log('Session debug:', session);
          if (session?.user) {
            console.log('User authenticated, fetching projects...');
            fetchProjects();
          } else {
            console.error('User not authenticated - cannot fetch projects');
            setProjects([]);
            setIsLoadingProjects(false);
          }
        })
        .catch(err => {
          console.error('Session check failed:', err);
          fetchProjects(); // Tenta buscar mesmo assim
        });
    }
  }, [projectId, open]);

  const handleCreateProjectSuccess = async () => {
    setShowCreateProject(false);
    
    try {
      const response = await fetch("/api/projects");
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        
        if (data.projects && data.projects.length > 0) {
          const newProject = data.projects[data.projects.length - 1];
          setProjectId(newProject.id.toString());
          setShowAddProject(false);

          try {
            const projectResponse = await fetch(`/api/tasks/${task.id}/${task.id}/project`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                projectId: newProject.id,
              }),
            });

            if (projectResponse.ok) {
              setTimeout(() => {
                router.refresh();
              }, 100);
            } else {
              console.error("Failed to associate project with task - Status:", projectResponse.status);
            }
          } catch (error) {
            console.error("Falha ao associar o projeto à tarefa:", error);
          }
        }
      } else {
        console.error("Failed to refresh projects - Status:", response.status);
        const errorData = await response.text();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      let dueDateWithTime = null;

      if (dueDate) {
        if (isAllDay) {
          const date = new Date(dueDate);
          date.setHours(0, 0, 0, 0);
          dueDateWithTime = date.toISOString();
        } else if (dueTime) {
          const date = new Date(dueDate);
          const [hours, minutes] = dueTime.split(":").map(Number);
          date.setHours(hours, minutes, 0, 0);
          dueDateWithTime = date.toISOString();
        }
      }

      const estimatedTimeInMinutes = convertTimeToMinutes(
        estimatedTime,
        estimatedTimeUnit
      );

      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          due_date: dueDateWithTime,
          priority: Number.parseInt(priority),
          points,
          attachments,
          estimated_time: estimatedTimeInMinutes,
        }),
      });

      if (!taskResponse.ok) {
        throw new Error("Failed to update task details");
      }

      if (projectId) {
        const projectResponse = await fetch(`/api/tasks/${task.id}/${task.id}/project`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: Number.parseInt(projectId),
          }),
        });

        if (!projectResponse.ok) {
          throw new Error("Failed to update task project");
        }
      } else {
        const projectResponse = await fetch(`/api/tasks/${task.id}/${task.id}/project`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: null,
          }),
        });

        if (!projectResponse.ok) {
          throw new Error("Failed to remove task project");
        }
      }

      toast({
        title: t("taskUpdated"),
        description: t("Your task has been updated successfully."),
      });

      onOpenChange(false);
      setIsEditMode(false);
      router.refresh();
    } catch (error) {
      console.error("[TaskDetail] Erro ao salvar tarefa:", error);
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        return "text-red-500";
      case "2":
        return "text-orange-500";
      case "3":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityName = (p: string) => {
    switch (p) {
      case "1":
        return t("priority1");
      case "2":
        return t("priority2");
      case "3":
        return t("priority3");
      case "4":
        return t("priority4");
      default:
        return t("priority4");
    }
  };

  const toggleCheckboxInDescription = (index: number) => {
    if (isEditMode) return;

    const regex = /\[([x ])\]/g;
    let match;
    const checkboxPositions = [];

    while ((match = regex.exec(description)) !== null) {
      checkboxPositions.push({
        position: match.index,
        checked: match[1] === "x",
      });
    }

    if (index >= checkboxPositions.length) {
      return;
    }

    const position = checkboxPositions[index];
    const newDescription =
      description.substring(0, position.position + 1) +
      (position.checked ? " " : "x") +
      description.substring(position.position + 2);

    setDescription(newDescription);

    setTimeout(() => {
      updateTaskDescription(newDescription);
    }, 100);
  };

  const updateTaskDescription = async (newDescription: string) => {
    try {
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
    if (!description)
      return <p className="text-muted-foreground">{t("No description")}</p>;

    const allCheckboxes = [];
    const checkboxRegex = /\[([ x]?)\]/g;
    let match;
    let tempDescription = description;

    while ((match = checkboxRegex.exec(tempDescription)) !== null) {
      allCheckboxes.push({
        index: match.index,
        checked: match[1] === "x" || match[1] === "X",
      });
    }

    let globalCheckboxIndex = 0;
    return description.split("\n").map((line, lineIndex) => {
      if (line.trim() === "") {
        return <br key={`empty-line-${lineIndex}`} />;
      }

      const isBullet = line.trim().match(/^-\s(.+)$/);
      if (isBullet) {
        const bulletContent = isBullet[1];
        const processedContent = processBulletContent(
          bulletContent,
          lineIndex,
          globalCheckboxIndex
        );
        globalCheckboxIndex += processedContent.checkboxCount;

        return (
          <p key={`bullet-line-${lineIndex}`} className="mb-2 flex">
            <span className="mr-2">•</span>
            <span>{processedContent.content}</span>
          </p>
        );
      }

      const processedLine = processLineContent(
        line,
        lineIndex,
        globalCheckboxIndex
      );
      globalCheckboxIndex += processedLine.checkboxCount;

      return (
        <p key={`regular-line-${lineIndex}`} className="mb-2">
          {processedLine.content}
        </p>
      );
    });
  };

  const processBulletContent = (
    content: string,
    lineIndex: number,
    startCheckboxIndex: number
  ) => {
    return processLineContent(content, lineIndex, startCheckboxIndex);
  };

  const processLineContent = (
    line: string,
    lineIndex: number,
    startCheckboxIndex: number
  ) => {
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
          segments.push(
            <span key={`text-${lineIndex}-${lastIndex}-${segmentIndex++}`}>
              {textSegment}
            </span>
          );
        }
        lastCheckbox = null;
      }

      if (match[0].startsWith("[")) {
        const isChecked = match[2] === "x" || match[2] === "X";
        const currentCheckboxIndex = startCheckboxIndex + checkboxCount;

        segments.push(
          <span
            key={`checkbox-${lineIndex}-${match.index}-${segmentIndex++}`}
            className="inline-flex items-center align-middle"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

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
      } else if (match[0].match(/https?:\/\//)) {
        segments.push(
          <a
            key={`url-${lineIndex}-${match.index}-${segmentIndex++}`}
            href={match[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-500 hover:underline inline-flex items-center ${
              lastCheckbox && lastCheckbox.isChecked ? "line-through" : ""
            }`}
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
        segments.push(
          <span key={`text-${lineIndex}-${lastIndex}-${segmentIndex++}`}>
            {restText}
          </span>
        );
      }
    }

    return {
      content: segments.length > 0 ? segments : line,
      checkboxCount,
    };
  };

  useEffect(() => {
    if (dueTimeUpdate) {
      setDueTimeUpdate(false);
    }
  }, [dueTimeUpdate]);

  useEffect(() => {
    if (open && task.due_date) {
      if (dueDate === undefined) {
        console.warn(
          "[TaskDetail] Data indefinida detectada, tentando reparar"
        );
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
  };

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
        title: task.completed
          ? t("Task marked as incomplete")
          : t("Task marked as complete"),
        variant: "success",
      });
    } catch (error) {
      console.error(
        `[TaskDetail] Erro ao atualizar status de conclusão:`,
        error
      );
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
        return t("Muito Fácil");
      case 2:
        return t("Fácil");
      case 3:
        return t("Médio");
      case 4:
        return t("Difícil");
      case 5:
        return t("Muito Difícil");
      default:
        return t("Médio");
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

      const taskDetailResponse = await fetch(`/api/tasks/${task.id}`);

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

      router.refresh();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: t("Failed to upload file"),
        description: t("Please try again."),
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

      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
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

      router.refresh();
    } catch (error) {
      console.error("Error adding attachment:", error);
      toast({
        variant: "destructive",
        title: t("Failed to add attachment"),
        description: t("Please try again."),
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

      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
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
        title: t("Attachment removed"),
        description: t("Your attachment has been removed successfully."),
      });

      router.refresh();
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast({
        variant: "destructive",
        title: t("Failed to remove attachment"),
        description: t("Please try again."),
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
    >
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("Editar Tarefa") : t("Detalhes da Tarefa")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("Edite os detalhes da sua tarefa.")
              : t("Visualize os detalhes da sua tarefa.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("title")}</label>
            <Textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("Task title")}
              className="min-h-[80px] text-base"
              rows={3}
              readOnly={!isEditMode}
              disabled={!isEditMode}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("description")}</label>
            {isEditMode ? (
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("Add details about your task")}
                className="min-h-[120px]"
                rows={5}
              />
            ) : (
              <div className="p-3 border rounded-md min-h-[120px] cursor-not-allowed">
                {description ? (
                  <MarkdownRenderer content={description} />
                ) : (
                  <p className="text-muted-foreground">{t("No description")}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("dueDate")}</label>
              <div className="flex flex-col space-y-2">
                <Popover
                  open={isEditMode ? datePickerOpen : false}
                  onOpenChange={isEditMode ? setDatePickerOpen : undefined}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground",
                        !isEditMode && "cursor-not-allowed"
                      )}
                      disabled={!isEditMode}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        isAllDay ? (
                          format(dueDate, "PPP")
                        ) : (
                          `${format(dueDate, "PPP")} ${dueTime}`
                        )
                      ) : (
                        <span>{t("Pick a date")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{t("Date")}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDueDate(undefined);
                            setDatePickerOpen(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">{t("close")}</span>
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
                          />
                          <label
                            className="text-sm font-normal cursor-pointer"
                            htmlFor="taskDetailAllDay"
                          >
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
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("priority")}</label>
              <Select
                value={priority}
                onValueChange={setPriority}
                disabled={!isEditMode}
              >
                <SelectTrigger
                  className={!isEditMode ? "cursor-not-allowed" : ""}
                >
                  <SelectValue placeholder={t("Select priority")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPriorityColor("1")}`}
                      />
                      {t("Grave")}
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPriorityColor("2")}`}
                      />
                      {t("Alta")}
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPriorityColor("3")}`}
                      />
                      {t("Média")}
                    </div>
                  </SelectItem>
                  <SelectItem value="4">
                    <div className="flex items-center">
                      <Flag
                        className={`mr-2 h-4 w-4 ${getPriorityColor("4")}`}
                      />
                      {t("Baixa")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("points") || "Pontos"}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between text-left font-normal ${
                      !isEditMode ? "cursor-not-allowed" : ""
                    }`}
                    disabled={!isEditMode}
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
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="grid grid-cols-1 gap-2 p-2">
                    {[
                      { value: 1, label: t("Muito Fácil") },
                      { value: 2, label: t("Fácil") },
                      { value: 3, label: t("Médio") },
                      { value: 4, label: t("Difícil") },
                      { value: 5, label: t("Muito Difícil") },
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={points === value ? "default" : "ghost"}
                        className="justify-start font-normal"
                        onClick={() => {
                          setPoints(value);
                        }}
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
                {t("Tempo estimado")}
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={t("Tempo")}
                  className={`w-full ${
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
                />
                <Select
                  value={estimatedTimeUnit}
                  onValueChange={setEstimatedTimeUnit}
                  disabled={!isEditMode}
                >
                  <SelectTrigger
                    className={`w-[110px] ${
                      !isEditMode ? "cursor-not-allowed" : ""
                    }`}
                  >
                    <SelectValue placeholder={t("Unidade")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min">{t("Minutos")}</SelectItem>
                    <SelectItem value="h">{t("Horas")}</SelectItem>
                    <SelectItem value="d">{t("Dias")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("project")}</label>
            <div className={`${!isEditMode ? "cursor-not-allowed" : ""}`}>
              {isLoadingProjects ? (
                <div className="flex items-center justify-center p-4">{t("Loading projects...")}</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mt-1">
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
                      <p className="text-sm text-muted-foreground">{t("noProject")}</p>
                    )}
                  </div>
                  
                  {isEditMode && (
                    <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Plus className="mr-1 h-3 w-3" />
                          {t("Add Project")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("Add Project")}</DialogTitle>
                          <DialogDescription>
                            {t("Select a project or create a new one.")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                          {isLoadingProjects ? (
                            <div className="flex items-center justify-center p-4">{t("Loading projects...")}</div>
                          ) : projects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {t("No projects found.")}
                            </p>
                          ) : (
                            projects.map((project) => (
                              <button
                                key={project.id}
                                type="button"
                                className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                                onClick={() => {
                                  setProjectId(project.id.toString());
                                  setShowAddProject(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <div
                                    style={{ backgroundColor: project.color }}
                                    className="w-4 h-4 rounded-full mr-2"
                                  />
                                  <span>{project.name}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                        <div className="mt-4 border-t pt-4 flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddProject(false)}
                          >
                            {t("Cancel")}
                          </Button>
                          <Dialog
                            open={showCreateProject}
                            onOpenChange={setShowCreateProject}
                          >
                            <DialogTrigger asChild>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCreateProject(true);
                                }}
                              >
                                {t("Create New Project")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              className="z-[70]"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("labels")}</label>
            <div className={`${!isEditMode ? "cursor-not-allowed" : ""}`}>
              <TaskLabels
                key={taskLabelsKey}
                taskId={task.id}
                readOnly={!isEditMode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("attachment.list")}
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
                        {t("Image")}
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
                        {t("File")}
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
                          placeholder={t("Name (optional)")}
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
                            {t("Add")}
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
                            {t("Cancel")}
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
                          title={attachmentType === "image" ? t("Select Image") : t("Select File")}
                        />
                        <Button
                          type="button"
                          onClick={triggerFileUpload}
                          className="w-full"
                          size="sm"
                        >
                          {attachmentType === "image"
                            ? t("Select Image")
                            : t("Select File")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddAttachment(false)}
                          className="w-full"
                        >
                          {t("Cancel")}
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
                    {t("attachment.add")}
                  </Button>
                )
              ) : null}
            </div>
          </div>

          {/* Seção de Comentários */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Comentários</h3>
            <TaskComments taskId={task.id} user={user} />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
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
            className="w-full sm:w-28"
          >
            <X className="mr-1 h-4 w-4" />
            {isEditMode ? t("cancel") : t("close")}
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
              <>
                <Button
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="w-full sm:w-28"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {t("edit")}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
