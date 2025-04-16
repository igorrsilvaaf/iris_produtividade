"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Flag, Clock, X, Plus } from "lucide-react"
import { format } from "date-fns"
import type { Todo } from "@/lib/todos"
import type { Project } from "@/lib/projects"
import { useTranslation } from "@/lib/i18n"
import { useState, useEffect } from "react"

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { ProjectForm } from "@/components/project-form"
import { BackButton } from "@/components/ui/back-button"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  isAllDay: z.boolean().default(true),
  priority: z.string(),
  projectId: z.string().optional(),
})

interface EditTaskDialogProps {
  task: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [taskProjectId, setTaskProjectId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      dueTime: task.due_date 
        ? new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0
          ? "12:00" // Se for dia todo (00:00), define um horário padrão para o seletor
          : new Date(task.due_date).toTimeString().slice(0, 5)
        : "12:00",
      isAllDay: task.due_date 
        ? new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0
        : true,
      priority: task.priority.toString(),
      projectId: "noProject", // Valor padrão, será atualizado após carregar da API
    },
  })

  // Buscar o projeto da tarefa quando o diálogo for aberto
  useEffect(() => {
    const fetchTaskProject = async () => {
      if (!open || !task.id) return;
      
      try {
        const response = await fetch(`/api/tasks/${task.id}/project`);
        if (response.ok) {
          const data = await response.json();
          const projectId = data.projectId ? data.projectId.toString() : "noProject";
          setTaskProjectId(projectId !== "noProject" ? projectId : null);
          form.setValue("projectId", projectId);
        }
      } catch (error) {
        console.error("Failed to fetch task project:", error);
      }
    };

    fetchTaskProject();
  }, [open, task.id, form]);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true)
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    if (open) {
      fetchProjects()
    }
  }, [open])

  const handleCreateProjectSuccess = () => {
    setShowCreateProject(false)
    // Refresh projects
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data.projects)
      })
      .catch((error) => {
        console.error("Failed to refresh projects:", error)
      })
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Prepare due date with time
      let dueDateWithTime = null;
      
      if (values.dueDate) {
        if (values.isAllDay) {
          // Para o dia todo, força horário 00:00 UTC
          const date = new Date(values.dueDate);
          date.setHours(0, 0, 0, 0);
          dueDateWithTime = date.toISOString();
          console.log('[EditTask] Data para dia todo:', dueDateWithTime);
        } else if (values.dueTime) {
          // Combina data e hora
          const date = new Date(values.dueDate);
          const [hours, minutes] = values.dueTime.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);
          dueDateWithTime = date.toISOString();
          console.log('[EditTask] Data com hora específica:', dueDateWithTime);
        }
      }

      // Atualiza os detalhes da tarefa
      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          dueDate: dueDateWithTime,
          priority: Number.parseInt(values.priority),
        }),
      });

      if (!taskResponse.ok) {
        throw new Error("Failed to update task details");
      }

      // Atualiza o projeto da tarefa
      const projectId = values.projectId && values.projectId !== "noProject" 
        ? Number.parseInt(values.projectId) 
        : null;

      const projectResponse = await fetch(`/api/tasks/${task.id}/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId,
        }),
      });

      if (!projectResponse.ok) {
        throw new Error("Failed to update task project");
      }

      toast({
        title: t("taskUpdated"),
        description: t("Your task has been updated successfully."),
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center">
            <div className="md:hidden">
              <BackButton onClick={() => onOpenChange(false)} className="mr-2" />
            </div>
            <DialogTitle>{t("editTask")}</DialogTitle>
          </div>
          <DialogDescription>
            {t("Make changes to the task.")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("Task title")}
                      className="min-h-[80px] text-base"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add details about your task" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("dueDate")}</FormLabel>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value 
                              ? form.watch("isAllDay")
                                ? format(field.value, "PPP")
                                : `${format(field.value, "PPP")} ${form.watch("dueTime")}`
                              : <span>{t("pickDate")}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
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
                          <Calendar 
                            mode="single" 
                            selected={field.value} 
                            onSelect={(date) => {
                              field.onChange(date);
                              // Não fechamos o popover, permitindo ajustes adicionais
                            }}
                            initialFocus 
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                          <div className="pt-3 pb-2 border-t mt-3">
                            <FormField
                              control={form.control}
                              name="isAllDay"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-9">
                                  <FormControl>
                                    <Checkbox
                                      id="editTaskAllDay"
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        // Se ativar "dia todo", atualiza o horário para 00:00
                                        if (checked) {
                                          form.setValue("dueTime", "00:00");
                                        } else {
                                          // Se desativar, volta para 12:00 ou o horário atual
                                          form.setValue("dueTime", "12:00");
                                        }
                                        // Força uma re-renderização para dispositivos iOS
                                        if (typeof window !== 'undefined') {
                                          setTimeout(() => {
                                            form.trigger("dueTime");
                                          }, 0);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer" htmlFor="editTaskAllDay">
                                    {t("allDay")}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="dueTime"
                            render={({ field }) => (
                              <FormItem className={`mt-2 ${form.watch("isAllDay") ? "hidden" : ""}`}>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <FormControl>
                                    <Input 
                                      type="text" 
                                      value={field.value || "12:00"}
                                      onChange={(e) => {
                                        // Allow direct typing with validation
                                        const value = e.target.value;
                                        // Basic validation for time format
                                        if (!value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) || /^([0-1]?[0-9]|2[0-3]):[0-5]?$/.test(value) || /^([0-1]?[0-9]|2[0-3])?$/.test(value)) {
                                          field.onChange(value || "12:00");
                                        }
                                      }}
                                      onBlur={(e) => {
                                        // Format properly on blur
                                        let value = e.target.value;
                                        if (!value) {
                                          field.onChange("12:00");
                                          return;
                                        }
                                        
                                        // If just hours entered, add minutes
                                        if (/^([0-1]?[0-9]|2[0-3])$/.test(value)) {
                                          value = `${value}:00`;
                                        }
                                        
                                        // If valid time format, keep it
                                        if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                                          // Ensure 2-digit format for hours and minutes
                                          const [hours, minutes] = value.split(':');
                                          const formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
                                          field.onChange(formattedTime);
                                        } else {
                                          // Revert to default if invalid
                                          field.onChange("12:00");
                                        }
                                      }}
                                      className="w-full"
                                      placeholder="HH:MM"
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("priority")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select priority")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-red-500" />
                            {t("priority1")}
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-orange-500" />
                            {t("priority2")}
                          </div>
                        </SelectItem>
                        <SelectItem value="3">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-blue-500" />
                            {t("priority3")}
                          </div>
                        </SelectItem>
                        <SelectItem value="4">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-gray-400" />
                            {t("priority4")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project")}</FormLabel>
                  <div className="space-y-2">
                    {field.value && field.value !== "noProject" ? (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ 
                              backgroundColor: projects.find(p => p.id.toString() === field.value)?.color || "#ccc" 
                            }}
                          />
                          <span>{projects.find(p => p.id.toString() === field.value)?.name || t("Unknown project")}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange("noProject")}
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
                                  field.onChange(project.id.toString());
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{t("update")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

