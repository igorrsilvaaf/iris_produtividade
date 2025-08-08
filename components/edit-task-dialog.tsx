"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Flag, Clock, X, Plus, CircleDot, ChevronDown, Check, Paperclip, Timer, Link, Image, FileText } from "lucide-react"
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
import { RichTextEditor } from "@/components/rich-text-editor"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  isAllDay: z.boolean().default(true),
  priority: z.string(),
  projectId: z.string().optional(),
  points: z.number().min(1).max(5).default(3),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string()
  })).default([]),
  estimatedTime: z.number().nullable().default(null),
  estimatedTimeUnit: z.string().default("min"),
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
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ type: string; url: string; name: string }>>([])
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [attachmentName, setAttachmentName] = useState("")
  const [attachmentType, setAttachmentType] = useState("link")
  const [showAddAttachment, setShowAddAttachment] = useState(false)
  const [fileUploadRef, setFileUploadRef] = useState<HTMLInputElement | null>(null)
  const [imageUploadRef, setImageUploadRef] = useState<HTMLInputElement | null>(null)

  const getTimeUnitAndValue = (minutes: number | null): { value: number | null, unit: string } => {
    if (minutes === null) return { value: null, unit: "min" }

    if (minutes % (60 * 8) === 0 && minutes >= 60 * 8) {
      return { value: minutes / (60 * 8), unit: "d" }
    } else if (minutes % 60 === 0 && minutes >= 60) {
      return { value: minutes / 60, unit: "h" }
    } else {
      return { value: minutes, unit: "min" }
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      const { value: estimatedTimeValue, unit: estimatedTimeUnit } = getTimeUnitAndValue(task.estimated_time || null);

      form.reset({
        title: task.title,
        description: task.description || "",
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        dueTime: task.due_date
          ? (() => {
              const date = new Date(task.due_date);
              const hours = date.getHours();
              const minutes = date.getMinutes();
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            })()
          : "00:00",
        isAllDay: task.due_date
          ? (() => {
              const date = new Date(task.due_date);
              return date.getHours() === 0 && date.getMinutes() === 0;
            })()
          : true,
        priority: task.priority.toString(),
        points: task.points || 3,
        attachments: task.attachments || [],
        estimatedTime: estimatedTimeValue,
        estimatedTimeUnit: estimatedTimeUnit,
        projectId: undefined, // Initialize as undefined
      });

      setAttachments(task.attachments || []);

      const fetchInitialData = async () => {
        setIsLoadingProjects(true);
        try {
          const [projectsResponse, taskProjectResponse] = await Promise.all([
            fetch("/api/projects"),
            task.id ? fetch(`/api/tasks/${task.id}/project`) : Promise.resolve(null)
          ]);

          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.projects);
          }

          if (taskProjectResponse && taskProjectResponse.ok) {
            const taskProjectData = await taskProjectResponse.json();
            if (taskProjectData.projectId) {
              form.setValue("projectId", taskProjectData.projectId.toString(), { shouldDirty: false });
            }
          }
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
        } finally {
          setIsLoadingProjects(false);
        }
      };

      fetchInitialData();
    }
  }, [open, task.id]); // Depend only on open and task.id

  const handleCreateProjectSuccess = () => {
    setShowCreateProject(false)
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data.projects)
        if (data.projects && data.projects.length > 0) {
          const newProject = data.projects[data.projects.length - 1];

          form.setValue("projectId", newProject.id.toString(), {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });

          setShowAddProject(false);

          setTimeout(() => {
            form.trigger("projectId");
          }, 100);
        }
      })
      .catch((error) => {
        console.error("Failed to refresh projects:", error)
      })
  }

  const addAttachment = () => {
    if (!attachmentUrl.trim()) return

    const newAttachment = {
      type: attachmentType,
      url: attachmentUrl.trim(),
      name: attachmentName.trim() || attachmentUrl.trim(),
    }

    const currentAttachments = [...attachments]
    const updatedAttachments = [...currentAttachments, newAttachment]
    setAttachments(updatedAttachments)
    form.setValue("attachments", updatedAttachments)
    setAttachmentUrl("")
    setAttachmentName("")
    setShowAddAttachment(false)
  }

  const removeAttachment = (index: number) => {
    const currentAttachments = [...attachments]
    currentAttachments.splice(index, 1)
    setAttachments(currentAttachments)
    form.setValue("attachments", currentAttachments)
  }

  const convertTimeToMinutes = (timeValue: number | null, unit: string): number | null => {
    if (timeValue === null) return null

    switch (unit) {
      case "h":
        return timeValue * 60
      case "d":
        return timeValue * 60 * 8
      default:
        return timeValue
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Para uma aplicação real, aqui você faria o upload do arquivo para um servidor
    // e obteria uma URL permanente. Por enquanto, vamos criar uma URL temporária local.
    const fileUrl = URL.createObjectURL(file)
    const fileName = file.name

    const newAttachment = {
      type: attachmentType,
      url: fileUrl,
      name: fileName,
    }

    const currentAttachments = [...attachments]
    const updatedAttachments = [...currentAttachments, newAttachment]
    setAttachments(updatedAttachments)
    form.setValue("attachments", updatedAttachments)
    setShowAddAttachment(false)

    // Limpar o input de arquivo
    if (event.target) {
      event.target.value = ""
    }
  }

  const triggerFileUpload = () => {
    if (attachmentType === "image") {
      imageUploadRef?.click()
    } else if (attachmentType === "file") {
      fileUploadRef?.click()
    }
  }

  import { useProjectsLabelsContext } from "@/contexts/projects-labels-context";

// ... (imports omitidos)

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { triggerUpdate } = useProjectsLabelsContext();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ type: string; url: string; name: string }>>([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState("link");
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [fileUploadRef, setFileUploadRef] = useState<HTMLInputElement | null>(null);
  const [imageUploadRef, setImageUploadRef] = useState<HTMLInputElement | null>(null);

  // ... (funções omitidas)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log("EditTaskDialog onSubmit - values:", values)

    try {
      let dueDateWithTime = null;

      if (values.dueDate) {
        if (values.isAllDay) {
          const date = new Date(values.dueDate);
          date.setHours(0, 0, 0, 0);
          dueDateWithTime = date.toISOString();

        } else if (values.dueTime) {
          const date = new Date(values.dueDate);
          const [hours, minutes] = values.dueTime.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);
          dueDateWithTime = date.toISOString();

        }
      }

      const estimatedTimeInMinutes = convertTimeToMinutes(values.estimatedTime, values.estimatedTimeUnit)

      const taskData = {
        title: values.title,
        description: values.description || null,
        due_date: dueDateWithTime,
        priority: Number.parseInt(values.priority),
        points: values.points,
        attachments: values.attachments,
        estimated_time: estimatedTimeInMinutes,
      };



      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });



      if (!taskResponse.ok) {

        throw new Error("Failed to update task details");
      }

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

      triggerUpdate();
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ... (resto do componente omitido)




  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="edit-task-dialog-content">
        <DialogHeader>
          <div className="flex items-center">
            <div className="md:hidden">
              <BackButton onClick={() => onOpenChange(false)} className="mr-2" data-testid="edit-task-back-button" />
            </div>
            <DialogTitle data-testid="edit-task-dialog-title">{t("editTask")}</DialogTitle>
          </div>
          <DialogDescription data-testid="edit-task-dialog-description">
            {t("Make changes to the task.")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="edit-task-form">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="edit-task-title-input"
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
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={(value) => {
                        field.onChange(value);
                        form.setValue('description', value);
                      }}
                      placeholder={t("Add details about your task")}
                      disabled={isLoading}
                      minHeight="200px"
                      className="w-full"
                      showActions={false}
                      dataTestid="edit-task-description-input"
                    />
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
                            data-testid="edit-task-due-date-button"
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
                      <PopoverContent className="w-auto p-0" align="start" side="bottom" data-testid="edit-task-date-picker">
                        <div className="p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t("pickDate")}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full"
                              onClick={() => setDatePickerOpen(false)}
                              data-testid="edit-task-date-picker-close"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">{t("close")}</span>
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setTimeout(() => setDatePickerOpen(false), 100);
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            data-testid="edit-task-calendar"
                          />
                          <div className="pt-3 pb-2 border-t mt-3">
                            <FormField
                              control={form.control}
                              name="isAllDay"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-9">
                                  <FormControl>
                                    <Checkbox
                                      data-testid="edit-task-all-day-checkbox"
                                      id="editTaskAllDay"
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        if (checked) {
                                          form.setValue("dueTime", "00:00");
                                        } else {
                                          form.setValue("dueTime", "00:00");
                                        }
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
                                      data-testid="edit-task-due-time-input"
                                      type="text"
                                      value={field.value || "00:00"}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (!value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) || /^([0-1]?[0-9]|2[0-3]):[0-5]?$/.test(value) || /^([0-1]?[0-9]|2[0-3])?$/.test(value)) {
                                          field.onChange(value || "00:00");
                                        }
                                      }}
                                      onBlur={(e) => {
                                        let value = e.target.value;
                                        if (!value) {
                                          field.onChange("00:00");
                                          return;
                                        }

                                        if (/^([0-1]?[0-9]|2[0-3])$/.test(value)) {
                                          value = `${value}:00`;
                                        }

                                        if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                                          const [hours, minutes] = value.split(':');
                                          const formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
                                          field.onChange(formattedTime);
                                        } else {
                                          field.onChange("00:00");
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
                        <SelectTrigger data-testid="edit-task-priority-select">
                          <SelectValue placeholder={t("Select priority")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent data-testid="edit-task-priority-content">
                        <SelectItem value="1" data-testid="edit-task-priority-1">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-red-500" />
                            {t("priority1")}
                          </div>
                        </SelectItem>
                        <SelectItem value="2" data-testid="edit-task-priority-2">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-orange-500" />
                            {t("priority2")}
                          </div>
                        </SelectItem>
                        <SelectItem value="3" data-testid="edit-task-priority-3">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-blue-500" />
                            {t("priority3")}
                          </div>
                        </SelectItem>
                        <SelectItem value="4" data-testid="edit-task-priority-4">
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
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("points") || "Pontos"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal"
                          type="button"
                        >
                          <div className="flex items-center">
                            <CircleDot className={`mr-2 h-4 w-4 ${
                              field.value === 1 ? "text-green-500" :
                              field.value === 2 ? "text-blue-500" :
                              field.value === 3 ? "text-yellow-500" :
                              field.value === 4 ? "text-orange-500" :
                              field.value === 5 ? "text-red-500" :
                              "text-muted-foreground"
                            }`} />
                            <span>{field.value} - {
                              field.value === 1 ? t("veryEasy") || "Muito fácil" :
                              field.value === 2 ? t("easy") || "Fácil" :
                              field.value === 3 ? t("medium") || "Médio" :
                              field.value === 4 ? t("hard") || "Difícil" :
                              field.value === 5 ? t("veryHard") || "Muito difícil" :
                              t("Select points") || "Selecione os pontos"
                            }</span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <div
                              key={value}
                              className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              onClick={() => field.onChange(value)}
                            >
                              {field.value === value && (
                                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                  <Check className="h-4 w-4" />
                                </span>
                              )}
                              <div className="flex items-center">
                                <CircleDot className={`mr-2 h-4 w-4 ${
                                  value === 1 ? "text-green-500" :
                                  value === 2 ? "text-blue-500" :
                                  value === 3 ? "text-yellow-500" :
                                  value === 4 ? "text-orange-500" :
                                  value === 5 ? "text-red-500" :
                                  "text-muted-foreground"
                                }`} />
                                {value} - {
                                  value === 1 ? t("veryEasy") || "Muito fácil" :
                                  value === 2 ? t("easy") || "Fácil" :
                                  value === 3 ? t("medium") || "Médio" :
                                  value === 4 ? t("hard") || "Difícil" :
                                  value === 5 ? t("veryHard") || "Muito difícil" :
                                  ""
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Time Field */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="estimatedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center space-x-2">
                            <Timer className="h-4 w-4" />
                            <span>{t("task.estimatedTime")}</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder={t("task.timeValue")}
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name="estimatedTimeUnit"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("task.timeUnit")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="min">{t("timeUnit.minutes")}</SelectItem>
                            <SelectItem value="h">{t("timeUnit.hours")}</SelectItem>
                            <SelectItem value="d">{t("timeUnit.days")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project")}</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {field.value && projects.find(p => p.id.toString() === field.value) ? (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-secondary">
                          <div className="flex items-center">
                            <div
                              style={{ backgroundColor: projects.find(p => p.id.toString() === field.value)?.color || "#ccc" }}
                              className="w-3 h-3 rounded-full mr-2"
                            />
                            <span className="text-sm font-medium">{projects.find(p => p.id.toString() === field.value)?.name || t("Unknown project")}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => field.onChange(undefined)}
                            className="h-6 w-6 ml-1"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">{t("Remove project")}</span>
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground px-2 py-1">{t("noProject")}</p>
                      )}
                    </div>

                    <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
                      <DialogTrigger asChild data-testid="edit-task-add-project-button">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full sm:w-auto"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          {field.value ? t("Change Project") : t("Add Project")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="z-[60]" onClick={(e) => e.stopPropagation()} data-testid="edit-task-add-project-dialog">
                        <DialogHeader>
                          <DialogTitle>{t("Add Project")}</DialogTitle>
                          <DialogDescription>{t("Select a project or create a new one.")}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                          {isLoadingProjects ? (
                            <div className="flex items-center justify-center p-4 gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span className="text-sm text-muted-foreground">{t("Loading projects...")}</span>
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
                                    style={{ backgroundColor: project.color }}
                                    className="w-4 h-4 rounded-full mr-2"
                                  />
                                  <span>{project.name}</span>
                                </div>
                                {field.value === project.id.toString() && <Check className="h-4 w-4" />}
                              </button>
                            ))
                          )}
                        </div>
                        <div className="mt-4 border-t pt-4 flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setShowAddProject(false)} data-testid="edit-task-cancel-add-project-button">
                            {t("Cancel")}
                          </Button>
                          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                            <DialogTrigger asChild>
                              <Button type="button" onClick={(e) => {
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

            {/* Seção de Anexos Corrigida */}
            <div className="space-y-2 mt-4">
              <FormLabel>
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4" />
                  <span>{t("attachment.list")}</span>
                </div>
              </FormLabel>

              {attachments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                      <div className="flex items-center space-x-2 truncate">
                        {attachment.type === "link" && <Link className="h-4 w-4" />}
                        {attachment.type === "image" && <Image className="h-4 w-4" />}
                        {attachment.type === "file" && <FileText className="h-4 w-4" />}
                        <span className="truncate">{attachment.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showAddAttachment ? (
                <div className="space-y-2 border rounded-md p-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={attachmentType === "link" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAttachmentType("link")}
                      className="w-full"
                    >
                      Link
                    </Button>
                    <Button
                      type="button"
                      variant={attachmentType === "image" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAttachmentType("image")}
                      className="w-full"
                    >
                      Imagem
                    </Button>
                    <Button
                      type="button"
                      variant={attachmentType === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAttachmentType("file")}
                      className="w-full"
                    >
                      Arquivo
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
                        placeholder="Nome (opcional)"
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
                          Adicionar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddAttachment(false)
                            setAttachmentUrl("")
                            setAttachmentName("")
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept={attachmentType === "image" ? "image/*" : "*/*"}
                        className="hidden"
                        onChange={handleFileUpload}
                        ref={node => attachmentType === "image" ? setImageUploadRef(node) : setFileUploadRef(node)}
                        aria-label="Selecionar arquivo"
                      />
                      <Button
                        type="button"
                        onClick={triggerFileUpload}
                        className="w-full"
                        size="sm"
                      >
                        {attachmentType === "image" ? "Selecionar Imagem" : "Selecionar Arquivo"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddAttachment(false)}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowAddAttachment(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Add Attachment") || "Adicionar Anexo"}
                </Button>
              )}
            </div>

            {/* Inputs de arquivo ocultos */}
            <input
              type="file"
              ref={(el) => setFileUploadRef(el)}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              aria-label="Upload de arquivo"
            />

            <input
              type="file"
              ref={(el) => setImageUploadRef(el)}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              aria-label="Upload de imagem"
            />

            <DialogFooter className="pt-2 sm:pt-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("Cancel") || "Cancelar"}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("task.updating") : t("task.update")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
