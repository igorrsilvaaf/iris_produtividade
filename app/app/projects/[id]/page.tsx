import { requireAuth } from "@/lib/auth"
import { getProject, getProjectTasks } from "@/lib/projects"
import { TaskList } from "@/components/task-list"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { DeleteProjectDialog } from "@/components/delete-project-dialog"
import { ToggleProjectFavorite } from "@/components/toggle-project-favorite"
import { ProjectHeaderActions } from "@/components/project-header-actions"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const resolvedParams = await params
  const projectId = Number.parseInt(resolvedParams.id)

  const project = await getProject(projectId, session.user.id)
  const tasks = await getProjectTasks(projectId, session.user.id)

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: project.color }}></div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <ProjectHeaderActions project={project} />
      </div>

      <TaskList initialTasks={tasks} />
    </div>
  )
}

