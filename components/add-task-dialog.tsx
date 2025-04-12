"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Flag, Tag, X, Clock, Plus } from "lucide-react"
import { format } from "date-fns"
import type { Project } from "@/lib/projects"
import type { Label } from "@/lib/labels"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"

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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { LabelForm } from "@/components/label-form"
import { ProjectForm } from "@/components/project-form"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  isAllDay: z.boolean().default(true),
  priority: z.string().default("4"),
  projectId: z.string().optional(),
  labelIds: z.array(z.number()).default([]),
})

interface AddTaskDialogProps {
  children: React.ReactNode
  initialProjectId?: number
  initialLanguage: string
}

export function AddTaskDialog({ children, initialProjectId, initialLanguage }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingLabels, setIsLoadingLabels] = useState(false)
  const [showAddLabel, setShowAddLabel] = useState(false)
  const [showCreateLabel, setShowCreateLabel] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t, setLanguage } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage as "en" | "pt")
    }
  }, [initialLanguage, setLanguage])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      dueTime: "12:00",
      isAllDay: true,
      priority: "4",
      projectId: initialProjectId ? initialProjectId.toString() : undefined,
      labelIds: [],
    },
  })

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

    const fetchLabels = async () => {
      setIsLoadingLabels(true)
      try {
        const response = await fetch("/api/labels")
        if (response.ok) {
          const data = await response.json()
          setLabels(data.labels)
        }
      } catch (error) {
        console.error("Failed to fetch labels:", error)
      } finally {
        setIsLoadingLabels(false)
      }
    }

    if (open) {
      fetchProjects()
      fetchLabels()
    }
  }, [open])

  const toggleLabel = (label: Label) => {
    const labelIds = form.getValues("labelIds") || []

    if (labelIds.includes(label.id)) {
      // Remove label
      const updatedLabelIds = labelIds.filter((id) => id !== label.id)
      form.setValue("labelIds", updatedLabelIds)
      setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id))
    } else {
      // Add label
      form.setValue("labelIds", [...labelIds, label.id])
      setSelectedLabels([...selectedLabels, label])
    }
  }

  const removeLabel = (labelId: number) => {
    const labelIds = form.getValues("labelIds") || []
    const updatedLabelIds = labelIds.filter((id) => id !== labelId)
    form.setValue("labelIds", updatedLabelIds)
    setSelectedLabels(selectedLabels.filter((l) => l.id !== labelId))
  }

  const handleCreateLabelSuccess = () => {
    setShowCreateLabel(false)
    // Refresh labels
    fetch("/api/labels")
      .then((response) => response.json())
      .then((data) => {
        setLabels(data.labels)
      })
      .catch((error) => {
        console.error("Failed to refresh labels:", error)
      })
  }

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
    setIsLoading(true)
    try {
      let dueDateTime = null;
      
      if (values.dueDate) {
        // Clone da data para evitar problemas de referência
        const date = new Date(values.dueDate);
        
        if (values.isAllDay) {
          // Para dia todo, definir para meia-noite UTC
          date.setUTCHours(0, 0, 0, 0);
          dueDateTime = date.toISOString();
          console.log(`[AddTask] Data para dia todo: ${dueDateTime}`);
        } else if (values.dueTime) {
          // Para hora específica, converter para UTC
          const [hours, minutes] = values.dueTime.split(':').map(Number);
          
          // Definir a hora considerando o fuso
          date.setHours(hours, minutes, 0, 0);
          dueDateTime = date.toISOString();
          
          console.log(`[AddTask] Data com hora específica: ${dueDateTime}`);
        }
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          dueDate: dueDateTime,
          priority: Number.parseInt(values.priority),
          projectId: values.projectId && values.projectId !== "noProject" ? Number.parseInt(values.projectId) : null,
          labelIds: values.labelIds,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      toast({
        title: t("taskCreated"),
        description: t("Your task has been created successfully."),
      })

      form.reset()
      setSelectedLabels([])
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to create task"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("addTask")}</DialogTitle>
          <DialogDescription>{t("Create a new task to keep track of your work.")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Task title")} {...field} />
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
                    <Textarea 
                      placeholder={t("Add details about your task")} 
                      className="min-h-[200px] text-base"
                      rows={8}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                : `${format(field.value, "PPP")} - ${form.watch("dueTime") || "12:00"}`
                              : <span>{t("pickDate")}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <div className="p-3">
                          <Calendar 
                            mode="single" 
                            selected={field.value} 
                            onSelect={(date) => {
                              field.onChange(date);
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
                                      id="isAllDay"
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        // Força uma re-renderização para dispositivos iOS
                                        if (typeof window !== 'undefined') {
                                          setTimeout(() => {
                                            form.trigger("dueTime");
                                          }, 0);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer" htmlFor="isAllDay">
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
                                      type="time" 
                                      value={field.value || "12:00"}
                                      onChange={(e) => field.onChange(e.target.value || "12:00")}
                                      className="w-full"
                                      inputMode="none"
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
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                          <Button 
                            className="w-full mt-3" 
                            type="button"
                            onClick={() => {
                              // Feche o popover usando o estado
                              setDatePickerOpen(false);
                            }}
                          >
                            {t("confirm")}
                          </Button>
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

            <FormField
              control={form.control}
              name="labelIds"
              render={() => (
                <FormItem>
                  <FormLabel>{t("Labels")}</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 min-h-[36px] p-1">
                      {selectedLabels.map((label) => (
                        <Badge
                          key={label.id}
                          style={{
                            backgroundColor: label.color,
                            color: label.text_color || "#ffffff",
                          }}
                          className="flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          {label.name}
                          <button 
                            type="button"
                            onClick={() => removeLabel(label.id)}
                            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                            aria-label={`Remove ${label.name} label`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {selectedLabels.length === 0 && (
                        <span className="text-sm text-muted-foreground">{t("No labels selected")}</span>
                      )}
                    </div>
                    <Dialog open={showAddLabel} onOpenChange={setShowAddLabel}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2" id="addLabelBtn">
                          <Plus className="mr-1 h-3 w-3" />
                          {t("Add Label")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="z-[60]" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                          <DialogTitle>{t("Add Label")}</DialogTitle>
                          <DialogDescription>{t("Select a label to add to this task.")}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                          {isLoadingLabels ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                          ) : labels.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("No labels found.")}</p>
                          ) : (
                            labels
                              .filter((label) => !selectedLabels.some((l) => l.id === label.id))
                              .map((label) => (
                                <button
                                  key={label.id}
                                  type="button"
                                  className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                                  onClick={() => {
                                    toggleLabel(label);
                                    setShowAddLabel(false);
                                  }}
                                >
                                  <div className="flex items-center">
                                    <div
                                      className="w-4 h-4 rounded-full mr-2"
                                      style={{ backgroundColor: label.color }}
                                    />
                                    <span>{label.name}</span>
                                  </div>
                                </button>
                              ))
                          )}
                        </div>
                        <div className="mt-4 border-t pt-4 flex justify-between">
                          <Button variant="outline" onClick={() => setShowAddLabel(false)}>
                            {t("Cancel")}
                          </Button>
                          <Dialog open={showCreateLabel} onOpenChange={setShowCreateLabel}>
                            <DialogTrigger asChild>
                              <Button onClick={(e) => {
                                e.stopPropagation();
                                setShowCreateLabel(true);
                              }}>
                                {t("Create New Label")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="z-[70]" onClick={(e) => e.stopPropagation()}>
                              <DialogHeader>
                                <DialogTitle>{t("Create New Label")}</DialogTitle>
                                <DialogDescription>
                                  {t("Fill in the details to create a new label.")}
                                </DialogDescription>
                              </DialogHeader>
                              <LabelForm onSuccess={handleCreateLabelSuccess} />
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
            <DialogFooter className="pt-2 sm:pt-0">
              <Button type="submit" className="ml-auto" disabled={isLoading}>
                {isLoading ? t("creating") : t("createTask")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

