"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Flag, Trash, Clock, X, Save, Edit } from "lucide-react"
import type { Todo } from "@/lib/todos"
import type { Project } from "@/lib/projects"
import { useTranslation } from "@/lib/i18n"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { TaskLabels } from "@/components/task-labels"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"

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
  const [dueTime, setDueTime] = useState(() => getTimeFromDate(task.due_date))
  const [isAllDay, setIsAllDay] = useState(() => isAllDayDate(task.due_date))
  const [priority, setPriority] = useState(task.priority.toString())
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [projectName, setProjectName] = useState<string>("")
  const [taskLabelsKey, setTaskLabelsKey] = useState(0)
  const [projectsFetched, setProjectsFetched] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

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
      
      // Resetar projeto apenas se ainda não foi carregado
      if (!projectsFetched) {
        setProjectId(null)
        setProjectName("")
      }
    } else {
      // Quando o modal for fechado, resetar a flag de projetos carregados
      setProjectsFetched(false)
    }
  }, [open, task, projectsFetched])

  useEffect(() => {
    const fetchProjects = async () => {
      // Evitar buscar projetos novamente se já foram carregados
      if (!open || projectsFetched) {
        return;
      }

      try {
        console.log(`[TaskDetail] Carregando projetos para tarefa ${task.id}`);
        
        const response = await fetch("/api/projects")
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }
        const data = await response.json()
        setProjects(data.projects)

        const projectResponse = await fetch(`/api/tasks/${task.id}/project`)
        if (projectResponse.ok) {
          const projectData = await projectResponse.json()
          setProjectId(projectData.projectId ? projectData.projectId.toString() : null)
          
          // Find project name
          if (projectData.projectId) {
            const project = data.projects.find((p: Project) => p.id === projectData.projectId)
            if (project) {
              setProjectName(project.name)
            }
          }
        }
        
        // Marcar projetos como carregados
        setProjectsFetched(true);
        console.log(`[TaskDetail] Projetos carregados com sucesso para tarefa ${task.id}`);
      } catch (error) {
        console.error(`[TaskDetail] Erro ao carregar projetos:`, error);
        toast({
          variant: "destructive",
          title: t("Failed to load projects"),
          description: t("Please try again later."),
        })
      }
    }

    fetchProjects()
  }, [open, task.id, toast, t, projectsFetched])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      let dueDateWithTime = null;
      
      if (dueDate) {
        if (isAllDay) {
          dueDateWithTime = dueDate.toISOString().split('T')[0] + 'T00:00:00Z';
        } else {
          const date = new Date(dueDate);
          const [hours, minutes] = dueTime.split(':').map(Number);
          date.setHours(hours, minutes);
          dueDateWithTime = date.toISOString();
        }
      }

      console.log(`[TaskDetail] Salvando alterações para tarefa ${task.id}`);

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
      
      // Faz uma atualização seletiva sem recarregar a página inteira
      if (typeof window !== 'undefined') {
        console.log(`[TaskDetail] Tarefa ${task.id} atualizada com sucesso`);
      }
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
          router.push(router.asPath);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditMode ? t("editTask") : t("taskDetails")}</span>
            {!isEditMode && (
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("edit")}
              </Button>
            )}
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
                rows={4}
              />
            ) : (
              <div className="p-2 border rounded-md bg-muted/30 min-h-[80px]">
                {description ? (
                  <p className="whitespace-pre-wrap">{description}</p>
                ) : (
                  <p className="text-muted-foreground">{t("No description")}</p>
                )}
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
              <Select
                value={projectId || "noProject"}
                onValueChange={(value) => setProjectId(value === "noProject" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectProject")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noProject">{t("noProject")}</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <TaskLabels key={taskLabelsKey} taskId={task.id} />

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
        <DialogFooter className="flex justify-between items-center w-full">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="w-28"
          >
            <X className="mr-1 h-4 w-4" />
            {t("cancel")}
          </Button>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete} 
                  disabled={isDeleting}
                  className="w-28"
                >
                  <Trash className="mr-1 h-4 w-4" />
                  {isDeleting ? t("Deleting...") : t("delete")}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-28"
                >
                  <Save className="mr-1 h-4 w-4" />
                  {isSaving ? t("Saving...") : t("save")}
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsEditMode(true)}
                className="w-28"
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

