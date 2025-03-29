"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Flag, Trash } from "lucide-react"
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

interface TaskDetailProps {
  task: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(task.due_date ? new Date(task.due_date) : undefined)
  const [priority, setPriority] = useState(task.priority.toString())
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }
        const data = await response.json()
        setProjects(data.projects)

        // Fetch the task's project
        const projectResponse = await fetch(`/api/tasks/${task.id}/project`)
        if (projectResponse.ok) {
          const projectData = await projectResponse.json()
          setProjectId(projectData.projectId ? projectData.projectId.toString() : null)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("Failed to load projects"),
          description: t("Please try again later."),
        })
      }
    }

    if (open) {
      fetchProjects()
    }
  }, [open, task.id, toast, t])

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Update task details
      const taskResponse = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          due_date: dueDate ? dueDate.toISOString() : null,
          priority: Number.parseInt(priority),
        }),
      })

      if (!taskResponse.ok) {
        throw new Error("Failed to update task")
      }

      // Update task project
      const projectResponse = await fetch(`/api/tasks/${task.id}/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId ? Number.parseInt(projectId) : null,
        }),
      })

      if (!projectResponse.ok) {
        throw new Error("Failed to update task project")
      }

      toast({
        title: t("taskUpdated"),
        description: t("Task has been updated successfully."),
      })

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

  const handleDelete = async () => {
    setIsLoading(true)

    try {
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

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("taskDetails")}</DialogTitle>
          <DialogDescription>{t("View and edit task details.")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              {t("title")}
            </label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Task title")} />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              {t("description")}
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Task description")}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                {t("dueDate")}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="dueDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {dueDate ? format(dueDate, "PPP") : <span className="text-muted-foreground">{t("pickDate")}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={dueDate} 
                    onSelect={(date) => setDueDate(date)} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
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
                      {t("priority1")}
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center">
                      <Flag className={`mr-2 h-4 w-4 ${getPriorityColor("2")}`} />
                      {t("priority2")}
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center">
                      <Flag className={`mr-2 h-4 w-4 ${getPriorityColor("3")}`} />
                      {t("priority3")}
                    </div>
                  </SelectItem>
                  <SelectItem value="4">
                    <div className="flex items-center">
                      <Flag className={`mr-2 h-4 w-4 ${getPriorityColor("4")}`} />
                      {t("priority4")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium">
              {t("project")}
            </label>
            <Select
              value={projectId || "none"}
              onValueChange={(value) => setProjectId(value === "none" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectProject")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("noProject")}</SelectItem>
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
          </div>

          <TaskLabels taskId={task.id} />

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
        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
            <Trash className="mr-2 h-4 w-4" />
            {t("delete")}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? t("Saving...") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

