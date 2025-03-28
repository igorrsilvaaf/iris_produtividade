import { requireAuth } from "@/lib/auth"
import { getProject, getProjectTasks } from "@/lib/projects"
import { TaskList } from "@/components/task-list"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { DeleteProjectDialog } from "@/components/delete-project-dialog"
import { ToggleProjectFavorite } from "@/components/toggle-project-favorite"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await requireAuth()
  const projectId = Number.parseInt(params.id)

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
        <div className="flex items-center gap-2">
          <ToggleProjectFavorite project={project} />
          <EditProjectDialog project={project}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Project</span>
            </Button>
          </EditProjectDialog>
          <DeleteProjectDialog projectId={project.id} projectName={project.name}>
            <Button variant="outline" size="icon">
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete Project</span>
            </Button>
          </DeleteProjectDialog>
          <AddTaskDialog initialProjectId={project.id}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </AddTaskDialog>
        </div>
      </div>

      <TaskList tasks={tasks} />
    </div>
  )
}

