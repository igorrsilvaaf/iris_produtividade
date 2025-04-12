"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Flag, Trash, Clock, X, Save, Edit, CheckSquare, Square, Link, Plus } from "lucide-react"
import type { Todo } from "@/lib/todos"
import type { Project } from "@/lib/projects"
import { useTranslation } from "@/lib/i18n"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
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

interface TaskDetailProps {
  task: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to safely check if date is all-day (00:00)
function isAllDayDate(dateString: string | null): boolean {
  if (!dateString) return true;
  try {
    const date = new Date(dateString);
    return date.getHours() === 0 && date.getMinutes() === 0;
  } catch (e) {
    return true;
  }
}

// Helper function to safely extract time from date
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
        ? "12:00" // Se for dia todo (00:00), define um horário padrão para o seletor
        : new Date(task.due_date).toTimeString().slice(0, 5)
      : "12:00"
  )
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

  // Buscar o projeto da tarefa
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
      // Reset to view mode when opening
      setIsEditMode(false)
      
      // Reset form values to task values
      setTitle(task.title)
      setDescription(task.description || "")
      setDueDate(task.due_date ? new Date(task.due_date) : undefined)
      setDueTime(getTimeFromDate(task.due_date))
      setIsAllDay(isAllDayDate(task.due_date))
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
          
          // Se tiver um projectId, busque o nome do projeto
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
    // Refresh projects
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
      let dueDateWithTime = null;
      
      if (dueDate) {
        if (isAllDay) {
          dueDateWithTime = dueDate.toISOString().split('T')[0] + 'T00:00:00Z';
        } else {
          const date = new Date(dueDate);
          const [hours, minutes] = (dueTime || "12:00").split(':').map(Number);
          date.setHours(hours, minutes);
          dueDateWithTime = date.toISOString();
        }
      }

      console.log(`[TaskDetail] Salvando alterações para tarefa ${task.id}`);
      console.log(`[TaskDetail] Nova data: ${dueDateWithTime}`);

      // Primeiro, atualize os detalhes da tarefa
      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          due_date: dueDateWithTime,
          priority: Number.parseInt(priority),
        }),
      })

      if (!taskResponse.ok) {
        throw new Error("Failed to update task")
      }

      // Depois, atualize o projeto da tarefa apenas se necessário
      const projectIdInt = projectId ? parseInt(projectId, 10) : null;
      
      console.log(`[TaskDetail] Atualizando projeto para tarefa ${task.id} para ${projectIdInt}`);
      
      const projectResponse = await fetch(`/api/tasks/${task.id}/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectIdInt,
        }),
      })

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json();
        console.error(`[TaskDetail] Erro ao atualizar projeto:`, errorData);
        throw new Error("Failed to update task project")
      }

      // Atualizar o nome do projeto no estado local
      if (projectIdInt) {
        const selectedProject = projects.find(p => p.id === projectIdInt);
        if (selectedProject) {
          setProjectName(selectedProject.name);
        }
      } else {
        setProjectName("");
      }

      toast({
        title: t("taskUpdated"),
        description: t("Task has been updated successfully."),
      })

      // Mudamos para não recarregar automaticamente, apenas atualizar o estado local
      setIsEditMode(false)
      
      // Forçar atualização completa da página para refletir as mudanças
      router.refresh();
    } catch (error) {
      console.error(`[TaskDetail] Erro ao salvar tarefa:`, error);
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      console.log(`[TaskDetail] Excluindo tarefa ${task.id}`);
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast({
        title: t("taskDeleted"),
        description: t("Task has been deleted successfully."),
      })

      // Fechar o modal sem causar recargas adicionais
      onOpenChange(false)
      
      // Atualização seletiva sem recarregar a página inteira
      if (typeof window !== 'undefined') {
        console.log(`[TaskDetail] Tarefa ${task.id} excluída com sucesso`);
        // Damos um pequeno atraso antes de redirecionar para garantir que o toast seja exibido
        setTimeout(() => {
          router.refresh();
        }, 500);
      }
    } catch (error) {
      console.error(`[TaskDetail] Erro ao excluir tarefa:`, error);
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again."),
      })
    } finally {
      setIsDeleting(false)
    }
  }

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

  // Função para alternar estado do checkbox na descrição
  const toggleCheckboxInDescription = (index: number) => {
    if (isEditMode) return; // Não permitir alterações no modo de edição
    
    console.log(`Alternando checkbox ${index} na descrição`);
    
    // Encontrar todos os checkboxes na descrição
    const checkboxRegex = /\[([ x]?)\]/g;
    let checkboxPositions = [];
    let match;
    
    // Primeiro, encontre todas as posições de checkbox no texto
    while ((match = checkboxRegex.exec(description)) !== null) {
      const isChecked = match[1] === 'x' || match[1] === 'X';
      checkboxPositions.push({
        index: match.index,
        length: match[0].length,
        isChecked
      });
    }
    
    console.log(`Encontrados ${checkboxPositions.length} checkboxes na descrição`);
    
    // Verificar se temos o índice solicitado
    if (index >= 0 && index < checkboxPositions.length) {
      const targetCheckbox = checkboxPositions[index];
      
      // Criar a nova descrição com o checkbox alternado
      const before = description.substring(0, targetCheckbox.index);
      const after = description.substring(targetCheckbox.index + targetCheckbox.length);
      const newCheckbox = targetCheckbox.isChecked ? '[ ]' : '[x]';
      
      const newDescription = before + newCheckbox + after;
      
      console.log(`Checkbox alternado de ${targetCheckbox.isChecked ? '[x]' : '[ ]'} para ${newCheckbox}`);
      
      // Atualiza o estado e salva no servidor
      setDescription(newDescription);
      updateTaskDescription(newDescription);
    } else {
      console.error(`Índice de checkbox inválido: ${index}, total de checkboxes: ${checkboxPositions.length}`);
    }
  };
  
  // Função para atualizar a descrição da tarefa no servidor
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
        throw new Error("Failed to update task description");
      }
      
      toast({
        title: t("Task updated"),
        description: t("Checklist item has been updated."),
      });
      
      // Atualiza a visão
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
  
  // Função para renderizar a descrição com checkboxes interativos
  const renderDescription = () => {
    if (!description) return <p className="text-muted-foreground">{t("No description")}</p>;
    
    // Primeiro, encontre todos os checkboxes para termos a contagem global
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
    
    // Divide a descrição em linhas
    let globalCheckboxIndex = 0;
    return description.split('\n').map((line, lineIndex) => {
      // Se a linha estiver vazia, retorna um <br>
      if (line.trim() === '') {
        return <br key={`line-${lineIndex}`} />;
      }
      
      // Verifica se a linha começa com traço (bullet point)
      const isBullet = line.trim().match(/^-\s(.+)$/);
      if (isBullet) {
        // Extrai o conteúdo após o traço
        const bulletContent = isBullet[1];
        // Processamos o conteúdo normal, mas com um estilo de bullet point
        const processedContent = processBulletContent(bulletContent, lineIndex, globalCheckboxIndex);
        // Atualiza o índice global com base em quantos checkboxes foram encontrados na linha
        globalCheckboxIndex += processedContent.checkboxCount;
        
        return (
          <p key={`line-${lineIndex}`} className="mb-2 flex">
            <span className="mr-2">•</span>
            <span>{processedContent.content}</span>
          </p>
        );
      }
      
      // Processamento de checkboxes e links para linhas normais
      const processedLine = processLineContent(line, lineIndex, globalCheckboxIndex);
      // Atualiza o índice global
      globalCheckboxIndex += processedLine.checkboxCount;
      
      return (
        <p key={`line-${lineIndex}`} className="mb-2">
          {processedLine.content}
        </p>
      );
    });
  };
  
  // Processa o conteúdo de um bullet point
  const processBulletContent = (content: string, lineIndex: number, startCheckboxIndex: number) => {
    return processLineContent(content, lineIndex, startCheckboxIndex);
  };
  
  // Processa o conteúdo de uma linha (checkboxes e URLs)
  const processLineContent = (line: string, lineIndex: number, startCheckboxIndex: number) => {
    let segments = [];
    let lastIndex = 0;
    let checkboxCount = 0;
    
    // Regex para checkboxes e URLs
    const combinedRegex = /(\[([ x]?)\]|https?:\/\/[^\s]+)/g;
    let match;
    let lastCheckbox = null;
    
    // Para cada checkbox ou URL na linha
    while ((match = combinedRegex.exec(line)) !== null) {
      // Adiciona o texto antes do match
      if (match.index > lastIndex) {
        const textSegment = line.substring(lastIndex, match.index);
        // Se o último elemento foi um checkbox marcado, aplica o estilo taxado
        if (lastCheckbox && lastCheckbox.isChecked) {
          segments.push(
            <span 
              key={`text-${lineIndex}-${lastIndex}`}
              className="line-through text-muted-foreground"
            >
              {textSegment}
            </span>
          );
        } else {
          segments.push(<span key={`text-${lineIndex}-${lastIndex}`}>{textSegment}</span>);
        }
        lastCheckbox = null; // Reseta após processar o texto
      }
      
      // Verifica se é um checkbox
      if (match[0].startsWith('[')) {
        const isChecked = match[2] === 'x' || match[2] === 'X';
        const currentCheckboxIndex = startCheckboxIndex + checkboxCount;
        
        // Adiciona checkbox interativo com ícones menores e brancos
        segments.push(
          <span key={`checkbox-${lineIndex}-${match.index}`} className="inline-flex items-center align-middle">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Clicando no checkbox ${currentCheckboxIndex}, estado atual: ${isChecked}`);
                toggleCheckboxInDescription(currentCheckboxIndex);
              }}
              disabled={isEditMode}
              className="p-1 mr-1 inline-flex items-center justify-center focus:outline-none hover:bg-gray-800 rounded"
              aria-checked={isChecked}
              role="checkbox"
            >
              {isChecked ? (
                <CheckSquare className="h-3.5 w-3.5 text-white" />
              ) : (
                <Square className="h-3.5 w-3.5 text-white" />
              )}
            </button>
          </span>
        );
        
        // Guarda informação sobre este checkbox para aplicar estilo no texto que segue
        lastCheckbox = { isChecked };
        checkboxCount++;
      } 
      // Se for uma URL
      else if (match[0].match(/https?:\/\//)) {
        segments.push(
          <a 
            key={`url-${lineIndex}-${match.index}`}
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
    
    // Adiciona o texto restante após o último match
    if (lastIndex < line.length) {
      const restText = line.substring(lastIndex);
      if (lastCheckbox && lastCheckbox.isChecked) {
        segments.push(
          <span 
            key={`text-${lineIndex}-${lastIndex}`}
            className="line-through text-muted-foreground"
          >
            {restText}
          </span>
        );
      } else {
        segments.push(<span key={`text-${lineIndex}-${lastIndex}`}>{restText}</span>);
      }
    }
    
    // Retorna os segmentos e a contagem de checkboxes
    return {
      content: segments.length > 0 ? segments : line,
      checkboxCount
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditMode ? t("editTask") : t("taskDetails")}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? t("View and edit task details.") 
              : t("View task details.")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("title")}
            </label>
            {isEditMode ? (
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Task title")} />
            ) : (
              <p className="p-2 border rounded-md bg-muted/30">{title}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("description")}
            </label>
            {isEditMode ? (
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("Task description")}
                rows={8}
                className="min-h-[200px] text-base"
              />
            ) : (
              <div className="p-3 border rounded-md bg-muted/30 min-h-[200px] overflow-y-auto">
                {renderDescription()}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("dueDate")}
              </label>
              {isEditMode ? (
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
                  >
                    <div className="p-3">
                      <Calendar 
                        mode="single" 
                        selected={dueDate} 
                        onSelect={(date) => {
                          setDueDate(date);
                        }}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                      <div className="pt-3 pb-2 border-t mt-3">
                        <div className="flex flex-row items-center space-x-3 space-y-0 h-9">
                          <Checkbox
                            id="taskDetailAllDay"
                            checked={isAllDay}
                            onCheckedChange={(checked) => {
                              setIsAllDay(checked === true);
                              setTimeout(() => {
                                setDueTime(dueTime);
                              }, 0);
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
                            value={dueTime || "12:00"}
                            onChange={(e) => setDueTime(e.target.value || "12:00")}
                            className="w-full"
                            inputMode="none"
                            onClick={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.focus();
                            }}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-3" 
                        type="button"
                        onClick={() => {
                          setDatePickerOpen(false);
                        }}
                      >
                        {t("confirm")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="p-2 border rounded-md bg-muted/30">
                  {dueDate 
                    ? isAllDay 
                      ? format(dueDate, "PPP") 
                      : `${format(dueDate, "PPP")} - ${dueTime || "12:00"}`
                    : <span className="text-muted-foreground">{t("No due date")}</span>}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("priority")}
              </label>
              {isEditMode ? (
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
              ) : (
                <div className="p-2 border rounded-md bg-muted/30 flex items-center">
                  <Flag className={`mr-2 h-4 w-4 ${getPriorityColor(priority)}`} />
                  {getPriorityName(priority)}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("project")}
            </label>
            {isEditMode ? (
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
                      <Plus className="mr-1 h-3 w-3" />
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
            ) : (
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
            )}
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
                  <Save className="mr-1 h-4 w-4" />
                  {isSaving ? t("Saving...") : t("save")}
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsEditMode(true)}
                className="w-full sm:w-28"
              >
                <Edit className="mr-1 h-4 w-4" />
                {t("edit")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
