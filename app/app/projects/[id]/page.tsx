import { requireAuth } from "@/lib/auth"
import { getProject, getProjectTasks } from "@/lib/projects"
import { ProjectPageClient } from "./project-page-client"

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

  return <ProjectPageClient project={project} tasks={tasks} />
}

